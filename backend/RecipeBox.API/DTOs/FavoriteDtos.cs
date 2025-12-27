using System.ComponentModel.DataAnnotations;

namespace RecipeBox.API.DTOs;

// ==================== FAVORITE DTOs ====================

/// <summary>
/// DTO for adding a recipe to favorites.
/// </summary>
public class CreateFavoriteDto
{
    [Required]
    public int RecipeId { get; set; }
}

/// <summary>
/// DTO for favorite response.
/// </summary>
public class FavoriteDto
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public string RecipeTitle { get; set; } = string.Empty;
    public string RecipeCategory { get; set; } = string.Empty;
    public string? RecipeImage { get; set; }
    public DateTime SavedAt { get; set; }
}
