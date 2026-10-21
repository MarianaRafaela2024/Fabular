using System.Security.Cryptography;
using System.Text;
using API_Fabular.Contracts;
using API_Fabular.Infra;
using Dapper;
using Microsoft.AspNetCore.Identity;

namespace API_Fabular.Services;

public class ParentAuthService
{
    private readonly DbConnectionFactory _db;
    private readonly BrevoEmailService _emailService;
    private readonly ChildrenLinkService _childrenLinkService;
    private readonly ILogger<ParentAuthService> _logger;
    private readonly PasswordHasher<object> _passwordHasher = new();

    public ParentAuthService(
        DbConnectionFactory db,
        BrevoEmailService emailService,
        ChildrenLinkService childrenLinkService,
        ILogger<ParentAuthService> logger)
    {
        _db = db;
        _emailService = emailService;
        _childrenLinkService = childrenLinkService;
        _logger = logger;
    }

    public async Task<ApplicationResult<ParentAuthResponse>> RegisterAsync(ParentRegisterRequest request)
    {
        if (!ValidacaoCampos.TentarNormalizarNome(request.Nome, out var nomeLimpo))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest(ValidacaoCampos.MensagemNome);
        }

        if (!ValidacaoCampos.TentarNormalizarSobrenome(request.Sobrenome, out var sobrenomeLimpo))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest("Sobrenome muito longo.");
        }

        if (!ValidacaoCampos.SenhaAtendeRegras(request.Senha, out var erroSenha))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest(erroSenha ?? ValidacaoCampos.MensagemSenha);
        }

        if (!ValidacaoCampos.TentarNormalizarTelefone(request.Telefone, out var telefone))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest(ValidacaoCampos.MensagemTelefone);
        }

        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest(ValidacaoCampos.MensagemEmail);
        }

        await using var conn = _db.Create();
        var existing = await conn.QueryFirstOrDefaultAsync<int?>("SELECT Id FROM Responsavel WHERE Email = @Email", new { Email = email });
        if (existing.HasValue)
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest(ValidacaoCampos.MensagemEmailDuplicado);
        }

        var sql = """
                  INSERT INTO Responsavel (Nome, Sobrenome, Telefone, Email, SenhaHash)
                  OUTPUT INSERTED.Id
                  VALUES (@Nome, @Sobrenome, @Telefone, @Email, @SenhaHash);
                  """;
        var cleanName = nomeLimpo!;
        var id = await conn.QuerySingleAsync<int>(sql, new
        {
            Nome = cleanName,
            Sobrenome = sobrenomeLimpo,
            Telefone = telefone,
            Email = email,
            SenhaHash = HashSenha(request.Senha)
        });

        return ApplicationResult<ParentAuthResponse>.Ok(new ParentAuthResponse(id, email!, cleanName));
    }

    public async Task<ApplicationResult<ParentAuthResponse>> LoginAsync(ParentLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Senha))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest("Email e senha são obrigatórios.");
        }

        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest(ValidacaoCampos.MensagemEmail);
        }

        await using var conn = _db.Create();
        var row = await conn.QueryFirstOrDefaultAsync<(int Id, string Nome, string SenhaHash)>(
            "SELECT Id, Nome, SenhaHash FROM Responsavel WHERE Email = @Email",
            new { Email = email });

        if (row.Id == 0 || !SenhaConfere(row.SenhaHash, request.Senha, out var precisaRehash))
        {
            return ApplicationResult<ParentAuthResponse>.Unauthorized("Credenciais inválidas.");
        }

        if (precisaRehash)
        {
            await conn.ExecuteAsync(
                "UPDATE Responsavel SET SenhaHash = @SenhaHash WHERE Id = @Id",
                new { SenhaHash = HashSenha(request.Senha), row.Id });
        }

        return ApplicationResult<ParentAuthResponse>.Ok(new ParentAuthResponse(row.Id, email!, row.Nome));
    }

    public async Task<ApplicationResult<bool>> RequestPasswordResetAsync(ParentForgotPasswordRequest request)
    {
        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email))
        {
            return ApplicationResult<bool>.BadRequest(ValidacaoCampos.MensagemEmail);
        }

        await using var conn = _db.Create();
        await conn.OpenAsync();
        await GarantirTabelaRecuperacaoAsync(conn);
        await LimparTokensExpiradosAsync(conn);

        var responsavelId = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT Id FROM Responsavel WHERE Email = @Email",
            new { Email = email });

        if (!responsavelId.HasValue)
        {
            _logger.LogInformation("Recuperação de senha solicitada para e-mail não cadastrado: {Email}", email);
            return ApplicationResult<bool>.Ok(true);
        }

        var codigo = await GerarCodigoUnicoAsync(conn);
        if (codigo is null)
        {
            return ApplicationResult<bool>.InternalError("Não foi possível gerar o código de recuperação.");
        }

        var tokenHash = HashCodigo(codigo);
        var expiraEm = DateTime.UtcNow.AddMinutes(15);

        await conn.ExecuteAsync(
            """
            UPDATE Recuperacao_Senha
            SET UsadoEm = SYSUTCDATETIME()
            WHERE Id_Responsavel = @Id AND UsadoEm IS NULL
            """,
            new { Id = responsavelId.Value });

        await conn.ExecuteAsync(
            """
            INSERT INTO Recuperacao_Senha (Id_Responsavel, TokenHash, ExpiraEm)
            VALUES (@Id, @TokenHash, @ExpiraEm)
            """,
            new { Id = responsavelId.Value, TokenHash = tokenHash, ExpiraEm = expiraEm });

        _logger.LogInformation("Código de recuperação de senha gerado para {Email}. Código: {Codigo}", email, codigo);

        if (!_emailService.IsConfigured())
        {
            _logger.LogError("Recuperação de senha pedida mas serviço Brevo não está configurado.");
            return ApplicationResult<bool>.InternalError("Serviço de e-mail não configurado.");
        }

        try
        {
            await _emailService.SendPasswordResetCodeAsync(email!, codigo);
            _logger.LogInformation("E-mail de recuperação de senha enviado com sucesso para {Email}.", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar e-mail de recuperação para {Email}.", email);
            return ApplicationResult<bool>.InternalError("Falha ao enviar e-mail de recuperação.");
        }

        return ApplicationResult<bool>.Ok(true);
    }

    public async Task<ApplicationResult<ParentProfileResponse>> GetProfileAsync(int responsavelId)
    {
        if (responsavelId <= 0)
        {
            return ApplicationResult<ParentProfileResponse>.BadRequest("Responsável inválido.");
        }

        await using var conn = _db.Create();
        var row = await conn.QueryFirstOrDefaultAsync<(int Id, string Nome, string? Sobrenome, string? Telefone, string Email)>(
            "SELECT Id, Nome, Sobrenome, Telefone, Email FROM Responsavel WHERE Id = @Id",
            new { Id = responsavelId });

        if (row.Id == 0)
        {
            return ApplicationResult<ParentProfileResponse>.NotFound("Responsável não encontrado.");
        }

        return ApplicationResult<ParentProfileResponse>.Ok(
            new ParentProfileResponse(row.Id, row.Nome, row.Sobrenome, row.Telefone, row.Email));
    }

    public async Task<ApplicationResult<ParentProfileResponse>> UpdateProfileAsync(int responsavelId, UpdateParentRequest request)
    {
        if (responsavelId <= 0)
        {
            return ApplicationResult<ParentProfileResponse>.BadRequest("Nome é obrigatório.");
        }

        if (!ValidacaoCampos.TentarNormalizarNome(request.Nome, out var nomeLimpo))
        {
            return ApplicationResult<ParentProfileResponse>.BadRequest(ValidacaoCampos.MensagemNome);
        }

        if (!ValidacaoCampos.TentarNormalizarSobrenome(request.Sobrenome, out var sobrenomeLimpo))
        {
            return ApplicationResult<ParentProfileResponse>.BadRequest("Sobrenome muito longo.");
        }

        await using var conn = _db.Create();
        var row = await conn.QueryFirstOrDefaultAsync<(int Id, string SenhaHash, string Email)>(
            "SELECT Id, SenhaHash, Email FROM Responsavel WHERE Id = @Id",
            new { Id = responsavelId });

        if (row.Id == 0)
        {
            return ApplicationResult<ParentProfileResponse>.NotFound("Responsável não encontrado.");
        }

        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var novoEmail))
        {
            return ApplicationResult<ParentProfileResponse>.BadRequest(ValidacaoCampos.MensagemEmail);
        }

        if (novoEmail != row.Email)
        {
            var emailEmUso = await conn.QueryFirstOrDefaultAsync<int?>(
                "SELECT Id FROM Responsavel WHERE Email = @Email AND Id <> @Id",
                new { Email = novoEmail, Id = responsavelId });
            if (emailEmUso.HasValue)
            {
                return ApplicationResult<ParentProfileResponse>.BadRequest(ValidacaoCampos.MensagemEmailDuplicado);
            }
        }

        string? novaSenhaHash = null;
        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            if (string.IsNullOrWhiteSpace(request.SenhaAtual))
            {
                return ApplicationResult<ParentProfileResponse>.BadRequest("Informe a senha atual para alterá-la.");
            }

            if (!ValidacaoCampos.SenhaAtendeRegras(request.NovaSenha, out var erroNovaSenha))
            {
                return ApplicationResult<ParentProfileResponse>.BadRequest(erroNovaSenha ?? ValidacaoCampos.MensagemSenha);
            }

            if (!SenhaConfere(row.SenhaHash, request.SenhaAtual, out _))
            {
                return ApplicationResult<ParentProfileResponse>.Unauthorized("Senha atual incorreta.");
            }

            novaSenhaHash = HashSenha(request.NovaSenha);
        }

        if (!ValidacaoCampos.TentarNormalizarTelefone(request.Telefone, out var telefone))
        {
            return ApplicationResult<ParentProfileResponse>.BadRequest(ValidacaoCampos.MensagemTelefone);
        }

        await conn.ExecuteAsync(
            """
            UPDATE Responsavel
            SET Nome = @Nome,
                Sobrenome = @Sobrenome,
                Telefone = @Telefone,
                Email = @Email,
                SenhaHash = COALESCE(@SenhaHash, SenhaHash)
            WHERE Id = @Id
            """,
            new
            {
                Id = responsavelId,
                Nome = nomeLimpo,
                Sobrenome = sobrenomeLimpo,
                Telefone = telefone,
                Email = novoEmail,
                SenhaHash = novaSenhaHash
            });

        return ApplicationResult<ParentProfileResponse>.Ok(
            new ParentProfileResponse(responsavelId, nomeLimpo!, sobrenomeLimpo, telefone, novoEmail!));
    }

    public async Task<ApplicationResult<bool>> VerifyResetCodeAsync(ParentVerifyResetCodeRequest request)
    {
        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email) || !TentarNormalizarCodigo(request.Codigo, out var codigo))
        {
            return ApplicationResult<bool>.BadRequest("Código inválido ou expirado.");
        }

        await using var conn = _db.Create();
        await conn.OpenAsync();
        await GarantirTabelaRecuperacaoAsync(conn);
        await LimparTokensExpiradosAsync(conn);

        var row = await BuscarRecuperacaoAsync(conn, email!, codigo, transaction: null);
        if (row.Id == 0 || row.UsadoEm.HasValue || row.ExpiraEm <= DateTime.UtcNow)
        {
            return ApplicationResult<bool>.BadRequest("Código inválido ou expirado.");
        }

        return ApplicationResult<bool>.Ok(true);
    }

    public async Task<ApplicationResult<bool>> ResetPasswordAsync(ParentResetPasswordRequest request)
    {
        if (!ValidacaoCampos.TentarNormalizarEmail(request.Email, out var email) || !TentarNormalizarCodigo(request.Codigo, out var codigo))
        {
            return ApplicationResult<bool>.BadRequest("Código inválido ou expirado.");
        }

        if (!ValidacaoCampos.SenhaAtendeRegras(request.NovaSenha, out var erroSenhaReset))
        {
            return ApplicationResult<bool>.BadRequest(erroSenhaReset ?? ValidacaoCampos.MensagemSenha);
        }

        await using var conn = _db.Create();
        await conn.OpenAsync();
        await GarantirTabelaRecuperacaoAsync(conn);
        await LimparTokensExpiradosAsync(conn);
        await using var tx = await conn.BeginTransactionAsync();

        var row = await BuscarRecuperacaoAsync(conn, email!, codigo, tx);

        if (row.Id == 0 || row.UsadoEm.HasValue || row.ExpiraEm <= DateTime.UtcNow)
        {
            await tx.RollbackAsync();
            return ApplicationResult<bool>.BadRequest("Código inválido ou expirado.");
        }

        await conn.ExecuteAsync(
            "UPDATE Responsavel SET SenhaHash = @SenhaHash WHERE Id = @Id",
            new { Id = row.IdResponsavel, SenhaHash = HashSenha(request.NovaSenha) },
            tx);

        await conn.ExecuteAsync(
            "UPDATE Recuperacao_Senha SET UsadoEm = SYSUTCDATETIME() WHERE Id = @Id",
            new { row.Id },
            tx);

        await tx.CommitAsync();
        return ApplicationResult<bool>.Ok(true);
    }

    public async Task<ApplicationResult<bool>> DeleteAccountAsync(int responsavelId)
    {
        if (responsavelId <= 0)
        {
            return ApplicationResult<bool>.BadRequest("Identificador inválido.");
        }

        await using var conn = _db.Create();
        await conn.OpenAsync();

        var existe = await conn.QueryFirstOrDefaultAsync<int?>(
            "SELECT Id FROM Responsavel WHERE Id = @Id",
            new { Id = responsavelId });
        if (!existe.HasValue)
        {
            return ApplicationResult<bool>.NotFound("Responsável não encontrado.");
        }

        var childIds = (await conn.QueryAsync<int>(
            "SELECT Id_Crianca FROM Responsavel_Crianca WHERE Id_Responsavel = @Id",
            new { Id = responsavelId })).ToList();

        await using var tx = await conn.BeginTransactionAsync();
        foreach (var childId in childIds)
        {
            await _childrenLinkService.ExcluirDadosDaCriancaAsync(conn, tx, childId);
        }

        await conn.ExecuteAsync(
            """
            IF OBJECT_ID(N'dbo.Sincronizacao_Progresso', N'U') IS NOT NULL
                DELETE FROM dbo.Sincronizacao_Progresso WHERE Id_Responsavel = @Id
            """,
            new { Id = responsavelId },
            tx);

        await conn.ExecuteAsync(
            """
            IF OBJECT_ID(N'dbo.Progresso_Snapshot', N'U') IS NOT NULL
                DELETE FROM dbo.Progresso_Snapshot WHERE Id_Responsavel = @Id
            """,
            new { Id = responsavelId },
            tx);

        await conn.ExecuteAsync(
            "DELETE FROM Responsavel_Crianca WHERE Id_Responsavel = @Id",
            new { Id = responsavelId },
            tx);

        await conn.ExecuteAsync(
            "DELETE FROM Responsavel WHERE Id = @Id",
            new { Id = responsavelId },
            tx);

        await tx.CommitAsync();
        return ApplicationResult<bool>.Ok(true);
    }

    private async Task GarantirTabelaRecuperacaoAsync(System.Data.Common.DbConnection conn)
    {
        await conn.ExecuteAsync(
            """
            IF OBJECT_ID(N'dbo.Recuperacao_Senha', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.Recuperacao_Senha (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Id_Responsavel INT NOT NULL,
                    TokenHash CHAR(64) NOT NULL,
                    ExpiraEm DATETIME2 NOT NULL,
                    UsadoEm DATETIME2 NULL,
                    CriadoEm DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT FK_RecuperacaoSenha_Responsavel
                        FOREIGN KEY (Id_Responsavel) REFERENCES dbo.Responsavel (Id) ON DELETE CASCADE
                );
                CREATE UNIQUE INDEX UX_Recuperacao_Senha_TokenHash ON dbo.Recuperacao_Senha (TokenHash);
            END
            """);
    }

    private string HashSenha(string senha) => _passwordHasher.HashPassword(new object(), senha);

    private bool SenhaConfere(string? storedHash, string senha, out bool precisaRehash)
    {
        precisaRehash = false;
        if (string.IsNullOrWhiteSpace(storedHash))
            return false;

        try
        {
            var resultado = _passwordHasher.VerifyHashedPassword(new object(), storedHash, senha);
            if (resultado == PasswordVerificationResult.SuccessRehashNeeded)
            {
                precisaRehash = true;
                return true;
            }

            if (resultado == PasswordVerificationResult.Success)
                return true;
        }
        catch (FormatException)
        {
            // Hash legado (SHA-256 em hexadecimal).
        }

        if (string.Equals(storedHash, HashCodigo(senha), StringComparison.OrdinalIgnoreCase))
        {
            precisaRehash = true;
            return true;
        }

        return false;
    }

    /// <summary>
    /// Remove tokens de recuperação já usados ou expirados há mais de 24 h.
    /// Executado oportunisticamente em cada pedido de reset para evitar acúmulo.
    /// </summary>
    private static async Task LimparTokensExpiradosAsync(System.Data.Common.DbConnection conn)
    {
        try
        {
            await conn.ExecuteAsync(
                """
                IF OBJECT_ID(N'dbo.Recuperacao_Senha', N'U') IS NOT NULL
                    DELETE FROM dbo.Recuperacao_Senha
                    WHERE UsadoEm IS NOT NULL
                       OR ExpiraEm < SYSUTCDATETIME()
                """);
        }
        catch
        {
            // Limpeza opcional — falha silenciosa para não bloquear o fluxo principal.
        }
    }

    private static async Task<string?> GerarCodigoUnicoAsync(System.Data.Common.DbConnection conn)
    {
        for (var tentativa = 0; tentativa < 10; tentativa++)
        {
            var codigo = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
            var tokenHash = HashCodigo(codigo);
            var existe = await conn.QueryFirstOrDefaultAsync<int?>(
                """
                SELECT 1
                FROM Recuperacao_Senha
                WHERE TokenHash = @TokenHash
                """,
                new { TokenHash = tokenHash });
            if (!existe.HasValue)
            {
                return codigo;
            }
        }

        return null;
    }

    private static async Task<(int Id, int IdResponsavel, DateTime ExpiraEm, DateTime? UsadoEm)> BuscarRecuperacaoAsync(
        System.Data.Common.DbConnection conn,
        string email,
        string codigo,
        System.Data.IDbTransaction? transaction)
    {
        return await conn.QueryFirstOrDefaultAsync<(int Id, int IdResponsavel, DateTime ExpiraEm, DateTime? UsadoEm)>(
            """
            SELECT TOP 1 r.Id, r.Id_Responsavel AS IdResponsavel, r.ExpiraEm, r.UsadoEm
            FROM Recuperacao_Senha r
            INNER JOIN Responsavel p ON p.Id = r.Id_Responsavel
            WHERE r.TokenHash = @TokenHash AND p.Email = @Email
            ORDER BY r.Id DESC
            """,
            new { TokenHash = HashCodigo(codigo), Email = email },
            transaction);
    }

    private static bool TentarNormalizarCodigo(string? raw, out string codigo)
    {
        codigo = "";
        if (string.IsNullOrWhiteSpace(raw))
        {
            return false;
        }

        var digits = new string(raw.Where(char.IsDigit).ToArray());
        if (digits.Length != 6)
        {
            return false;
        }

        codigo = digits;
        return true;
    }

    private static string HashCodigo(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }
}
