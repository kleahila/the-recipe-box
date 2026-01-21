using System.ComponentModel.DataAnnotations;

namespace RecipeBox.API.DTOs;

// ==================== RECIPE DTOs ====================

/// <summary>
/// DTO for creating a new recipe.
/// </summary>
public class CreateRecipeDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Ingredients { get; set; } = string.Empty;

    public string Instructions { get; set; } = string.Empty;

    /// <summary>
    /// Optional image URL (used when not uploading a file).
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// Origin/cuisine of the recipe (e.g., Italian, Mexican).
    /// </summary>
    [MaxLength(50)]
    public string? Origin { get; set; }
}

/// <summary>
/// DTO for updating an existing recipe.
/// </summary>
public class UpdateRecipeDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public string? Ingredients { get; set; }

    public string? Instructions { get; set; }

    /// <summary>
    /// Optional image URL (used when not uploading a file).
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// Origin/cuisine of the recipe (e.g., Italian, Mexican).
    /// </summary>
    [MaxLength(50)]
    public string? Origin { get; set; }
}

/// <summary>
/// DTO for recipe response.
/// </summary>
public class RecipeDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Origin { get; set; }
    public string Ingredients { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string? Image { get; set; }
    public int OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public DateTime CreatedAt { get; set; }
    public int FavoriteCount { get; set; }
}
