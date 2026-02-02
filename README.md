# The Recipe Box

A full-stack recipe management system built with **ASP.NET Core 9**, **PostgreSQL**, and **Vanilla JavaScript**.

## Project Overview

The Recipe Box allows users to securely organize, share, and discover recipes. Features include user authentication, recipe CRUD operations, image uploads, and a favorites system.

**Course:** Web Technologies & Programming  
**Date:** February 2026

---

## Architecture

| Layer             | Technology                           |
| ----------------- | ------------------------------------ |
| Frontend          | HTML5, CSS3, JavaScript, Bootstrap 5 |
| Backend           | ASP.NET Core 9, C#                   |
| Database          | PostgreSQL 16                        |
| ORM               | Entity Framework Core 9              |
| Authentication    | JWT (JSON Web Tokens)                |
| Password Hashing  | BCrypt                               |
| API Documentation | Swagger/OpenAPI                      |

---

## Getting Started

### Prerequisites

- .NET 9 SDK
- PostgreSQL 16
- Python 3 (for serving frontend)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/the-recipe-box.git
   cd the-recipe-box
   ```

2. **Configure the database connection**
   
   Edit `backend/appsettings.json` and update the connection string with your PostgreSQL credentials:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=recipebox;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
   }
   ```

3. **Create the database**

   ```bash
   createdb recipebox
   ```

4. **Apply database migrations**

   ```bash
   cd backend
   dotnet ef database update
   ```

5. **Run the backend**

   ```bash
   dotnet run
   ```

6. **Run the frontend** (in a new terminal)

   ```bash
   cd frontend
   python3 -m http.server 3000
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:5001/swagger

---

## Demo Users

| Email            | Password    |
| ---------------- | ----------- |
| john@example.com | password123 |
| jane@example.com | password123 |

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login and get JWT |

### Recipes

| Method | Endpoint          | Auth | Description                |
| ------ | ----------------- | ---- | -------------------------- |
| GET    | /api/recipes      | No   | Get all recipes            |
| GET    | /api/recipes/{id} | No   | Get recipe by ID           |
| POST   | /api/recipes      | Yes  | Create new recipe          |
| PUT    | /api/recipes/{id} | Yes  | Update recipe (owner only) |
| DELETE | /api/recipes/{id} | Yes  | Delete recipe (owner only) |

### Favorites

| Method | Endpoint                  | Auth | Description           |
| ------ | ------------------------- | ---- | --------------------- |
| GET    | /api/favorites            | Yes  | Get user's favorites  |
| POST   | /api/favorites/{recipeId} | Yes  | Add to favorites      |
| DELETE | /api/favorites/{recipeId} | Yes  | Remove from favorites |

---

## Project Structure

```
the-recipe-box/
├── backend/
│   ├── Controllers/       # API endpoints
│   ├── Services/          # Business logic
│   ├── Data/Repositories/ # Data access layer
│   ├── Domain/Entities/   # Database models
│   ├── DTOs/              # Data transfer objects
│   └── Program.cs         # App configuration
├── frontend/
│   ├── index.html         # Main dashboard
│   ├── login.html         # Login page
│   ├── signup.html        # Registration page
│   ├── script.js          # Main JavaScript
│   └── style.css          # Styles
└── README.md
```

---

## Security Features

- **Password Hashing** - BCrypt with salt
- **JWT Authentication** - Stateless, secure tokens
- **Authorization** - Only owners can modify their recipes
- **SQL Injection Prevention** - EF Core parameterized queries
- **CORS Configuration** - Controlled cross-origin access

---

## Key Concepts Demonstrated

1. **RESTful API Design** - CRUD operations with proper HTTP methods
2. **N-Tier Architecture** - Controllers → Services → Repositories
3. **Dependency Injection** - Interface-based service registration with Scoped lifetime
4. **Database Design** - Relational data modeling with Entity Framework Core
5. **Authentication & Authorization** - JWT-based security with BCrypt password hashing
6. **Async Programming** - Non-blocking database operations with async/await
7. **Frontend-Backend Integration** - Fetch API with JWT token handling

---

## Team

- [Add team member names here]

---

## License

MIT License - see [LICENSE](LICENSE) file.
