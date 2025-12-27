using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBox.API.DTOs;
using RecipeBox.API.Services;

namespace RecipeBox.API.Controllers;

/// <summary>
/// Controller for recipe CRUD operations with image upload support.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipeService;
    private readonly IWebHostEnvironment _environment;

    public RecipesController(IRecipeService recipeService, IWebHostEnvironment environment)
    {
        _recipeService = recipeService;
        _environment = environment;
    }

    /// <summary>
    /// Gets all recipes.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RecipeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var recipes = await _recipeService.GetAllAsync();
        return Ok(recipes);
    }

    /// <summary>
    /// Gets a recipe by ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var recipe = await _recipeService.GetByIdAsync(id);
        if (recipe == null)
            return NotFound(new { message = "Recipe not found" });

        return Ok(recipe);
    }

    /// <summary>
    /// Creates a new recipe with optional image upload.
    /// Accepts multipart/form-data with fields: title, category, ingredients, instructions, imageUrl, and image (file).
    /// </summary>
    [HttpPost]
    [Authorize]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromForm] CreateRecipeDto dto, IFormFile? image)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        string? imagePath = null;

        // Handle image upload
        if (image != null && image.Length > 0)
        {
            imagePath = await SaveImageAsync(image);
        }

        var recipe = await _recipeService.CreateAsync(dto, userId.Value, imagePath);
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    /// <summary>
    /// Updates an existing recipe. Only the owner can update.
    /// Accepts multipart/form-data with optional image upload.
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateRecipeDto dto, IFormFile? image)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        string? imagePath = null;

        // Handle image upload
        if (image != null && image.Length > 0)
        {
            imagePath = await SaveImageAsync(image);
        }

        var recipe = await _recipeService.UpdateAsync(id, dto, userId.Value, imagePath);
        if (recipe == null)
            return NotFound(new { message = "Recipe not found or you don't have permission" });

        return Ok(recipe);
    }

    /// <summary>
    /// Deletes a recipe. Only the owner can delete.
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _recipeService.DeleteAsync(id, userId.Value);
        if (!result)
            return NotFound(new { message = "Recipe not found or you don't have permission" });

        return NoContent();
    }

    /// <summary>
    /// Extracts current user ID from JWT claims.
    /// </summary>
    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    /// <summary>
    /// Saves uploaded image to wwwroot/images and returns relative path.
    /// </summary>
    private async Task<string> SaveImageAsync(IFormFile image)
    {
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "images");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        return $"/images/{uniqueFileName}";
    }
}
