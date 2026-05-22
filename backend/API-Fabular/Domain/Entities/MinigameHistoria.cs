namespace API_Fabular.Domain.Entities;

public class MinigameHistoria
{
    public int Id { get; private set; }
    public int HistoriaId { get; private set; }
    public int MinigameId { get; private set; }

    public MinigameHistoria(int id, int historiaId, int minigameId)
    {
        if (historiaId <= 0)
        {
            throw new ArgumentException("HistoriaId inválido.", nameof(historiaId));
        }

        if (minigameId <= 0)
        {
            throw new ArgumentException("MinigameId inválido.", nameof(minigameId));
        }

        Id = id;
        HistoriaId = historiaId;
        MinigameId = minigameId;
    }
}
