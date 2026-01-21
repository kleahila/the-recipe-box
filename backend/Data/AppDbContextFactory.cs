using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RecipeBox.API.Data;

/// <summary>
/// Design-time factory for creating AppDbContext instances during migrations.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        // Use the connection string from appsettings.json for design-time operations
        var connectionString = "Host=localhost;Port=5432;Database=recipebox;Username=kleahila;Password=";
        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
