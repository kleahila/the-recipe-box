const API_URL = "http://localhost:3000";

// Store user info in localStorage for session simulation
function setSession(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}
function getSessionUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}
function clearSession() {
  localStorage.removeItem("currentUser");
}

// SIGNUP LOGIC
$(document).on("submit", "#signupForm", function (e) {
  e.preventDefault();
  const name = $("#signupName").val();
  const email = $("#signupEmail").val();
  const password = $("#signupPassword").val();
  const confirm = $("#signupConfirmPassword").val();

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  // Simple username from email
  const username = email.split("@")[0];
  // Check if user exists
  $.get(`${API_URL}/users?email=${email}`, (users) => {
    if (users.length > 0) {
      alert("User already exists!");
    } else {
      // Register user
      $.post(
        `${API_URL}/users`,
        {
          name,
          email,
          username,
          password,
          savedRecipes: [],
        },
        (user) => {
          setSession(user);
          window.location.href = "index.html";
        }
      );
    }
  });
});

// LOGIN LOGIC
$(document).on("submit", "#loginForm", function (e) {
  e.preventDefault();
  const username = $("#loginUsername").val();
  const password = $("#loginPassword").val();

  $.get(
    `${API_URL}/users?username=${username}&password=${password}`,
    (users) => {
      if (users.length === 1) {
        setSession(users[0]);
        window.location.href = "index.html";
      } else {
        alert("Invalid credentials.");
      }
    }
  );
});

// LOGOUT LOGIC
$(document).on("click", ".nav-link[href='landing.html']", function (e) {
  clearSession();
});

// On main/index.html — load recipes, filter/search, add/save/delete
if (location.pathname.endsWith("index.html")) {
  $(document).ready(function () {
    let currentUser = getSessionUser();
    if (!currentUser) {
      window.location.href = "landing.html";
      return;
    }

    // Load all recipes
    function loadRecipes() {
      $.get(`${API_URL}/recipes`, (recipes) => {
        renderRecipes(recipes);
      });
    }

    function renderRecipes(recipes) {
      $("#recipeGrid").empty();
      recipes.forEach((recipe) => {
        $("#recipeGrid").append(`
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <img src="${
                              recipe.image
                            }" class="card-img-top" alt="${recipe.title}">
                            <div class="card-body">
                                <h5 class="card-title">${recipe.title}</h5>
                                <p class="card-text">${recipe.category}</p>
                                <button class="btn btn-primary view-btn" data-id="${
                                  recipe.id
                                }">View</button>
                                <button class="btn btn-outline-danger save-btn" data-id="${
                                  recipe.id
                                }"><i class="bi bi-bookmark-heart${
          currentUser.savedRecipes.includes(recipe.id) ? "-fill" : ""
        }"></i></button>
                            </div>
                        </div>
                    </div>
                `);
      });
    }

    // Load saved recipes
    function loadSavedRecipes() {
      let saved = currentUser.savedRecipes || [];
      $("#savedRecipeGrid").empty();
      if (saved.length === 0) {
        $("#savedRecipeGrid").append(
          '<div class="col">No favorites yet.</div>'
        );
        return;
      }
      saved.forEach((id) => {
        $.get(`${API_URL}/recipes/${id}`, (recipe) => {
          $("#savedRecipeGrid").append(`
                        <div class="col-md-4 mb-4">
                            <div class="card h-100 shadow-sm">
                                <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${recipe.title}</h5>
                                    <p class="card-text">${recipe.category}</p>
                                    <button class="btn btn-primary view-btn" data-id="${recipe.id}">View</button>
                                    <button class="btn btn-danger unsave-btn" data-id="${recipe.id}"><i class="bi bi-x-circle"></i> Remove</button>
                                </div>
                            </div>
                        </div>
                    `);
        });
      });
    }

    // Filtering and searching
    $("#searchInput").on("input", function () {
      const query = $(this).val().toLowerCase();
      $.get(`${API_URL}/recipes`, (recipes) => {
        const filtered = recipes.filter((r) =>
          r.title.toLowerCase().includes(query)
        );
        renderRecipes(filtered);
      });
    });
    $("#categoryFilter").change(function () {
      const cat = $(this).val();
      $.get(`${API_URL}/recipes`, (recipes) => {
        const filtered = cat
          ? recipes.filter((r) => r.category === cat)
          : recipes;
        renderRecipes(filtered);
      });
    });

    // Save/Unsave recipe handlers
    $(document).on("click", ".save-btn", function () {
      let id = Number($(this).data("id"));
      if (!currentUser.savedRecipes.includes(id))
        currentUser.savedRecipes.push(id);
      $.ajax({
        url: `${API_URL}/users/${currentUser.id}`,
        method: "PATCH",
        data: JSON.stringify({ savedRecipes: currentUser.savedRecipes }),
        contentType: "application/json",
        success: function (u) {
          setSession(u);
          currentUser = u;
          loadSavedRecipes();
          loadRecipes();
        },
      });
    });

    $(document).on("click", ".unsave-btn", function () {
      let id = Number($(this).data("id"));
      currentUser.savedRecipes = currentUser.savedRecipes.filter(
        (rid) => rid !== id
      );
      $.ajax({
        url: `${API_URL}/users/${currentUser.id}`,
        method: "PATCH",
        data: JSON.stringify({ savedRecipes: currentUser.savedRecipes }),
        contentType: "application/json",
        success: function (u) {
          setSession(u);
          currentUser = u;
          loadSavedRecipes();
          loadRecipes();
        },
      });
    });

    // Add recipe
    $("#saveRecipeBtn").click(function (e) {
      e.preventDefault();
      const title = $("#recipeTitle").val();
      const category = $("#recipeCategory").val();
      const ingredients = $("#recipeIngredients").val().split("\n");
      const instructions = $("#recipeInstructions").val().split("\n");
      const image = $("#recipeImageURL").val();

      $.post(
        `${API_URL}/recipes`,
        {
          title,
          category,
          ingredients,
          instructions,
          image,
        },
        function (recipe) {
          $("#addRecipeModal").modal("hide");
          loadRecipes();
        }
      );
    });

    // Load recipe modal details
    $(document).on("click", ".view-btn", function () {
      let id = $(this).data("id");
      $.get(`${API_URL}/recipes/${id}`, (recipe) => {
        let html = `
                <img src="${recipe.image}" class="img-fluid mb-3">
                <h5>Ingredients</h5>
                <ul>${(recipe.ingredients || [])
                  .map((i) => `<li>${i}</li>`)
                  .join("")}</ul>
                <h5>Instructions</h5>
                <ol>${(recipe.instructions || [])
                  .map((step) => `<li>${step}</li>`)
                  .join("")}</ol>
                `;
        $("#viewRecipeContent").html(html);
        $("#viewRecipeModal").modal("show");
      });
    });

    // Initial load
    loadRecipes();
    loadSavedRecipes();
  });
}
