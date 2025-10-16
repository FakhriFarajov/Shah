
using ShahBuyerAuthApi.Presentation.Extensions;
using ShahBuyerFeaturesApi.Presentation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

app.UseCors("AllowAll");
app.UseApplicationMiddleware();
app.Run();