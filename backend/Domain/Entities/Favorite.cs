using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecipeBox.API.Domain.Entities;

/// <summary>
/// Represents a user's favorite recipe relationship.
/// </summary>
public class Favorite
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }

    [ForeignKey("Recipe")]
    public int RecipeId { get; set; }

    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Recipe Recipe { get; set; } = null!;
}
