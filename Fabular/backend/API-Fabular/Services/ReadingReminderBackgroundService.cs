using System.Collections.Concurrent;
using API_Fabular.Infra;
using Dapper;

namespace API_Fabular.Services;

public class ReadingReminderBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReadingReminderBackgroundService> _logger;
    private readonly ConcurrentDictionary<string, byte> _sentReminders = new();

    public ReadingReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<ReadingReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Serviço de envio automático de lembrete de leitura iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await VerificarEEnviarLembretesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao verificar ou enviar lembretes diários de leitura.");
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private async Task VerificarEEnviarLembretesAsync(CancellationToken stoppingToken)
    {
        var agora = DateTime.Now;
        var hojeIso = agora.ToString("yyyy-MM-dd");

        LimparChavesAntigas(hojeIso);

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DbConnectionFactory>();
        var brevoService = scope.ServiceProvider.GetRequiredService<BrevoEmailService>();

        if (!brevoService.IsConfigured())
        {
            return;
        }

        await using var conn = db.Create();
        await conn.OpenAsync(stoppingToken);

        var criancas = (await conn.QueryAsync<CriancaLembreteDto>(
            """
            SELECT 
                c.Id AS CriancaId,
                c.Nome AS CriancaNome,
                c.HorarioBrincar,
                r.Email AS ResponsavelEmail
            FROM Crianca c
            INNER JOIN Responsavel_Crianca rc ON rc.Id_Crianca = c.Id
            INNER JOIN Responsavel r ON r.Id = rc.Id_Responsavel
            WHERE c.HorarioBrincar IS NOT NULL 
              AND LTRIM(RTRIM(c.HorarioBrincar)) <> ''
            """)).ToList();

        foreach (var crianca in criancas)
        {
            if (stoppingToken.IsCancellationRequested) break;

            if (string.IsNullOrWhiteSpace(crianca.ResponsavelEmail) || string.IsNullOrWhiteSpace(crianca.HorarioBrincar))
            {
                continue;
            }

            if (!TentarObterHorario(crianca.HorarioBrincar, out var horarioAgendado))
            {
                continue;
            }

            if (agora.Hour == horarioAgendado.Hour && agora.Minute == horarioAgendado.Minute)
            {
                var chaveEnvio = $"{crianca.CriancaId}_{hojeIso}";

                if (_sentReminders.ContainsKey(chaveEnvio))
                {
                    continue;
                }

                try
                {
                    _logger.LogInformation("Enviando lembrete de leitura para {Email} (Criança: {Nome}) agendado para {Horario}",
                        crianca.ResponsavelEmail, crianca.CriancaNome, crianca.HorarioBrincar);

                    await brevoService.SendReadingReminderAsync(crianca.ResponsavelEmail, crianca.CriancaNome);

                    _sentReminders[chaveEnvio] = 1;

                    _logger.LogInformation("Lembrete de leitura enviado com sucesso para {Email} (Criança: {Nome}).",
                        crianca.ResponsavelEmail, crianca.CriancaNome);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Falha ao enviar e-mail de lembrete de leitura para {Email} (Criança: {Nome}).",
                        crianca.ResponsavelEmail, crianca.CriancaNome);
                }
            }
        }
    }

    private static bool TentarObterHorario(string horarioStr, out TimeOnly horario)
    {
        horario = default;
        if (TimeOnly.TryParse(horarioStr, out horario))
        {
            return true;
        }

        if (TimeSpan.TryParse(horarioStr, out var ts))
        {
            horario = TimeOnly.FromTimeSpan(ts);
            return true;
        }

        return false;
    }

    private void LimparChavesAntigas(string hojeIso)
    {
        foreach (var key in _sentReminders.Keys)
        {
            if (!key.EndsWith($"_{hojeIso}"))
            {
                _sentReminders.TryRemove(key, out _);
            }
        }
    }

    private record CriancaLembreteDto(int CriancaId, string CriancaNome, string? HorarioBrincar, string ResponsavelEmail);
}
