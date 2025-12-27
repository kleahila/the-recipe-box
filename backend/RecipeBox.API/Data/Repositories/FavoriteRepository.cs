using Microsoft.EntityFrameworkCore;
using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data.Repositories;

/// <summary>
/// Repository implementation specific to Favorite entity.
/// </summary>
public class FavoriteRepository : Repository<Favorite>, IFavoriteRepository
{
    public FavoriteRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Favorite>> GetUserFavoritesWithRecipesAsync(int userId)
    {
        return await _dbSet
            .Include(f => f.Recipe)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.SavedAt)
            .ToListAsync();
    }

    public async Task<Favorite?> GetByUserAndRecipeAsync(int userId, int recipeId)
    {
        return await _dbSet.FirstOrDefaultAsync(f => f.UserId == userId && f.RecipeId == recipeId);
    }
}
