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

        app.UseHttpsRedirection();
        
        // Global exception handling early in the pipeline
        app.UseMiddleware<GlobalExceptionMiddleware>();
        
        // Use the CORS policy registered in services
        app.UseCors("DefaultCors");
        
        // Auth before hitting endpoints
        app.UseAuthentication();
        app.UseAuthorization();

        // Map controllers at the end
        app.MapControllers();

        app.MapScalarApiReference();

        return app;
    }
}
