using ShahBuyerFeaturesApi.Presentation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddApplicationServices(builder.Configuration);


var app = builder.Build();

// CORS is applied via UseApplicationMiddleware (DefaultCors)
app.UseApplicationMiddleware();
app.Run();