$(document).ready(function() {
    // Sample data
    const sampleRecipes = [
        {
            id: 1,
            title: "Pancakes",
            category: "Breakfast",
            ingredients: "Flour, Milk, Eggs, Sugar, Baking Powder",
            instructions: "Mix ingredients and cook on a griddle.",
            imageURL: "images/pancakes.jpg",
            likes: 10
        },
        {
            id: 2,
            title: "Spaghetti Carbonara",
            category: "Dinner",
            ingredients: "Spaghetti, Eggs, Bacon, Parmesan, Black Pepper",
            instructions: "Cook pasta, fry bacon, mix with eggs and cheese.",
            imageURL: "images/spaghetti.jpg",
            likes: 15
        },
        {
            id: 3,
            title: "Chocolate Cake",
            category: "Dessert",
            ingredients: "Flour, Sugar, Cocoa, Eggs, Milk, Butter",
            instructions: "Bake at 350°F for 30 minutes.",
            imageURL: "images/cake.jpg",
            likes: 20
        }
    ];

    const sampleTestimonials = [
        {
            name: "Alice",
            text: "Love this recipe box! So easy to find new meals.",
            image: "images/alice.jpg"
        },
        {
            name: "Bob",
            text: "Great community and amazing recipes.",
            image: "images/bob.jpg"
        }
    ];

    // Initialize localStorage if empty
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('recipes')) {
        localStorage.setItem('recipes', JSON.stringify(sampleRecipes));
    }
    if (!localStorage.getItem('testimonials')) {
        localStorage.setItem('testimonials', JSON.stringify(sampleTestimonials));
    }
    if (!localStorage.getItem('comments')) {
        localStorage.setItem('comments', JSON.stringify([]));
    }

    let currentRecipeId = null;
    let isEditing = false;

    // Check session
    function checkSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }

    // Load recipes
    function loadRecipes(filterCategory = '', searchTerm = '', savedOnly = false) {
        const recipes = JSON.parse(localStorage.getItem('recipes'));
        const currentUser = localStorage.getItem('currentUser');
        const savedRecipes = currentUser ? JSON.parse(localStorage.getItem(`savedRecipes_${currentUser}`) || '[]') : [];
        const likedRecipes = currentUser ? JSON.parse(localStorage.getItem(`likedRecipes_${currentUser}`) || '[]') : [];

        let filteredRecipes = recipes.filter(recipe => {
            const matchesCategory = !filterCategory || recipe.category === filterCategory;
            const matchesSearch = !searchTerm ||
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSaved = !savedOnly || savedRecipes.includes(recipe.id);
            return matchesCategory && matchesSearch && matchesSaved;
        });

        const container = savedOnly ? '#savedRecipeGrid' : '#recipeGrid';
        $(container).empty();

        filteredRecipes.forEach(recipe => {
            const isLiked = likedRecipes.includes(recipe.id);
            const isSaved = savedRecipes.includes(recipe.id);
            const card = `
                <div class="col-md-4 recipe-card">
                    <div class="card">
                        <img src="${recipe.imageURL}" class="card-img-top" alt="${recipe.title}">
                        <div class="card-body">
                            <h5 class="card-title">${recipe.title}</h5>
                            <p class="card-text">${recipe.category}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="like-icon ${isLiked ? 'liked' : ''} bi bi-heart" data-id="${recipe.id}"></i>
                                    <span class="likes-count">${recipe.likes}</span>
                                    <i class="save-icon ${isSaved ? 'saved' : ''} bi bi-bookmark ms-2" data-id="${recipe.id}"></i>
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

    // Load testimonials
    function loadTestimonials() {
        const testimonials = JSON.parse(localStorage.getItem('testimonials'));
        $('#testimonials').empty();
        testimonials.forEach(testimonial => {
            const card = `
                <div class="col-md-6">
                    <div class="card testimonial-card">
                        <div class="card-body d-flex">
                            <img src="${testimonial.image}" alt="${testimonial.name}">
                            <div>
                                <h6>${testimonial.name}</h6>
                                <p>${testimonial.text}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('#testimonials').append(card);
        });
    }

    // Load comments
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments'));
        $('#comments').empty();
        comments.forEach(comment => {
            const commentDiv = `<div class="comment"><strong>${comment.user}:</strong> ${comment.text}</div>`;
            $('#comments').append(commentDiv);
        });
    }

    // Signup form
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        const username = $('#signupUsername').val();
        const email = $('#signupEmail').val();
        const password = $('#signupPassword').val();
        const confirmPassword = $('#signupConfirmPassword').val();

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users'));
        if (users.find(user => user.username === username)) {
            alert('Username already exists!');
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', username);
        window.location.href = 'index.html';
    });

    // Login form
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        const username = $('#loginUsername').val();
        const password = $('#loginPassword').val();
        const rememberMe = $('#rememberMe').is(':checked');

        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'index.html';
        } else {
            alert('Invalid credentials!');
        }
    });

    // Logout
    $('#logout-link').click(function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // Add/Edit recipe
    $('#saveRecipeBtn').click(function() {
        const title = $('#recipeTitle').val();
        const category = $('#recipeCategory').val();
        const ingredients = $('#recipeIngredients').val();
        const instructions = $('#recipeInstructions').val();
        const imageURL = $('#recipeImageURL').val() || 'images/default.jpg';

        const recipes = JSON.parse(localStorage.getItem('recipes'));

        if (isEditing) {
            const recipe = recipes.find(r => r.id === currentRecipeId);
            recipe.title = title;
            recipe.category = category;
            recipe.ingredients = ingredients;
            recipe.instructions = instructions;
            recipe.imageURL = imageURL;
        } else {
            const newRecipe = {
                id: Date.now(),
                title,
                category,
                ingredients,
                instructions,
                imageURL,
                likes: 0
            };
            recipes.push(newRecipe);
        }

        localStorage.setItem('recipes', JSON.stringify(recipes));

        $('#addRecipeModal').modal('hide');
        $('#addRecipeForm')[0].reset();
        isEditing = false;
        currentRecipeId = null;
        $('#addRecipeModalLabel').text('Add New Recipe');
        $('#saveRecipeBtn').text('Save Recipe');
        loadRecipes();
    });

    // View recipe
    $(document).on('click', '.view-recipe', function() {
        currentRecipeId = $(this).data('id');
        const recipes = JSON.parse(localStorage.getItem('recipes'));
        const recipe = recipes.find(r => r.id === currentRecipeId);

        $('#viewRecipeContent').html(`
            <img src="${recipe.imageURL}" class="img-fluid mb-3" alt="${recipe.title}">
            <h4>${recipe.title}</h4>
            <p><strong>Category:</strong> ${recipe.category}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>${recipe.ingredients.split(',').map(i => `<li>${i.trim()}</li>`).join('')}</ul>
            <p><strong>Instructions:</strong></p>
            <p>${recipe.instructions}</p>
        `);

        $('#viewRecipeModal').modal('show');
    });

    // Edit recipe
    $('#editRecipeBtn').click(function() {
        const recipes = JSON.parse(localStorage.getItem('recipes'));
        const recipe = recipes.find(r => r.id === currentRecipeId);

        $('#recipeTitle').val(recipe.title);
        $('#recipeCategory').val(recipe.category);
        $('#recipeIngredients').val(recipe.ingredients);
        $('#recipeInstructions').val(recipe.instructions);
        $('#recipeImageURL').val(recipe.imageURL);

        isEditing = true;
        $('#addRecipeModalLabel').text('Edit Recipe');
        $('#saveRecipeBtn').text('Update Recipe');
        $('#viewRecipeModal').modal('hide');
        $('#addRecipeModal').modal('show');
    });

    // Delete recipe
    $('#deleteRecipeBtn').click(function() {
        if (confirm('Are you sure you want to delete this recipe?')) {
            const recipes = JSON.parse(localStorage.getItem('recipes'));
            const updatedRecipes = recipes.filter(r => r.id !== currentRecipeId);
            localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
            $('#viewRecipeModal').modal('hide');
            loadRecipes();
        }
    });

    // Like recipe
    $(document).on('click', '.like-icon', function() {
        const id = $(this).data('id');
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        let likedRecipes = JSON.parse(localStorage.getItem(`likedRecipes_${currentUser}`) || '[]');
        const recipes = JSON.parse(localStorage.getItem('recipes'));
        const recipe = recipes.find(r => r.id === id);

        if (likedRecipes.includes(id)) {
            likedRecipes = likedRecipes.filter(l => l !== id);
            recipe.likes--;
            $(this).removeClass('liked');
        } else {
            likedRecipes.push(id);
            recipe.likes++;
            $(this).addClass('liked');
        }

        localStorage.setItem(`likedRecipes_${currentUser}`, JSON.stringify(likedRecipes));
        localStorage.setItem('recipes', JSON.stringify(recipes));
        $(this).next('.likes-count').text(recipe.likes);
    });

    // Save recipe
    $(document).on('click', '.save-icon', function() {
        const id = $(this).data('id');
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        let savedRecipes = JSON.parse(localStorage.getItem(`savedRecipes_${currentUser}`) || '[]');

        if (savedRecipes.includes(id)) {
            savedRecipes = savedRecipes.filter(s => s !== id);
            $(this).removeClass('saved');
        } else {
            savedRecipes.push(id);
            $(this).addClass('saved');
        }

        localStorage.setItem(`savedRecipes_${currentUser}`, JSON.stringify(savedRecipes));
    });

    // Search and filter
    $('#searchInput').on('input', function() {
        const searchTerm = $(this).val();
        const category = $('#categoryFilter').val();
        loadRecipes(category, searchTerm);
    });

    $('#categoryFilter').change(function() {
        const category = $(this).val();
        const searchTerm = $('#searchInput').val();
        loadRecipes(category, searchTerm);
    });

    // Post comment
    $('#postCommentBtn').click(function() {
        const commentText = $('#commentInput').val();
        const currentUser = localStorage.getItem('currentUser');
        if (!commentText || !currentUser) return;

        const comments = JSON.parse(localStorage.getItem('comments'));
        comments.push({ user: currentUser, text: commentText });
        localStorage.setItem('comments', JSON.stringify(comments));

        $('#commentInput').val('');
        loadComments();
    });

    // Navbar smooth scroll
    $('.nav-link').click(function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        if (target.startsWith('#')) {
            $('html, body').animate({
                scrollTop: $(target).offset().top - 70
            }, 500);
        } else if (target === '#saved') {
            loadRecipes('', '', true);
            $('html, body').animate({
                scrollTop: $('#saved').offset().top - 70
            }, 500);
        }
    });

    // Initialize
    if (window.location.pathname.includes('index.html')) {
        checkSession();
        loadRecipes();
        loadTestimonials();
        loadComments();
    }
});
