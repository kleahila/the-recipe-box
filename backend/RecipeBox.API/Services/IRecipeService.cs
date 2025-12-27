using RecipeBox.API.DTOs;

namespace RecipeBox.API.Services;

/// <summary>
/// Service interface for recipe operations.
/// </summary>
public interface IRecipeService
{
    Task<IEnumerable<RecipeDto>> GetAllAsync();
    Task<RecipeDto?> GetByIdAsync(int id);
    Task<RecipeDto> CreateAsync(CreateRecipeDto dto, int ownerId, string? imagePath);
    Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, int userId, string? newImagePath);
    Task<bool> DeleteAsync(int id, int userId);
}
