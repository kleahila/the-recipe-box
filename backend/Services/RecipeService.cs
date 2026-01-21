using AutoMapper;
using RecipeBox.API.Data.Repositories;
using RecipeBox.API.Domain.Entities;
using RecipeBox.API.DTOs;

namespace RecipeBox.API.Services;

/// <summary>
/// Service implementation for recipe operations.
/// </summary>
public class RecipeService : IRecipeService
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IMapper _mapper;

    public RecipeService(IRecipeRepository recipeRepository, IMapper mapper)
    {
        _recipeRepository = recipeRepository;
        _mapper = mapper;
    }

    /// <summary>
    /// Gets all recipes with owner information.
    /// </summary>
    public async Task<IEnumerable<RecipeDto>> GetAllAsync()
    {
        var recipes = await _recipeRepository.GetAllWithOwnerAsync();
        return _mapper.Map<IEnumerable<RecipeDto>>(recipes);
    }

    /// <summary>
    /// Gets recipes by owner ID.
    /// </summary>
    public async Task<IEnumerable<RecipeDto>> GetByOwnerAsync(int ownerId)
    {
        var recipes = await _recipeRepository.GetByOwnerIdAsync(ownerId);
        return _mapper.Map<IEnumerable<RecipeDto>>(recipes);
    }

    /// <summary>
    /// Gets a recipe by ID with owner information.
    /// </summary>
    public async Task<RecipeDto?> GetByIdAsync(int id)
    {
        var recipe = await _recipeRepository.GetByIdWithOwnerAsync(id);
        return recipe == null ? null : _mapper.Map<RecipeDto>(recipe);
    }

    /// <summary>
    /// Creates a new recipe.
    /// </summary>
    public async Task<RecipeDto> CreateAsync(CreateRecipeDto dto, int ownerId, string? imagePath)
    {
        var recipe = _mapper.Map<Recipe>(dto);
        recipe.OwnerId = ownerId;
        recipe.CreatedAt = DateTime.UtcNow;

        // Use uploaded image path if provided, otherwise use URL from DTO
        if (!string.IsNullOrEmpty(imagePath))
            recipe.ImagePath = imagePath;

        await _recipeRepository.AddAsync(recipe);
        await _recipeRepository.SaveChangesAsync();

        return _mapper.Map<RecipeDto>(recipe);
    }

    /// <summary>
    /// Updates an existing recipe. Only the owner can update.
    /// </summary>
    public async Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, int userId, string? newImagePath)
    {
        var recipe = await _recipeRepository.GetByIdAsync(id);
        if (recipe == null || recipe.OwnerId != userId)
            return null;

        // Update only provided fields
        if (!string.IsNullOrEmpty(dto.Title))
            recipe.Title = dto.Title;
        if (!string.IsNullOrEmpty(dto.Category))
            recipe.Category = dto.Category;
        if (!string.IsNullOrEmpty(dto.Ingredients))
            recipe.Ingredients = dto.Ingredients;
        if (dto.Instructions != null)
            recipe.Instructions = dto.Instructions;

        // Handle image update
        if (!string.IsNullOrEmpty(newImagePath))
            recipe.ImagePath = newImagePath;
        else if (!string.IsNullOrEmpty(dto.ImageUrl))
            recipe.ImagePath = dto.ImageUrl;

        _recipeRepository.Update(recipe);
        await _recipeRepository.SaveChangesAsync();

        return _mapper.Map<RecipeDto>(recipe);
    }

    /// <summary>
    /// Deletes a recipe. Only the owner can delete.
    /// </summary>
    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var recipe = await _recipeRepository.GetByIdAsync(id);
        if (recipe == null || recipe.OwnerId != userId)
            return false;

        _recipeRepository.Remove(recipe);
        await _recipeRepository.SaveChangesAsync();
        return true;
    }
}
