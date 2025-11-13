$(document).ready(function () {
    // ===== Sample Data =====
    const sampleRecipes = [
        {
            id: 1,
            title: "Pancakes",
            category: "Breakfast",
            image: "assets/images/pancakes.jpg",
            ingredients: "Flour, Milk, Eggs, Sugar, Baking Powder",
            instructions: "Mix ingredients and cook on a griddle.",
            likes: 10
        },
        {
            id: 2,
            title: "Spaghetti Carbonara",
            category: "Dinner",
            image: "assets/images/spaghetti.jpg",
            ingredients: "Spaghetti, Eggs, Bacon, Parmesan, Black Pepper",
            instructions: "Cook pasta, fry bacon, mix with eggs and cheese.",
            likes: 15
        },
        {
            id: 3,
            title: "Chocolate Cake",
            category: "Dessert",
            image: "assets/images/cake.jpg",
            ingredients: "Flour, Sugar, Cocoa, Eggs, Milk, Butter",
            instructions: "Bake at 350°F for 30 minutes.",
            likes: 20
        }
    ];

    // ===== Initialize localStorage =====
    if (!localStorage.getItem("users")) localStorage.setItem("users", JSON.stringify([]));
    if (!localStorage.getItem("recipes")) localStorage.setItem("recipes", JSON.stringify(sampleRecipes));

    let currentRecipeId = null;
    let isEditing = false;

    // ===== Session Check =====
    function checkSession() {
        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser && window.location.pathname.includes("index.html")) {
            window.location.href = "login.html";
        }
    }

    // ===== Load Recipes =====
    function loadRecipes(filterCategory = "", searchTerm = "", savedOnly = false) {
        const recipes = JSON.parse(localStorage.getItem("recipes"));
        const currentUser = localStorage.getItem("currentUser");
        const savedRecipes = currentUser ? JSON.parse(localStorage.getItem(`savedRecipes_${currentUser}`) || "[]") : [];
        const likedRecipes = currentUser ? JSON.parse(localStorage.getItem(`likedRecipes_${currentUser}`) || "[]") : [];

        const filteredRecipes = recipes.filter((recipe) => {
            const matchesCategory = !filterCategory || recipe.category === filterCategory;
            const matchesSearch =
                !searchTerm ||
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSaved = !savedOnly || savedRecipes.includes(recipe.id);
            return matchesCategory && matchesSearch && matchesSaved;
        });

        const container = savedOnly ? "#savedRecipeGrid" : "#recipeGrid";
        $(container).empty();

        filteredRecipes.forEach((recipe) => {
            const isLiked = likedRecipes.includes(recipe.id);
            const isSaved = savedRecipes.includes(recipe.id);
            const card = `
                <div class="col-md-4 recipe-card">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${recipe.title}</h5>
                            <p class="card-text">${recipe.category}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="like-icon ${isLiked ? "liked" : ""} bi bi-heart" data-id="${recipe.id}"></i>
                                    <span class="likes-count">${recipe.likes}</span>
                                    <i class="save-icon ${isSaved ? "saved" : ""} bi bi-bookmark ms-2" data-id="${recipe.id}"></i>
                                </div>
                                <button class="btn btn-primary btn-sm view-recipe" data-id="${recipe.id}">View</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(container).append(card);
        });
    }

    // ===== Signup =====
    $("#signupForm").submit(function (e) {
        e.preventDefault();
        const name = $("#signupName").val();
        const email = $("#signupEmail").val();
        const password = $("#signupPassword").val();
        const confirmPassword = $("#signupConfirmPassword").val();

        if (password !== confirmPassword) return alert("Passwords do not match!");

        const users = JSON.parse(localStorage.getItem("users"));
        if (users.find((user) => user.email === email)) return alert("Email already exists!");

        users.push({ username: name, email, password });
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", name);
        window.location.href = "index.html";
    });

    // ===== Login =====
    $("#loginForm").submit(function (e) {
        e.preventDefault();
        const username = $("#loginUsername").val();
        const password = $("#loginPassword").val();

        const users = JSON.parse(localStorage.getItem("users"));
        const user = users.find((u) => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem("currentUser", username);
            window.location.href = "index.html";
        } else alert("Invalid credentials!");
    });

    // ===== Logout =====
    $("#logout-link").click(function (e) {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });

    // ===== Add / Edit Recipe =====
    $("#saveRecipeBtn").click(function () {
        const title = $("#recipeTitle").val();
        const category = $("#recipeCategory").val();
        const ingredients = $("#recipeIngredients").val();
        const instructions = $("#recipeInstructions").val();

        const recipes = JSON.parse(localStorage.getItem("recipes"));

        if (isEditing) {
            const recipe = recipes.find((r) => r.id === currentRecipeId);
            recipe.title = title;
            recipe.category = category;
            recipe.ingredients = ingredients;
            recipe.instructions = instructions;
        } else {
            recipes.push({
                id: Date.now(),
                title,
                category,
                ingredients,
                instructions,
                likes: 0
            });
        }

        localStorage.setItem("recipes", JSON.stringify(recipes));
        $("#addRecipeModal").modal("hide");
        $("#addRecipeForm")[0].reset();
        isEditing = false;
        currentRecipeId = null;
        loadRecipes();
    });

    // ===== View Recipe =====
    $(document).on("click", ".view-recipe", function () {
        currentRecipeId = $(this).data("id");
        const recipes = JSON.parse(localStorage.getItem("recipes"));
        const recipe = recipes.find((r) => r.id === currentRecipeId);

        $("#viewRecipeContent").html(`
            <h4>${recipe.title}</h4>
            <p><strong>Category:</strong> ${recipe.category}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>${recipe.ingredients.split(",").map((i) => `<li>${i.trim()}</li>`).join("")}</ul>
            <p><strong>Instructions:</strong></p>
            <p>${recipe.instructions}</p>
        `);
        $("#viewRecipeModal").modal("show");
    });

    // ===== Edit Recipe =====
    $("#editRecipeBtn").click(function () {
        const recipes = JSON.parse(localStorage.getItem("recipes"));
        const recipe = recipes.find((r) => r.id === currentRecipeId);

        $("#recipeTitle").val(recipe.title);
        $("#recipeCategory").val(recipe.category);
        $("#recipeIngredients").val(recipe.ingredients);
        $("#recipeInstructions").val(recipe.instructions);

        isEditing = true;
        $("#addRecipeModal").modal("show");
        $("#viewRecipeModal").modal("hide");
    });

    // ===== Delete Recipe =====
    $("#deleteRecipeBtn").click(function () {
        if (!confirm("Are you sure?")) return;
        const recipes = JSON.parse(localStorage.getItem("recipes"));
        const updated = recipes.filter((r) => r.id !== currentRecipeId);
        localStorage.setItem("recipes", JSON.stringify(updated));
        $("#viewRecipeModal").modal("hide");
        loadRecipes();
    });

    // ===== Like / Save =====
    $(document).on("click", ".like-icon", function () {
        const id = $(this).data("id");
        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser) return;

        let liked = JSON.parse(localStorage.getItem(`likedRecipes_${currentUser}`) || "[]");
        const recipes = JSON.parse(localStorage.getItem("recipes"));
        const recipe = recipes.find((r) => r.id === id);

        if (liked.includes(id)) {
            liked = liked.filter((l) => l !== id);
            recipe.likes--;
            $(this).removeClass("liked");
        } else {
            liked.push(id);
            recipe.likes++;
            $(this).addClass("liked");
        }

        localStorage.setItem(`likedRecipes_${currentUser}`, JSON.stringify(liked));
        localStorage.setItem("recipes", JSON.stringify(recipes));
        $(this).next(".likes-count").text(recipe.likes);
    });

    $(document).on("click", ".save-icon", function () {
        const id = $(this).data("id");
        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser) return;

        let saved = JSON.parse(localStorage.getItem(`savedRecipes_${currentUser}`) || "[]");
        if (saved.includes(id)) saved = saved.filter((s) => s !== id);
        else saved.push(id);

        $(this).toggleClass("saved");
        localStorage.setItem(`savedRecipes_${currentUser}`, JSON.stringify(saved));
    });

    // ===== Filters =====
    $("#categoryFilter").change(function () {
        const category = $(this).val();
        const searchTerm = $("#searchInput").val();
        loadRecipes(category, searchTerm);
    });

    $("#searchInput").on("input", function () {
        const searchTerm = $(this).val();
        const category = $("#categoryFilter").val();
        loadRecipes(category, searchTerm);
    });

    // ===== Navbar Smooth Scroll =====
    $(".nav-link").click(function (e) {
        e.preventDefault();
        const target = $(this).attr("href");
        if (target.startsWith("#")) {
            $("html, body").animate({ scrollTop: $(target).offset().top - 70 }, 500);
        }
        if (target === "#saved") loadRecipes("", "", true);
    });

    // ===== Initialize =====
    if (window.location.pathname.includes("index.html")) {
        checkSession();
        loadRecipes();
    }
});
