namespace API_Fabular.Services;

public static class FaixaEtariaHelper
{
    public static byte Calcular(DateOnly? dataNascimento, DateOnly? referencia = null)
    {
        if (!dataNascimento.HasValue)
        {
            return 1;
        }

        var refDate = referencia ?? DateOnly.FromDateTime(DateTime.Today);
        var idade = CalcularIdade(dataNascimento.Value, refDate);

        if (idade <= 6) return 1;
        if (idade <= 8) return 2;
        return 3;
    }

    public static int CalcularIdade(DateOnly dataNascimento, DateOnly referencia)
    {
        var idade = referencia.Year - dataNascimento.Year;
        if (dataNascimento > referencia.AddYears(-idade))
        {
            idade--;
        }

        return idade;
    }
}
