using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;

namespace API_Fabular.Infra;

public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.Date;
        parameter.Value = value.ToDateTime(TimeOnly.MinValue);
    }

    public override DateOnly Parse(object value)
    {
        if (value is DateTime dt) return DateOnly.FromDateTime(dt);
        if (value is string s && DateOnly.TryParse(s, out var d)) return d;
        return DateOnly.FromDateTime(Convert.ToDateTime(value));
    }
}

public class NullableDateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly?>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly? value)
    {
        parameter.DbType = DbType.Date;
        parameter.Value = value.HasValue ? value.Value.ToDateTime(TimeOnly.MinValue) : DBNull.Value;
    }

    public override DateOnly? Parse(object value)
    {
        if (value == null || value == DBNull.Value) return null;
        if (value is DateTime dt) return DateOnly.FromDateTime(dt);
        if (value is string s && DateOnly.TryParse(s, out var d)) return d;
        return DateOnly.FromDateTime(Convert.ToDateTime(value));
    }
}

public class DbConnectionFactory
{
    private readonly IConfiguration _configuration;

    static DbConnectionFactory()
    {
        SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
        SqlMapper.AddTypeHandler(new NullableDateOnlyTypeHandler());
    }

    public DbConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public SqlConnection Create()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' não configurada.");
        }

        return new SqlConnection(connectionString);
    }
}
