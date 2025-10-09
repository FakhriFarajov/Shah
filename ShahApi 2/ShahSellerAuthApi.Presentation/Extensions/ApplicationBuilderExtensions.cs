using ShahSellerAuthApi.Infrastructure.Middlewares;
using Scalar.AspNetCore;

namespace ShahSellerAuthApi.Presentation.Extensions;


public static class ApplicationBuilderExtensions
{
    public static WebApplication UseApplicationMiddleware(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        

        app.MapScalarApiReference();

        return app;

    }
}
