using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeBox.API.DTOs;
using RecipeBox.API.Services;

namespace RecipeBox.API.Controllers;

/// <summary>
/// Controller for managing user's favorite recipes.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    /// <summary>
    /// Gets all favorites for the authenticated user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<FavoriteDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var favorites = await _favoriteService.GetUserFavoritesAsync(userId.Value);
        return Ok(favorites);
    }

    /// <summary>
    /// Adds a recipe to favorites.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(FavoriteDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AddFavorite([FromBody] CreateFavoriteDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _favoriteService.AddFavoriteAsync(userId.Value, dto.RecipeId);
        if (result == null)
            return BadRequest(new { message = "Recipe not found or already in favorites" });

        return CreatedAtAction(nameof(GetFavorites), result);
    }

    /// <summary>
    /// Removes a recipe from favorites.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveFavorite(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _favoriteService.RemoveFavoriteAsync(id, userId.Value);
        if (!result)
            return NotFound(new { message = "Favorite not found" });

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
}
