using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data.Repositories;

/// <summary>
/// Repository interface specific to Recipe entity operations.
/// </summary>
public interface IRecipeRepository : IRepository<Recipe>
{
    Task<Recipe?> GetByIdWithOwnerAsync(int id);
    Task<IEnumerable<Recipe>> GetAllWithOwnerAsync();
}
