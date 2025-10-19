using Scalar.AspNetCore;
using ShahSellerFeaturesApi.Infrastructure.Middlewares;

namespace ShahSellerFeaturesApi.Presentation.Extensions;



public static class ApplicationBuilderExtensions
{
    public static WebApplication UseApplicationMiddleware(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }
        
        app.UseCors("DefaultCors");


        app.UseHttpsRedirection();
        app.MapControllers();
        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapScalarApiReference();

        return app;

    }
}
