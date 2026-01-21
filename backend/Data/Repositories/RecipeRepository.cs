using Microsoft.EntityFrameworkCore;
using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data.Repositories;

/// <summary>
/// Repository implementation specific to Recipe entity.
/// </summary>
public class RecipeRepository : Repository<Recipe>, IRecipeRepository
{
    public RecipeRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Recipe?> GetByIdWithOwnerAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Favorites)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Recipe>> GetAllWithOwnerAsync()
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Favorites)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Recipe>> GetByOwnerIdAsync(int ownerId)
    {
        return await _dbSet
            .Include(r => r.Owner)
            .Include(r => r.Favorites)
            .Where(r => r.OwnerId == ownerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
