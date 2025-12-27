using AutoMapper;
using RecipeBox.API.Domain.Entities;
using RecipeBox.API.DTOs;

namespace RecipeBox.API.Mappings;

/// <summary>
/// AutoMapper profile for mapping between entities and DTOs.
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        // Recipe mappings
        CreateMap<Recipe, RecipeDto>()
            .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.ImagePath))
            .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner != null ? src.Owner.Name : null));

        CreateMap<CreateRecipeDto, Recipe>()
            .ForMember(dest => dest.ImagePath, opt => opt.MapFrom(src => src.ImageUrl));

        // Favorite mappings
        CreateMap<Favorite, FavoriteDto>()
            .ForMember(dest => dest.RecipeTitle, opt => opt.MapFrom(src => src.Recipe.Title))
            .ForMember(dest => dest.RecipeCategory, opt => opt.MapFrom(src => src.Recipe.Category))
            .ForMember(dest => dest.RecipeImage, opt => opt.MapFrom(src => src.Recipe.ImagePath));
    }
}
