namespace API_Fabular.Contracts;

public class ContatoRequest
{
    public string Nome { get; set; } = "";
    public string Email { get; set; } = "";
    public string Assunto { get; set; } = "";
    public string Mensagem { get; set; } = "";
}