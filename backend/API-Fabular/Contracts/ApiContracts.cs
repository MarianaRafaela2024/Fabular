namespace API_Fabular.Contracts;

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
    string? Tema
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
    StorySavePayload Story
);

public record StorySummaryDto(
    int Id,
    string Titulo,
    string Genero,
    int FaixaEtaria,
    string? Duracao,
    string? Emoji,
    string? Cena
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
