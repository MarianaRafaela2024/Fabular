using API_Fabular.Services;

namespace API_Fabular.Tests;

public class ValidacaoCamposTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("25:00")]
    [InlineData("abc")]
    public void Horario_vazio_ou_invalido_falha(string? valor)
    {
        Assert.False(ValidacaoCampos.TentarNormalizarHorarioBrincar(valor, out var horario));
        Assert.Null(horario);
    }

    [Theory]
    [InlineData("18:00", "18:00")]
    [InlineData("9:30", "09:30")]
    [InlineData("18:00:00", "18:00")]
    public void Horario_valido_normaliza_hhmm(string entrada, string esperado)
    {
        Assert.True(ValidacaoCampos.TentarNormalizarHorarioBrincar(entrada, out var horario));
        Assert.Equal(esperado, horario);
    }

    [Theory]
    [InlineData("(19) 99999-8888", "19999998888")]
    [InlineData("19 99999 8888", "19999998888")]
    public void Telefone_valido_fica_so_com_digitos(string entrada, string esperado)
    {
        Assert.True(ValidacaoCampos.TentarNormalizarTelefone(entrada, out var telefone));
        Assert.Equal(esperado, telefone);
    }

    [Theory]
    [InlineData("")]
    [InlineData("(11) 9999-8888")]
    [InlineData("(09) 99999-8888")]
    [InlineData("(19) 89999-8888")]
    public void Telefone_invalido_falha(string entrada)
    {
        Assert.False(ValidacaoCampos.TentarNormalizarTelefone(entrada, out var telefone));
        Assert.Null(telefone);
    }

    [Theory]
    [InlineData("  Foo.Bar@Exemplo.COM  ", "foo.bar@exemplo.com")]
    [InlineData("a@b.com", "a@b.com")]
    public void Email_valido_normaliza_minusculo(string entrada, string esperado)
    {
        Assert.True(ValidacaoCampos.TentarNormalizarEmail(entrada, out var email));
        Assert.Equal(esperado, email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("sem-arroba.com")]
    [InlineData("a@b")]
    [InlineData("a b@c.com")]
    [InlineData("@dominio.com")]
    public void Email_invalido_falha(string entrada)
    {
        Assert.False(ValidacaoCampos.TentarNormalizarEmail(entrada, out var email));
        Assert.Null(email);
    }

    [Fact]
    public void Senha_forte_passa()
    {
        Assert.True(ValidacaoCampos.SenhaAtendeRegras("Abcdef1!", out var erro));
        Assert.Null(erro);
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("abcdefgh")]
    [InlineData("Abcdefgh")]
    [InlineData("Abcdefg1")]
    [InlineData("Abcdef1! ")]
    [InlineData("senha123")]
    [InlineData("qwerty123")]
    public void Senha_fraca_ou_comum_falha(string senha)
    {
        Assert.False(ValidacaoCampos.SenhaAtendeRegras(senha, out var erro));
        Assert.False(string.IsNullOrWhiteSpace(erro));
    }

    [Fact]
    public void Nome_contato_exige_dois_caracteres()
    {
        Assert.False(ValidacaoCampos.TentarNormalizarNome("A", out _));
        Assert.True(ValidacaoCampos.TentarNormalizarNome("Ana", out var nome));
        Assert.Equal("Ana", nome);
    }

    [Fact]
    public void Mensagem_contato_respeita_minimo_e_maximo()
    {
        Assert.False(ValidacaoCampos.TentarNormalizarMensagemContato("curta", out _));
        Assert.True(ValidacaoCampos.TentarNormalizarMensagemContato("Mensagem com dez.", out var msg));
        Assert.Equal("Mensagem com dez.", msg);
    }

    [Fact]
    public void Honeypot_preenchido_e_detectado()
    {
        Assert.True(ValidacaoCampos.HoneypotPreenchido("http://spam"));
        Assert.False(ValidacaoCampos.HoneypotPreenchido(""));
        Assert.False(ValidacaoCampos.HoneypotPreenchido(null));
    }
}
