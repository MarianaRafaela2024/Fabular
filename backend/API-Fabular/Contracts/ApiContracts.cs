namespace API_Fabular.Contracts;
/**/
public record ParentRegisterRequest(string Nome, string? Sobrenome, string Email, string Senha);
public record ParentLoginRequest(string Email, string Senha);
public record ParentAuthResponse(int ResponsavelId, string Email, string Nome);
public record ParentForgotPasswordRequest(string Email);
public record ParentResetPasswordRequest(string Email, string Codigo, string NovaSenha);
public record ContactMessageRequest(string Nome, string Email, string Assunto, string Mensagem);

public record LocalChildDto(string LocalChildKey, string Nome, int FaixaEtaria, string? Avatar, string? GeneroFavorito, DateTime? CreatedAt);
public record LinkLocalChildrenRequest(int ResponsavelId, List<LocalChildDto> ChildrenLocal);
public record LinkedChildDto(string LocalChildKey, int CriancaId, string Status);

public record StoryGenerateRequest(
    int FaixaEtaria,
    string GeneroTextual,
    string PromptCrianca,
    int? CriancaId,
    string? Tema,
    int? ResponsavelId
);

public record StorySavePayload(
    string Titulo,
    string Genero,
    int FaixaEtaria,
    string? Duracao,
    string? Emoji,
    string? Cena,
    string Texto,
    List<string> PalavrasChave,
    List<MinigameDto> Minigames
);

public record StorySaveRequest(
    int CriancaId,
    string PromptCrianca,
    string? Modelo,
    StorySavePayload Story,
    int? ResponsavelId
);

public record StorySummaryDto(
    int Id,
    string Titulo,
    string Genero,
    int FaixaEtaria,
    string? Duracao,
    string? Emoji,
    string? Cena,
    int? CriancaId = null
);

public record StoryDetailDto(
    int Id,
    string Titulo,
    string Genero,
    int FaixaEtaria,
    string? Duracao,
    string? Emoji,
    string? Cena,
    string Texto,
    List<string> PalavrasChave,
    List<MinigameDto> Minigames
);

public record MinigameDto(
    string Tipo,
    string Pergunta,
    object Dados
);

public record SyncProgressRequest(
    int ResponsavelId,
    int CriancaId,
    int FaixaEtaria,
    object ProgressoHistorias,
    object ResumoMinigames,
    DateTime UpdatedAt
);

public record HistoriaProgressoDto(string Id, int Estrelas, string? Data, string? DataIso = null);

public record AtividadeDiariaDto(string Data, int Quantidade);

public record ProgressResponseDto(
    int TotalEstrelas,
    List<HistoriaProgressoDto> HistoriasLidas,
    int TempoTotal,
    int MinigamesJogados,
    int TentativasReprovadas,
    int AcertosMG,
    int ErrosMG,
    int NaoConsigoOuvir,
    List<AtividadeDiariaDto> AtividadeDiaria,
    DateTime? UpdatedAt
);
