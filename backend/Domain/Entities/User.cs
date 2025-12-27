using System.ComponentModel.DataAnnotations;

namespace RecipeBox.API.Domain.Entities;

/// <summary>
/// Represents a user in the system.
/// </summary>
public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}
