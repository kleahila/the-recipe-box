using RecipeBox.API.DTOs;

namespace RecipeBox.API.Services;

/// <summary>
/// Service interface for favorite operations.
/// </summary>
public interface IFavoriteService
{
    Task<IEnumerable<FavoriteDto>> GetUserFavoritesAsync(int userId);
    Task<FavoriteDto?> AddFavoriteAsync(int userId, int recipeId);
    Task<bool> RemoveFavoriteAsync(int favoriteId, int userId);
}
