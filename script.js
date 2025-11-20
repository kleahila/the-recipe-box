const API_URL = "http://localhost:3000";
let allRecipes = [];

// =================================================
//  AUTH: SIGNUP
// =================================================
if ($("#signupForm").length) {
  $("#signupForm").on("submit", function (e) {
    e.preventDefault();
    const name = $("#signupName").val();
    const email = $("#signupEmail").val();
    const password = $("#signupPassword").val();
    const confirmPassword = $("#signupConfirmPassword").val();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    fetch(`${API_URL}/users?email=${email}`)
      .then((res) => res.json())
      .then((users) => {
        if (users.length > 0) {
          alert("User already exists.");
        } else {
          fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }).then(() => {
            alert("Signup successful! Please login.");
            window.location.href = "login.html";
          });
        }
      });
  });
}

// =================================================
//  AUTH: LOGIN
// =================================================
if ($("#loginForm").length) {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();
    const username = $("#loginUsername").val();
    const password = $("#loginPassword").val();

    fetch(`${API_URL}/users?email=${username}&password=${password}`)
      .then((res) => res.json())
      .then((users) => {
        if (users.length > 0) {
          localStorage.setItem("currentUser", JSON.stringify(users[0]));
          window.location.href = "index.html";
        } else {
          alert("Invalid email or password.");
        }
      });
  });
}

// =================================================
//  DASHBOARD LOGIC
// =================================================
if (window.location.pathname.includes("index.html")) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    window.location.href = "landing.html";
  }

  loadAllRecipes();
  loadSavedRecipes();

  $(".logout").on("click", function () {
    localStorage.removeItem("currentUser");
  });

  $("#searchInput, #categoryFilter").on("input change", function () {
    filterRecipes();
  });
}

// =================================================
//  LOAD & RENDER RECIPES
// =================================================
function loadAllRecipes() {
  fetch(`${API_URL}/recipes`)
    .then((res) => res.json())
    .then((data) => {
      allRecipes = data;
      renderRecipes(data);
    });
}

function renderRecipes(recipes) {
  const grid = $("#recipeGrid");
  grid.empty();

  // 600x400 grey placeholder if image fails
  const fallbackImage = "https://placehold.co/600x400?text=Recipe+Image";

  recipes.forEach((r) => {
    grid.append(`
            <div class="col-md-4">
                <div class="card h-100 shadow-sm">
                    <img src="${r.image}" class="card-img-top" style="height: 200px; object-fit: cover;"
                         onerror="this.onerror=null;this.src='${fallbackImage}';">
                    <div class="card-body">
                        <h5 class="card-title">${r.title}</h5>
                        <p class="card-text text-muted">${r.category}</p>
                        <button class="btn btn-primary viewRecipeBtn" data-id="${r.id}">View Recipe</button>
                    </div>
                </div>
            </div>
        `);
  });
}

function filterRecipes() {
  const term = $("#searchInput").val().toLowerCase();
  const category = $("#categoryFilter").val();

  const filtered = allRecipes.filter((r) => {
    const matchesTerm = r.title.toLowerCase().includes(term);
    const matchesCat = category === "" || r.category === category;
    return matchesTerm && matchesCat;
  });

  renderRecipes(filtered);
}

// =================================================
//  ADD NEW RECIPE
// =================================================
$(document).on("click", "#saveRecipeBtn", function () {
  const title = $("#recipeTitle").val();
  const category = $("#recipeCategory").val();
  const ingredients = $("#recipeIngredients").val();
  const instructions = $("#recipeInstructions").val();
  // Use a placeholder if they don't provide a URL
  const image =
    $("#recipeImageURL").val() ||
    "https://placehold.co/600x400?text=New+Recipe";

  if (!title || !ingredients) {
    alert("Please fill in Title and Ingredients");
    return;
  }

  const newRecipe = { title, category, ingredients, instructions, image };

  fetch(`${API_URL}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRecipe),
  }).then(() => {
    $("#addRecipeModal").modal("hide");
    $("#addRecipeForm")[0].reset();
    loadAllRecipes();
  });
});

// =================================================
//  VIEW RECIPE DETAILS
// =================================================
$(document).on("click", ".viewRecipeBtn", function () {
  const id = $(this).data("id");
  const fallbackImage = "https://placehold.co/600x400?text=Recipe+Image";

  fetch(`${API_URL}/recipes/${id}`)
    .then((res) => res.json())
    .then((r) => {
      $("#viewRecipeContent").html(`
                <img src="${r.image}" class="img-fluid mb-3" style="max-height: 300px; width: 100%; object-fit: cover;"
                     onerror="this.onerror=null;this.src='${fallbackImage}';">
                <h3>${r.title}</h3>
                <span class="badge bg-secondary mb-3">${r.category}</span>
                <h5>Ingredients</h5>
                <pre style="white-space: pre-wrap; font-family: inherit;">${r.ingredients}</pre>
                <h5>Instructions</h5>
                <pre style="white-space: pre-wrap; font-family: inherit;">${r.instructions}</pre>
                <button class="btn btn-success w-100 mt-3 save-to-favorites-btn" data-recipe="${r.id}">Save to Favorites</button>
            `);

      $("#deleteRecipeBtn").data("id", id);
      $("#viewRecipeModal").modal("show");
    });
});

// =================================================
//  DELETE RECIPE
// =================================================
$(document).on("click", "#deleteRecipeBtn", function () {
  const id = $(this).data("id");
  if (confirm("Are you sure you want to delete this recipe?")) {
    fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" }).then(() => {
      $("#viewRecipeModal").modal("hide");
      loadAllRecipes();
      loadSavedRecipes();
    });
  }
});

// =================================================
//  SAVE RECIPE TO FAVORITES
// =================================================
$(document).on("click", ".save-to-favorites-btn", function () {
  const recipeId = $(this).data("recipe");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  fetch(`${API_URL}/saved?userId=${user.id}&recipeId=${recipeId}`)
    .then((res) => res.json())
    .then((existing) => {
      if (existing.length > 0) {
        alert("Already in your favorites!");
      } else {
        fetch(`${API_URL}/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, recipeId: recipeId }),
        }).then(() => {
          alert("Recipe saved!");
          loadSavedRecipes();
          $("#viewRecipeModal").modal("hide");
        });
      }
    });
});

// =================================================
//  LOAD SAVED RECIPES
// =================================================
function loadSavedRecipes() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const container = $("#savedRecipeGrid");
  const fallbackImage = "https://placehold.co/600x400?text=Recipe+Image";

  container.empty();

  fetch(`${API_URL}/saved?userId=${user.id}`)
    .then((res) => res.json())
    .then((savedItems) => {
      if (savedItems.length === 0) {
        container.html("<p class='text-muted'>No saved recipes yet.</p>");
        return;
      }

      savedItems.forEach((item) => {
        fetch(`${API_URL}/recipes/${item.recipeId}`)
          .then((res) => res.json())
          .then((r) => {
            container.append(`
                            <div class="col-md-4 mb-4">
                                <div class="card h-100 shadow-sm border-success">
                                    <img src="${r.image}" class="card-img-top" style="height: 150px; object-fit: cover;"
                                         onerror="this.onerror=null;this.src='${fallbackImage}';">
                                    <div class="card-body">
                                        <h6 class="card-title">${r.title}</h6>
                                        <button class="btn btn-sm btn-danger unsave-btn" data-id="${item.id}">Remove</button>
                                        <button class="btn btn-sm btn-primary viewRecipeBtn" data-id="${r.id}">View</button>
                                    </div>
                                </div>
                            </div>
                        `);
          })
          .catch(() => {
            fetch(`${API_URL}/saved/${item.id}`, { method: "DELETE" });
          });
      });
    });
}

// =================================================
//  UNSAVE RECIPE
// =================================================
$(document).on("click", ".unsave-btn", function () {
  const id = $(this).data("id");
  fetch(`${API_URL}/saved/${id}`, { method: "DELETE" }).then(() =>
    loadSavedRecipes()
  );
});
