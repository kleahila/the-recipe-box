// ==================== API CONFIGURATION ====================
// Base URL for the ASP.NET Core API
const API_BASE_URL = "http://localhost:5000/api";

const fallbackImage = "https://placehold.co/600x400?text=Recipe+Image";
let allRecipes = [];
let currentUser = null;

const path = window.location.pathname;
const isDashboardPage =
  path.endsWith("/") || path.endsWith("index.html") || path === "/index.html";
const isLoginPage = path.endsWith("login.html");
const isSignupPage = path.endsWith("signup.html");

initialize();

// ==================== INITIALIZATION ====================
function initialize() {
  registerFormHandlers();
  registerUIListeners();
  checkAuthState();
}

// ==================== AUTH STATE MANAGEMENT ====================
// Check if user is logged in using JWT token from localStorage
function checkAuthState() {
  const token = localStorage.getItem("jwt_token");
  const userData = localStorage.getItem("user_data");

  if (token && userData) {
    currentUser = JSON.parse(userData);

    if (isDashboardPage) {
      loadAllRecipes();
      loadSavedRecipes();
    } else if (isLoginPage || isSignupPage) {
      window.location.href = "index.html";
    }
  } else {
    currentUser = null;

    if (isDashboardPage) {
      window.location.href = "landing.html";
    }
  }
}

// ==================== HELPER FUNCTIONS ====================
// Get authorization headers for API requests
function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Get JSON headers with authorization
function getJsonAuthHeaders() {
  return {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
}

function registerFormHandlers() {
  if ($("#signupForm").length) {
    $("#signupForm").on("submit", handleSignup);
  }

  if ($("#loginForm").length) {
    $("#loginForm").on("submit", handleLogin);
  }
}

function registerUIListeners() {
  $("#searchInput, #categoryFilter").on("input change", filterRecipes);

  $(document).on("click", "#saveRecipeBtn", saveRecipe);
  $(document).on("click", ".viewRecipeBtn", viewRecipe);
  $(document).on("click", "#deleteRecipeBtn", deleteRecipe);
  $(document).on("click", ".save-to-favorites-btn", saveToFavorites);
  $(document).on("click", ".unsave-btn", unsaveRecipe);
  $(document).on("click", ".logout", async (event) => {
    event.preventDefault();
    // Clear JWT and user data from localStorage
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    currentUser = null;
    window.location.href = "landing.html";
  });
}

// ==================== AUTHENTICATION ====================
// Register new user via API
async function handleSignup(event) {
  event.preventDefault();
  const name = $("#signupName").val();
  const email = $("#signupEmail").val();
  const password = $("#signupPassword").val();
  const confirmPassword = $("#signupConfirmPassword").val();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();

    // Store JWT token and user data in localStorage
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem(
      "user_data",
      JSON.stringify({
        id: data.userId,
        name: data.name,
        email: data.email,
      })
    );

    alert("Signup successful! Redirecting you to your recipes...");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Signup error", error);
    alert(error.message || "Unable to sign up. Please try again.");
  }
}

// Login user via API
async function handleLogin(event) {
  event.preventDefault();
  const email = $("#loginUsername").val();
  const password = $("#loginPassword").val();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }

    const data = await response.json();

    // Store JWT token and user data in localStorage
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem(
      "user_data",
      JSON.stringify({
        id: data.userId,
        name: data.name,
        email: data.email,
      })
    );

    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error", error);
    alert("Invalid email or password.");
  }
}

// ==================== RECIPES ====================
// Load all recipes from API
async function loadAllRecipes() {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`);

    if (!response.ok) {
      throw new Error("Failed to load recipes");
    }

    allRecipes = await response.json();
    renderRecipes(allRecipes);
  } catch (error) {
    console.error("Failed to load recipes", error);
    alert("Unable to load recipes right now.");
  }
}

function renderRecipes(recipes) {
  const grid = $("#recipeGrid");
  if (!grid.length) return;

  grid.empty();

  if (recipes.length === 0) {
    grid.append(
      "<div class='col-12 text-center text-muted'>No recipes found.</div>"
    );
    return;
  }

  recipes.forEach((recipe) => {
    // Handle image path - prepend API base URL for relative paths
    let imageSrc = recipe.image || fallbackImage;
    if (imageSrc && imageSrc.startsWith("/images/")) {
      imageSrc = `http://localhost:5000${imageSrc}`;
    }

    grid.append(`
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${imageSrc}" class="card-img-top" style="height: 200px; object-fit: cover;"
               onerror="this.onerror=null;this.src='${fallbackImage}';">
          <div class="card-body">
            <h5 class="card-title">${recipe.title}</h5>
            <p class="card-text text-muted">${recipe.category}</p>
            <button class="btn btn-primary viewRecipeBtn" data-id="${recipe.id}">View Recipe</button>
          </div>
        </div>
      </div>`);
  });
}

function filterRecipes() {
  if (!allRecipes.length) return;
  const term = $("#searchInput").val()?.toLowerCase() || "";
  const category = $("#categoryFilter").val() || "";

  const filtered = allRecipes.filter((recipe) => {
    const matchesTerm = recipe.title?.toLowerCase().includes(term);
    const matchesCategory = !category || recipe.category === category;
    return matchesTerm && matchesCategory;
  });

  renderRecipes(filtered);
}

// Create new recipe via API with FormData for image upload
async function saveRecipe() {
  if (!currentUser) {
    alert("Please log in before adding recipes.");
    return;
  }

  const title = $("#recipeTitle").val();
  const category = $("#recipeCategory").val();
  const ingredients = $("#recipeIngredients").val();
  const instructions = $("#recipeInstructions").val();
  const imageUrl = $("#recipeImageURL").val();
  const imageFile = $("#recipeImage")?.[0]?.files?.[0];

  if (!title || !ingredients) {
    alert("Please fill in Title and Ingredients");
    return;
  }

  try {
    // Use FormData for multipart/form-data request
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);

    // Add image file if provided, otherwise use URL
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to save recipe");
    }

    $("#addRecipeModal").modal("hide");
    $("#addRecipeForm")[0].reset();
    await loadAllRecipes();
  } catch (error) {
    console.error("Failed to save recipe", error);
    alert("Unable to save recipe right now.");
  }
}

// View recipe details via API
async function viewRecipe() {
  const recipeId = $(this).data("id");

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);

    if (!response.ok) {
      throw new Error("Recipe not found");
    }

    const recipe = await response.json();

    // Handle image path
    let imageSrc = recipe.image || fallbackImage;
    if (imageSrc && imageSrc.startsWith("/images/")) {
      imageSrc = `http://localhost:5000${imageSrc}`;
    }

    $("#viewRecipeContent").html(`
      <img src="${imageSrc}" class="img-fluid mb-3" style="max-height: 300px; width: 100%; object-fit: cover;"
           onerror="this.onerror=null;this.src='${fallbackImage}';">
      <h3>${recipe.title}</h3>
      <span class="badge bg-secondary mb-3">${recipe.category}</span>
      <h5>Ingredients</h5>
      <pre style="white-space: pre-wrap; font-family: inherit;">${recipe.ingredients}</pre>
      <h5>Instructions</h5>
      <pre style="white-space: pre-wrap; font-family: inherit;">${recipe.instructions}</pre>
      <button class="btn btn-success w-100 mt-3 save-to-favorites-btn" data-recipe="${recipe.id}">Save to Favorites</button>
    `);

    $("#deleteRecipeBtn").data("id", recipe.id);
    $("#viewRecipeModal").modal("show");
  } catch (error) {
    console.error("Failed to load recipe", error);
    alert("Unable to load recipe details.");
  }
}

// Delete recipe via API
async function deleteRecipe() {
  const recipeId = $(this).data("id");
  if (!recipeId) return;

  if (!confirm("Are you sure you want to delete this recipe?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete recipe");
    }

    $("#viewRecipeModal").modal("hide");
    await Promise.all([loadAllRecipes(), loadSavedRecipes()]);
  } catch (error) {
    console.error("Failed to delete recipe", error);
    alert(error.message || "Unable to delete recipe right now.");
  }
}

// ==================== FAVORITES ====================
// Add recipe to favorites via API
async function saveToFavorites() {
  if (!currentUser) {
    alert("Please log in to save recipes.");
    return;
  }

  const recipeId = $(this).data("recipe");

  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({ recipeId: parseInt(recipeId) }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.message?.includes("already")) {
        alert("Already in your favorites!");
        return;
      }
      throw new Error(error.message || "Failed to save favorite");
    }

    alert("Recipe saved!");
    await loadSavedRecipes();
    $("#viewRecipeModal").modal("hide");
  } catch (error) {
    console.error("Failed to save favorite", error);
    alert("Unable to save recipe to favorites.");
  }
}

// Load user's favorite recipes via API
async function loadSavedRecipes() {
  const container = $("#savedRecipeGrid");
  if (!container.length || !currentUser) return;

  container.empty();

  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to load favorites");
    }

    const favorites = await response.json();

    if (favorites.length === 0) {
      container.html("<p class='text-muted'>No saved recipes yet.</p>");
      return;
    }

    favorites.forEach((favorite) => {
      // Handle image path
      let imageSrc = favorite.recipeImage || fallbackImage;
      if (imageSrc && imageSrc.startsWith("/images/")) {
        imageSrc = `http://localhost:5000${imageSrc}`;
      }

      container.append(`
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm border-success">
            <img src="${imageSrc}" class="card-img-top" style="height: 150px; object-fit: cover;"
                 onerror="this.onerror=null;this.src='${fallbackImage}';">
            <div class="card-body d-flex flex-column gap-2">
              <h6 class="card-title">${favorite.recipeTitle}</h6>
              <div>
                <button class="btn btn-sm btn-danger unsave-btn" data-id="${favorite.id}">Remove</button>
                <button class="btn btn-sm btn-primary viewRecipeBtn" data-id="${favorite.recipeId}">View</button>
              </div>
            </div>
          </div>
        </div>`);
    });
  } catch (error) {
    console.error("Failed to load favorites", error);
    container.html(
      "<p class='text-danger'>Unable to load saved recipes right now.</p>"
    );
  }
}

// Remove recipe from favorites via API
async function unsaveRecipe() {
  const favoriteId = $(this).data("id");
  if (!favoriteId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to remove favorite");
    }

    await loadSavedRecipes();
  } catch (error) {
    console.error("Failed to remove saved recipe", error);
    alert("Unable to remove recipe right now.");
  }
}
