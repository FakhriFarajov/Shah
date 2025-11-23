using ShahAdminFeaturesApi.Presentation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddControllers();

var app = builder.Build();

// CORS is applied via UseApplicationMiddleware (DefaultCors)
app.UseApplicationMiddleware();
app.Run();