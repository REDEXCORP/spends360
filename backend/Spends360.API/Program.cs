using Microsoft.EntityFrameworkCore;
using Spends360.API.Extentions;
using Spends360.API.Middlewares;
using Spends360.Infrastructure;
using Spends360.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiControllers();
builder.Services.AddOpenApi();
builder.Services.AddAppOptions();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddDbContext<AppDbContext>(options => {
    var connectionString = Environment.GetEnvironmentVariable("DEFAULT_CONNECTION");
    options.UseNpgsql(connectionString);
});
builder.Services.AddRepositories();
builder.Services.AddInfrastructure();
builder.Services.AddServices();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

using var scope = app.Services.CreateScope();
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

app.UseCors(builder => builder
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials());

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
