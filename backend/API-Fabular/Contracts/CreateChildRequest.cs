namespace API_Fabular.Contracts;

public class CreateChildRequest
{
    public int ResponsavelId { get; set; }

    public string Nome { get; set; } = "";

    public byte FaixaEtaria { get; set; }

    public string? Avatar { get; set; }

    public string? GeneroFavorito { get; set; }
}