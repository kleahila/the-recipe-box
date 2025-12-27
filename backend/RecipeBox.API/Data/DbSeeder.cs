using RecipeBox.API.Domain.Entities;

namespace RecipeBox.API.Data;

/// <summary>
/// Seeds the database with initial sample data for testing.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Check if data already exists
        if (context.Users.Any())
            return;

        // ==================== SEED USERS ====================
        var users = new List<User>
        {
            new User
            {
                Name = "John Doe",
                Email = "john@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Name = "Jane Smith",
                Email = "jane@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // ==================== SEED RECIPES ====================
        var recipes = new List<Recipe>
        {
            new Recipe
            {
                Title = "Fluffy Pancakes",
                Category = "Breakfast",
                Ingredients = "1 cup flour\n2 tbsp sugar\n1 egg\n1 cup milk",
                Instructions = "Mix all ingredients together.\nHeat a non-stick pan.\nPour batter, cook until golden.",
                ImagePath = "assets/images/pancakes.jpg",
                OwnerId = users[0].Id,
                CreatedAt = DateTime.UtcNow
            },
            new Recipe
            {
                Title = "Spaghetti Carbonara",
                Category = "Dinner",
                Ingredients = "Spaghetti\nEggs\nPancetta\nParmesan cheese\nBlack pepper",
                Instructions = "Boil pasta.\nCook pancetta.\nMix eggs + cheese.\nCombine everything.",
                ImagePath = "assets/images/spaghetti.jpg",
                OwnerId = users[0].Id,
                CreatedAt = DateTime.UtcNow
            },
            new Recipe
            {
                Title = "Chocolate Cake",
                Category = "Dessert",
                Ingredients = "Flour\nCocoa powder\nSugar\nEggs",
                Instructions = "Mix dry ingredients.\nAdd wet ingredients.\nBake for 30 minutes.",
                ImagePath = "assets/images/cake.jpg",
                OwnerId = users[1].Id,
                CreatedAt = DateTime.UtcNow
            },
            new Recipe
            {
                Title = "Brownie Milkshake",
                Category = "Drinks",
                Ingredients = "Ice cream\nMilk\nBrownie chunks\nChocolate syrup",
                Instructions = "Blend all ingredients.\nTop with extra brownie pieces.",
                ImagePath = "assets/images/Brownie Milkshake.jpg",
                OwnerId = users[1].Id,
                CreatedAt = DateTime.UtcNow
            },
            new Recipe
            {
                Title = "Cinnamon Rolls",
                Category = "Breakfast",
                Ingredients = "Flour, Sugar, Yeast, Milk\nButter, Cinnamon, Brown Sugar\nCream Cheese, Powdered Sugar",
                Instructions = "Prepare dough and let rise.\nRoll out and add filling.\nCut rolls and bake at 180°C.\nTop with frosting.",
                ImagePath = "assets/images/Cinnamon Rolls.jpg",
                OwnerId = users[0].Id,
                CreatedAt = DateTime.UtcNow
            },
            new Recipe
            {
                Title = "Garlic Butter Chicken",
                Category = "Dinner",
                Ingredients = "4 chicken breasts\n3 tbsp butter\n4 garlic cloves\nPaprika, Salt, Pepper",
                Instructions = "Season chicken.\nSauté garlic in butter.\nCook chicken until golden.\nSimmer and serve.",
                ImagePath = "assets/images/garlic-chicken.jpg",
                OwnerId = users[1].Id,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Recipes.AddRange(recipes);
        await context.SaveChangesAsync();

        // ==================== SEED FAVORITES ====================
        var favorites = new List<Favorite>
        {
            new Favorite
            {
                UserId = users[0].Id,
                RecipeId = recipes[2].Id, // John favorites Chocolate Cake
                SavedAt = DateTime.UtcNow
            },
            new Favorite
            {
                UserId = users[1].Id,
                RecipeId = recipes[0].Id, // Jane favorites Fluffy Pancakes
                SavedAt = DateTime.UtcNow
            }
        };

        context.Favorites.AddRange(favorites);
        await context.SaveChangesAsync();
    }
}
