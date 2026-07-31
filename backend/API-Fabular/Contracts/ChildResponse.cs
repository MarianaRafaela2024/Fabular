namespace API_Fabular.Contracts;

public class ChildResponse
{
    public int Id { get; set; }

    public string Nome { get; set; } = "";

    public byte FaixaEtaria { get; set; }

    public DateOnly? DataNascimento { get; set; }

    public string? Avatar { get; set; }

    public string? GeneroFavorito { get; set; }
}