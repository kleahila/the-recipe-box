using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using RecipeBox.API.Data.Repositories;
using RecipeBox.API.Domain.Entities;
using RecipeBox.API.DTOs;

namespace RecipeBox.API.Services;

/// <summary>
/// Service implementation for authentication operations including JWT token generation.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IMapper mapper, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _configuration = configuration;
    }

    /// <summary>
    /// Registers a new user with hashed password and returns JWT token.
    /// </summary>
    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        // Check if email already exists
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
            return null;

        // Create new user with hashed password
        var user = _mapper.Map<User>(dto);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.CreatedAt = DateTime.UtcNow;

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Generate and return JWT token
        return new AuthResponseDto
        {
            Token = GenerateJwtToken(user),
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email
        };
    }

    /// <summary>
    /// Authenticates user credentials and returns JWT token.
    /// </summary>
    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null)
            return null;

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return new AuthResponseDto
        {
            Token = GenerateJwtToken(user),
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email
        };
    }

    /// <summary>
    /// Generates a JWT token for the authenticated user.
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
