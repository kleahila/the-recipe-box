using Microsoft.EntityFrameworkCore;
using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data;

/// <summary>
/// Entity Framework DbContext for the Recipe Box application.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Favorite> Favorites { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique constraint on User.Email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configure relationships
        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.Owner)
            .WithMany(u => u.Recipes)
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorite>()
            .HasOne(f => f.Recipe)
            .WithMany(r => r.Favorites)
            .HasForeignKey(f => f.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Prevent duplicate favorites
        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.RecipeId })
            .IsUnique();
    }
}
