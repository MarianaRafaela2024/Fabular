namespace API_Fabular.Domain.Entities;

public class MinigameOpcao
{
    public int Id { get; private set; }
    public string Texto { get; private set; }

    public MinigameOpcao(int id, string texto)
    {
        Id = id;
        Texto = string.IsNullOrWhiteSpace(texto) ? throw new ArgumentException("Texto da opção é obrigatório.", nameof(texto)) : texto.Trim();
    }
}
