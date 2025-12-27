using Microsoft.EntityFrameworkCore;
using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data.Repositories;

/// <summary>
/// Repository implementation specific to User entity.
/// </summary>
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }
}
