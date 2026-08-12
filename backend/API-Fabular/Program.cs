using API_Fabular.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpClient();
builder.Services.AddScoped<BrevoService>();
builder.Services.AddScoped<BrevoEmailService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.Configure<API_Fabular.Services.BrevoEmailOptions>(builder.Configuration.GetSection("Brevo"));
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<API_Fabular.Infra.DbConnectionFactory>();
builder.Services.AddScoped<API_Fabular.Services.BrevoEmailService>();
builder.Services.AddSingleton<API_Fabular.Services.StoryGeneratorService>();
builder.Services.AddScoped<API_Fabular.Services.ParentAuthService>();
builder.Services.AddScoped<API_Fabular.Services.ChildrenLinkService>();
builder.Services.AddScoped<API_Fabular.Services.StoriesService>();
builder.Services.AddScoped<API_Fabular.Services.ProgressSyncService>();
builder.Services.AddHostedService<ReadingReminderBackgroundService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (allowedOrigins.Length == 0)
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            return;
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseCors("frontend");
app.UseAuthorization();

app.MapControllers();

app.Run();
