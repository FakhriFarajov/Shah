using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using ShahAuthApi.Core.Models;
using ShahAuthApi.Infrastructure.Contexts;
using ShahAuthApi.Presentation.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseApplicationMiddleware();
app.Run();