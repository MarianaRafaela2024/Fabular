namespace API_Fabular.Services;

public class ApplicationResult<T>
{
    public bool Success { get; }
    public int StatusCode { get; }
    public T? Value { get; }
    public string? Error { get; }

    private ApplicationResult(bool success, int statusCode, T? value, string? error)
    {
        Success = success;
        StatusCode = statusCode;
        Value = value;
        Error = error;
    }

    public static ApplicationResult<T> Ok(T value) => new(true, 200, value, null);
    public static ApplicationResult<T> BadRequest(string error) => new(false, 400, default, error);
    public static ApplicationResult<T> Unauthorized(string error) => new(false, 401, default, error);
    public static ApplicationResult<T> NotFound(string error) => new(false, 404, default, error);
    public static ApplicationResult<T> Conflict(string error) => new(false, 409, default, error);
    public static ApplicationResult<T> InternalError(string error) => new(false, 500, default, error);
}
