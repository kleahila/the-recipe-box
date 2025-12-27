using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data.Repositories;

/// <summary>
/// Repository interface specific to User entity operations.
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
}
