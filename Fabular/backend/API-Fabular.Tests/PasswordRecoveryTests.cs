using API_Fabular.Services;

namespace API_Fabular.Tests;

public class PasswordRecoveryTests
{
    [Theory]
    [InlineData("123456", true)]
    [InlineData("000000", true)]
    [InlineData("999999", true)]
    [InlineData(" 123456 ", true)]
    [InlineData("123 456", true)]
    [InlineData("12-34-56", true)]
    [InlineData("12345", false)]
    [InlineData("1234567", false)]
    [InlineData("abcdef", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void Validacao_Codigo_6_Digitos(string? entrada, bool esperado)
    {
        var ok = TentarNormalizarCodigo(entrada, out var normalizado);
        Assert.Equal(esperado, ok);
        if (esperado)
        {
            Assert.Equal(6, normalizado.Length);
            Assert.True(normalizado.All(char.IsDigit));
        }
    }

    [Theory]
    [InlineData("NovaSenha123!", true)]
    [InlineData("Mundo@2026", true)]
    [InlineData("12345678", false)]
    [InlineData("semnumero!", false)]
    [InlineData("SEMMINUSCULA1!", false)]
    [InlineData("semmaiuscula1!", false)]
    [InlineData("SemEspecial1", false)]
    public void Validacao_NovaSenha_Regras(string senha, bool esperado)
    {
        var ok = ValidacaoCampos.SenhaAtendeRegras(senha, out var erro);
        Assert.Equal(esperado, ok);
        if (!esperado)
        {
            Assert.NotNull(erro);
        }
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
}
