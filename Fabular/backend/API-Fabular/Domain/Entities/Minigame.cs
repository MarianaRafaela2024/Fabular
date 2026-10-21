namespace API_Fabular.Domain.Entities;

public class Minigame
{
    public int Id { get; private set; }
    public string Tipo { get; private set; }
    public string Enunciado { get; private set; }
    public IReadOnlyCollection<MinigameOpcao> Opcoes => _opcoes.AsReadOnly();
    public string RespostaCerta { get; private set; }

    private readonly List<MinigameOpcao> _opcoes = new();

    public Minigame(int id, string tipo, string enunciado, string respostaCerta, IEnumerable<MinigameOpcao>? opcoes = null)
    {
        Id = id;
        Tipo = string.IsNullOrWhiteSpace(tipo) ? throw new ArgumentException("Tipo é obrigatório.", nameof(tipo)) : tipo.Trim();
        Enunciado = string.IsNullOrWhiteSpace(enunciado) ? throw new ArgumentException("Enunciado é obrigatório.", nameof(enunciado)) : enunciado.Trim();
        RespostaCerta = string.IsNullOrWhiteSpace(respostaCerta) ? throw new ArgumentException("Resposta certa é obrigatória.", nameof(respostaCerta)) : respostaCerta.Trim();

        if (opcoes is not null)
        {
            _opcoes.AddRange(opcoes);
        }
    }
}
