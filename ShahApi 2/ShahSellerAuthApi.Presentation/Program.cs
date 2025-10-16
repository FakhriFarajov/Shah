using ShahSellerAuthApi.Presentation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("DefaultCors");
app.UseApplicationMiddleware();
app.Run();