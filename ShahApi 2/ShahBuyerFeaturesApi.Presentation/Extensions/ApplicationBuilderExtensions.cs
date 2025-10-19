using ShahBuyerFeaturesApi.Infrastructure.Middlewares;
using Scalar.AspNetCore;


namespace ShahBuyerFeaturesApi.Presentation.Extensions;
public static class ApplicationBuilderExtensions
{
    public static WebApplication UseApplicationMiddleware(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }


        app.UseCors("DefaultCors");
        
        // 2. Security / request processing
        
        
        app.UseHttpsRedirection();
        app.UseMiddleware<GlobalExceptionMiddleware>();

        // 3. Authentication / Authorization BEFORE controllers
        app.UseAuthentication();
        app.UseAuthorization();

        // 4. Controllers / endpoints
        app.MapControllers();
        

        // 5. Extra mappings (Scalar, health checks, etc.)
        app.MapScalarApiReference();

        return app;

    }
}