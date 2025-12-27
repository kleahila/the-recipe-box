using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecipeBox.API.Domain.Entities;

/// <summary>
/// Represents a recipe in the system.
/// </summary>
public class Recipe
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Ingredients { get; set; } = string.Empty;

    public string Instructions { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImagePath { get; set; }

    [ForeignKey("Owner")]
    public int OwnerId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Owner { get; set; } = null!;
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}
