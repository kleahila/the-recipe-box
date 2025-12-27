using AutoMapper;
using RecipeBox.API.Data.Repositories;
using RecipeBox.API.Domain.Entities;
using RecipeBox.API.DTOs;

namespace RecipeBox.API.Services;

/// <summary>
/// Service implementation for favorite operations.
/// </summary>
public class FavoriteService : IFavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IRecipeRepository _recipeRepository;
    private readonly IMapper _mapper;

    public FavoriteService(IFavoriteRepository favoriteRepository, IRecipeRepository recipeRepository, IMapper mapper)
    {
        _favoriteRepository = favoriteRepository;
        _recipeRepository = recipeRepository;
        _mapper = mapper;
    }

    /// <summary>
    /// Gets all favorites for a user with recipe details.
    /// </summary>
    public async Task<IEnumerable<FavoriteDto>> GetUserFavoritesAsync(int userId)
    {
        var favorites = await _favoriteRepository.GetUserFavoritesWithRecipesAsync(userId);
        return _mapper.Map<IEnumerable<FavoriteDto>>(favorites);
    }

    /// <summary>
    /// Adds a recipe to user's favorites. Returns null if already favorited or recipe doesn't exist.
    /// </summary>
    public async Task<FavoriteDto?> AddFavoriteAsync(int userId, int recipeId)
    {
        // Check if recipe exists
        var recipe = await _recipeRepository.GetByIdAsync(recipeId);
        if (recipe == null)
            return null;

        // Check if already favorited
        var existing = await _favoriteRepository.GetByUserAndRecipeAsync(userId, recipeId);
        if (existing != null)
            return null;

        var favorite = new Favorite
        {
            UserId = userId,
            RecipeId = recipeId,
            SavedAt = DateTime.UtcNow
        };

        await _favoriteRepository.AddAsync(favorite);
        await _favoriteRepository.SaveChangesAsync();

        // Reload with recipe data for response
        var favorites = await _favoriteRepository.GetUserFavoritesWithRecipesAsync(userId);
        var added = favorites.FirstOrDefault(f => f.Id == favorite.Id);
        return added != null ? _mapper.Map<FavoriteDto>(added) : null;
    }

    /// <summary>
    /// Removes a favorite. Only the owner can remove.
    /// </summary>
    public async Task<bool> RemoveFavoriteAsync(int favoriteId, int userId)
    {
        var favorite = await _favoriteRepository.GetByIdAsync(favoriteId);
        if (favorite == null || favorite.UserId != userId)
            return false;

        _favoriteRepository.Remove(favorite);
        await _favoriteRepository.SaveChangesAsync();
        return true;
    }
}
