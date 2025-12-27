using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data.Repositories;

/// <summary>
/// Repository interface specific to Favorite entity operations.
/// </summary>
public interface IFavoriteRepository : IRepository<Favorite>
{
    Task<IEnumerable<Favorite>> GetUserFavoritesWithRecipesAsync(int userId);
    Task<Favorite?> GetByUserAndRecipeAsync(int userId, int recipeId);
}
