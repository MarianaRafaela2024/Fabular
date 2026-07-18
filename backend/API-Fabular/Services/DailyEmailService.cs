using API_Fabular.Infra;
using Dapper;
using Microsoft.Extensions.Hosting;

namespace API_Fabular.Services;

public class DailyEmailService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyEmailService> _logger;

    private DateOnly _ultimaDataEnvio = DateOnly.MinValue;
    private TimeOnly _ultimoHorario = TimeOnly.MinValue;

    public DailyEmailService(
        IServiceProvider serviceProvider,
        ILogger<DailyEmailService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Serviço de e-mails diários iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await VerificarEnvios(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Erro no serviço de e-mails diários.");
            }

            await Task.Delay(
                TimeSpan.FromMinutes(1),
                stoppingToken);
        }
    }

    private async Task VerificarEnvios(
        CancellationToken cancellationToken)
    {
        var agora = DateTime.Now;

        var horarioAtual = new TimeOnly(
            agora.Hour,
            agora.Minute);

        var dataAtual = DateOnly.FromDateTime(agora);

        // evita enviar duas vezes no mesmo minuto
        if (_ultimaDataEnvio == dataAtual &&
            _ultimoHorario == horarioAtual)
        {
            return;
        }

        _ultimaDataEnvio = dataAtual;
        _ultimoHorario = horarioAtual;

        using var scope =
            _serviceProvider.CreateScope();

        var db =
            scope.ServiceProvider
                 .GetRequiredService<DbConnectionFactory>();

        var brevo =
            scope.ServiceProvider
                 .GetRequiredService<BrevoEmailService>();

        await using var conn = db.Create();

        var usuarios =
            await conn.QueryAsync<ResponsavelEmail>(
            @"
            SELECT
                Id,
                Nome,
                Email,
                HorarioEmail
            FROM Responsavel
            WHERE
                ReceberEmail = 1
                AND CAST(HorarioEmail AS TIME(0))
                    = CAST(@Horario AS TIME(0))
            ",
            new
            {
                Horario = horarioAtual.ToTimeSpan()
            });

        foreach (var usuario in usuarios)
        {
            try
            {
                // verifica se já enviou hoje
                var enviado =
                    await conn.ExecuteScalarAsync<int>(
                    @"
                    SELECT COUNT(*)
                    FROM EmailEnviado
                    WHERE
                        ResponsavelId = @Id
                        AND DataEnvio = @Data
                    ",
                    new
                    {
                        usuario.Id,
                        Data = dataAtual
                    });

                if (enviado > 0)
                {
                    continue;
                }

                await brevo.SendDailyReminderAsync(
                    usuario.Email,
                    usuario.Nome);

                await conn.ExecuteAsync(
                    @"
                    INSERT INTO EmailEnviado
                    (
                        ResponsavelId,
                        DataEnvio,
                        Horario
                    )
                    VALUES
                    (
                        @ResponsavelId,
                        @Data,
                        @Horario
                    )
                    ",
                    new
                    {
                        ResponsavelId = usuario.Id,
                        Data = dataAtual,
                        Horario = horarioAtual.ToTimeSpan()
                    });

                _logger.LogInformation(
                    "Lembrete enviado para {Email}",
                    usuario.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Erro enviando e-mail para {Email}",
                    usuario.Email);
            }
        }
    }
}

public class ResponsavelEmail
{
    public int Id { get; set; }

    public string Nome { get; set; } = "";

    public string Email { get; set; } = "";

    public TimeSpan HorarioEmail { get; set; }
}