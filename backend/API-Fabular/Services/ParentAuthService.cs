using System.Security.Cryptography;
using System.Text;
using API_Fabular.Contracts;
using API_Fabular.Infra;
using Dapper;
using Microsoft.Extensions.Caching.Memory;

namespace API_Fabular.Services;

public class ParentAuthService
{
    private readonly DbConnectionFactory _db;
    private readonly IMemoryCache _memoryCache;
    private readonly BrevoEmailService _emailService;
    private readonly ILogger<ParentAuthService> _logger;
    private const string ResetPrefix = "reset-code:";

    public ParentAuthService(DbConnectionFactory db, IMemoryCache memoryCache, BrevoEmailService emailService, ILogger<ParentAuthService> logger)
    {
        _db = db;
        _memoryCache = memoryCache;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ApplicationResult<ParentAuthResponse>> RegisterAsync(ParentRegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha) || string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Telefone))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest("Nome, telefone, email e senha são obrigatórios.");
        }

        var telefone = new string(request.Telefone.Where(char.IsDigit).ToArray());
        if (telefone.Length < 10 || telefone.Length > 11)
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest("Informe um telefone válido com DDD.");
        }

        await using var conn = _db.Create();
        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await conn.QueryFirstOrDefaultAsync<int?>("SELECT Id FROM Responsavel WHERE Email = @Email", new { Email = email });
        if (existing.HasValue)
        {
            return ApplicationResult<ParentAuthResponse>.Conflict("E-mail já cadastrado.");
        }

        var sql = """
                  INSERT INTO Responsavel (Nome, Sobrenome, Telefone, Email, SenhaHash)
                  OUTPUT INSERTED.Id
                  VALUES (@Nome, @Sobrenome, @Telefone, @Email, @SenhaHash);
                  """;
        var cleanName = request.Nome.Trim();
        var id = await conn.QuerySingleAsync<int>(sql, new
        {
            Nome = cleanName,
            Sobrenome = request.Sobrenome?.Trim(),
            Telefone = telefone,
            Email = email,
            SenhaHash = Hash(request.Senha)
        });

        return ApplicationResult<ParentAuthResponse>.Ok(new ParentAuthResponse(id, email, cleanName));
    }

    public async Task<ApplicationResult<ParentAuthResponse>> LoginAsync(ParentLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return ApplicationResult<ParentAuthResponse>.BadRequest("Email e senha são obrigatórios.");
        }

        await using var conn = _db.Create();
        var email = request.Email.Trim().ToLowerInvariant();
        var row = await conn.QueryFirstOrDefaultAsync<(int Id, string Nome, string SenhaHash)>(
            "SELECT Id, Nome, SenhaHash FROM Responsavel WHERE Email = @Email",
            new { Email = email });

        if (row.Id == 0 || row.SenhaHash != Hash(request.Senha))
        {
            return ApplicationResult<ParentAuthResponse>.Unauthorized("Credenciais inválidas.");
        }

        return ApplicationResult<ParentAuthResponse>.Ok(new ParentAuthResponse(row.Id, email, row.Nome));
    }

    public async Task<ApplicationResult<bool>> RequestPasswordResetAsync(ParentForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApplicationResult<bool>.BadRequest("Email é obrigatório.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        await using var conn = _db.Create();
        var exists = await conn.QueryFirstOrDefaultAsync<int?>("SELECT Id FROM Responsavel WHERE Email = @Email", new { Email = email });
        if (!exists.HasValue)
        {
            // Retorna sucesso para não expor se email existe ou não.
            return ApplicationResult<bool>.Ok(true);
        }

        if (!_emailService.IsConfigured())
        {
            _logger.LogError("Tentativa de recuperação sem Brevo SMTP configurado para {Email}", email);
            return ApplicationResult<bool>.InternalError("Serviço de recuperação indisponível no momento.");
        }

        var codigo = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

        _logger.LogInformation(
            "Código gerado para {Email}: {Codigo}",
            email,
            codigo);

        _memoryCache.Set(
            GetResetKey(email),
            Hash(codigo),
            TimeSpan.FromMinutes(10));

        try
        {
            await _emailService.SendPasswordResetCodeAsync(email, codigo);
            return ApplicationResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Falha ao enviar e-mail de recuperação para {Email}",
                email);

            return ApplicationResult<bool>.InternalError(
                ex.ToString());
        }
    }

    public async Task<ApplicationResult<bool>> ResetPasswordAsync(ParentResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Codigo) ||
            string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            return ApplicationResult<bool>.BadRequest("Email, código e nova senha são obrigatórios.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var cacheKey = GetResetKey(email);
        if (!_memoryCache.TryGetValue(cacheKey, out string? codigoHash) || codigoHash != Hash(request.Codigo.Trim()))
        {
            return ApplicationResult<bool>.BadRequest("Código inválido ou expirado.");
        }

        await using var conn = _db.Create();
        var rows = await conn.ExecuteAsync(
            "UPDATE Responsavel SET SenhaHash = @SenhaHash WHERE Email = @Email",
            new { Email = email, SenhaHash = Hash(request.NovaSenha) });
        if (rows <= 0)
        {
            return ApplicationResult<bool>.NotFound("Responsável não encontrado.");
        }

        _memoryCache.Remove(cacheKey);
        return ApplicationResult<bool>.Ok(true);
    }

    private static string GetResetKey(string email) => $"{ResetPrefix}{email}";

    private static string Hash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }
}
