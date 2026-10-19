using System.Globalization;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace API_Fabular.Services;

public static class ValidacaoCampos
{
    public const string MensagemHorarioBrincar = "Selecione o horário de brincar";
    public const string MensagemTelefone = "Telefone inválido. Use DDD + 9 dígitos.";
    public const string MensagemEmail = "Digite um e-mail válido.";
    public const string MensagemEmailDuplicado = "Este e-mail já está cadastrado";
    public const string MensagemSenha = "A senha precisa ter 8 caracteres, maiúscula, minúscula, número e caractere especial, sem espaços.";
    public const string MensagemSenhaComum = "Essa senha é muito comum. Escolha outra.";
    public const string MensagemSenhaConfirmacao = "As senhas não coincidem.";
    public const int HorarioBrincarMaxLength = 10;
    public const int EmailMaxLength = 160;
    public const int TelefoneMaxLength = 11;
    public const int SenhaMinLength = 8;
    public const int SenhaMaxLength = 128;
    public const int NomeMinLength = 2;
    public const int NomeMaxLength = 80;
    public const int SobrenomeMaxLength = 80;
    public const int CriancaNomeMaxLength = 80;
    public const int MensagemMinLength = 10;
    public const int MensagemMaxLength = 2000;
    public const string MensagemNome = "Informe um nome com pelo menos 2 caracteres.";
    public const string MensagemContato = "A mensagem precisa ter entre 10 e 2000 caracteres.";
    public const string MensagemAssunto = "Assunto de contato inválido.";

    private static readonly HashSet<string> AssuntosPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "duvida-geral", "parceria", "suporte-tecnico", "recuperacao-email", "outro"
    };

    private static readonly HashSet<string> SenhasComuns = new(StringComparer.OrdinalIgnoreCase)
    {
        "12345678", "123456789", "senha123", "senha1234", "qwerty123", "qwertyui",
        "password", "password1", "admin123", "11111111", "abc12345", "1234qwer"
    };

    private static readonly Regex TelefoneCelular = new(@"^[1-9]\d9\d{8}$", RegexOptions.Compiled);

    public static bool TentarNormalizarHorarioBrincar(string? valor, out string? horario)
    {
        horario = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var s = valor.Trim();
        if (s.Length > HorarioBrincarMaxLength)
            return false;

        if (!TimeOnly.TryParse(s, CultureInfo.InvariantCulture, out var t)
            && !TimeOnly.TryParse(s, new CultureInfo("pt-BR"), out t))
        {
            return false;
        }

        horario = t.ToString("HH:mm", CultureInfo.InvariantCulture);
        return true;
    }

    public static bool TentarNormalizarTelefone(string? valor, out string? telefone)
    {
        telefone = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var digitos = new string(valor.Where(char.IsDigit).ToArray());
        if (digitos.Length != TelefoneMaxLength || !TelefoneCelular.IsMatch(digitos))
            return false;

        telefone = digitos;
        return true;
    }

    public static bool TentarNormalizarEmail(string? valor, out string? email)
    {
        email = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var s = valor.Trim().ToLowerInvariant();
        if (s.Contains(' ') || s.Length > EmailMaxLength)
            return false;

        try
        {
            var addr = new MailAddress(s);
            if (!string.Equals(addr.Address, s, StringComparison.Ordinal))
                return false;
        }
        catch (FormatException)
        {
            return false;
        }

        var at = s.IndexOf('@');
        if (at < 1 || at == s.Length - 1)
            return false;

        var dominio = s[(at + 1)..];
        if (!dominio.Contains('.'))
            return false;

        email = s;
        return true;
    }

    public static bool SenhaAtendeRegras(string? senha, out string? erro)
    {
        erro = null;
        if (string.IsNullOrEmpty(senha)
            || senha.Length < SenhaMinLength
            || senha.Length > SenhaMaxLength
            || senha.Any(char.IsWhiteSpace)
            || !senha.Any(char.IsUpper)
            || !senha.Any(char.IsLower)
            || !senha.Any(char.IsDigit)
            || !senha.Any(c => !char.IsLetterOrDigit(c)))
        {
            erro = MensagemSenha;
            return false;
        }

        if (SenhasComuns.Contains(senha))
        {
            erro = MensagemSenhaComum;
            return false;
        }

        return true;
    }

    public static bool TentarNormalizarNome(string? valor, out string? nome)
    {
        nome = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var s = valor.Trim();
        if (s.Length < NomeMinLength || s.Length > NomeMaxLength)
            return false;

        nome = s;
        return true;
    }

    public static bool TentarNormalizarSobrenome(string? valor, out string? sobrenome)
    {
        sobrenome = null;
        if (string.IsNullOrWhiteSpace(valor))
        {
            sobrenome = null;
            return true;
        }

        var s = valor.Trim();
        if (s.Length > SobrenomeMaxLength)
            return false;

        sobrenome = s;
        return true;
    }

    public static bool TentarNormalizarNomeCrianca(string? valor, out string? nome)
    {
        nome = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var s = valor.Trim();
        if (s.Length < 1 || s.Length > CriancaNomeMaxLength)
            return false;

        nome = s;
        return true;
    }

    public static bool TentarNormalizarMensagemContato(string? valor, out string? mensagem)
    {
        mensagem = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var s = valor.Trim();
        if (s.Length < MensagemMinLength || s.Length > MensagemMaxLength)
            return false;

        mensagem = s;
        return true;
    }

    public static bool TentarNormalizarAssuntoContato(string? valor, out string? assunto)
    {
        assunto = null;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var s = valor.Trim().ToLowerInvariant();
        if (!AssuntosPermitidos.Contains(s))
            return false;

        assunto = s;
        return true;
    }

    public static bool HoneypotPreenchido(string? valor) => !string.IsNullOrWhiteSpace(valor);

    public static string EscaparHtml(string? valor) => System.Net.WebUtility.HtmlEncode(valor ?? "");
}
