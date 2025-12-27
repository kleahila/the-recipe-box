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
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Recipe>> GetAllWithOwnerAsync()
    {
        return await _dbSet
            .Include(r => r.Owner)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
