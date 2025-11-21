import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const fallbackImage = "https://placehold.co/600x400?text=Recipe+Image";
let allRecipes = [];
let currentUser = null;

const path = window.location.pathname;
const isDashboardPage =
  path.endsWith("/") || path.endsWith("index.html") || path === "/index.html";
const isLoginPage = path.endsWith("login.html");
const isSignupPage = path.endsWith("signup.html");

initialize();

function initialize() {
  registerFormHandlers();
  registerUIListeners();
  monitorAuthState();
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
    await signOut(auth);
    window.location.href = "landing.html";
  });
}

function monitorAuthState() {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (isDashboardPage) {
      if (!user) {
        window.location.href = "landing.html";
        return;
      }

      await loadAllRecipes();
      await loadSavedRecipes();
    } else if ((isLoginPage || isSignupPage) && user) {
      window.location.href = "index.html";
    }
  });
}

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
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }

    await setDoc(doc(db, "users", credential.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
    });

    alert("Signup successful! Redirecting you to your recipes...");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Signup error", error);
    alert(error.message || "Unable to sign up. Please try again.");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = $("#loginUsername").val();
  const password = $("#loginPassword").val();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error", error);
    alert("Invalid email or password.");
  }
}

async function loadAllRecipes() {
  try {
    const snapshot = await getDocs(collection(db, "recipes"));
    allRecipes = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
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
    grid.append(`
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${recipe.image}" class="card-img-top" style="height: 200px; object-fit: cover;"
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

async function saveRecipe() {
  if (!currentUser) {
    alert("Please log in before adding recipes.");
    return;
  }

  const title = $("#recipeTitle").val();
  const category = $("#recipeCategory").val();
  const ingredients = $("#recipeIngredients").val();
  const instructions = $("#recipeInstructions").val();
  const image =
    $("#recipeImageURL").val() ||
    "https://placehold.co/600x400?text=New+Recipe";

  if (!title || !ingredients) {
    alert("Please fill in Title and Ingredients");
    return;
  }

  try {
    await addDoc(collection(db, "recipes"), {
      title,
      category,
      ingredients,
      instructions,
      image,
      ownerId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    $("#addRecipeModal").modal("hide");
    $("#addRecipeForm")[0].reset();
    await loadAllRecipes();
  } catch (error) {
    console.error("Failed to save recipe", error);
    alert("Unable to save recipe right now.");
  }
}

async function viewRecipe() {
  const recipeId = $(this).data("id");

  try {
    const recipeSnapshot = await getDoc(doc(db, "recipes", recipeId));
    if (!recipeSnapshot.exists()) {
      alert("Recipe not found");
      return;
    }

    const recipe = { id: recipeSnapshot.id, ...recipeSnapshot.data() };

    $("#viewRecipeContent").html(`
      <img src="${recipe.image}" class="img-fluid mb-3" style="max-height: 300px; width: 100%; object-fit: cover;"
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

async function deleteRecipe() {
  const recipeId = $(this).data("id");
  if (!recipeId) return;

  if (!confirm("Are you sure you want to delete this recipe?")) {
    return;
  }

  try {
    const recipeRef = doc(db, "recipes", recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (
      recipeSnap.exists() &&
      recipeSnap.data().ownerId &&
      recipeSnap.data().ownerId !== currentUser?.uid
    ) {
      alert("You can only delete recipes you created.");
      return;
    }

    await deleteDoc(recipeRef);
    $("#viewRecipeModal").modal("hide");
    await Promise.all([loadAllRecipes(), loadSavedRecipes()]);
  } catch (error) {
    console.error("Failed to delete recipe", error);
    alert("Unable to delete recipe right now.");
  }
}

async function saveToFavorites() {
  if (!currentUser) {
    alert("Please log in to save recipes.");
    return;
  }

  const recipeId = $(this).data("recipe");

  try {
    const favoritesRef = collection(db, "favorites");
    const duplicateQuery = query(
      favoritesRef,
      where("userId", "==", currentUser.uid),
      where("recipeId", "==", recipeId)
    );
    const duplicateSnapshot = await getDocs(duplicateQuery);

    if (!duplicateSnapshot.empty) {
      alert("Already in your favorites!");
      return;
    }

    await addDoc(favoritesRef, {
      userId: currentUser.uid,
      recipeId,
      savedAt: serverTimestamp(),
    });

    alert("Recipe saved!");
    await loadSavedRecipes();
    $("#viewRecipeModal").modal("hide");
  } catch (error) {
    console.error("Failed to save favorite", error);
    alert("Unable to save recipe to favorites.");
  }
}

async function loadSavedRecipes() {
  const container = $("#savedRecipeGrid");
  if (!container.length || !currentUser) return;

  container.empty();

  try {
    const favoritesRef = collection(db, "favorites");
    const favoritesQuery = query(
      favoritesRef,
      where("userId", "==", currentUser.uid)
    );
    const favoriteSnapshot = await getDocs(favoritesQuery);

    if (favoriteSnapshot.empty) {
      container.html("<p class='text-muted'>No saved recipes yet.</p>");
      return;
    }

    const favoriteCards = await Promise.all(
      favoriteSnapshot.docs.map(async (favoriteDoc) => {
        const favoriteData = favoriteDoc.data();
        try {
          const recipeDoc = await getDoc(
            doc(db, "recipes", favoriteData.recipeId)
          );

          if (!recipeDoc.exists()) {
            await deleteDoc(doc(db, "favorites", favoriteDoc.id));
            return null;
          }

          const recipe = { id: recipeDoc.id, ...recipeDoc.data() };

          return `
            <div class="col-md-4 mb-4">
              <div class="card h-100 shadow-sm border-success">
                <img src="${recipe.image}" class="card-img-top" style="height: 150px; object-fit: cover;"
                     onerror="this.onerror=null;this.src='${fallbackImage}';">
                <div class="card-body d-flex flex-column gap-2">
                  <h6 class="card-title">${recipe.title}</h6>
                  <div>
                    <button class="btn btn-sm btn-danger unsave-btn" data-id="${favoriteDoc.id}">Remove</button>
                    <button class="btn btn-sm btn-primary viewRecipeBtn" data-id="${recipe.id}">View</button>
                  </div>
                </div>
              </div>
            </div>`;
        } catch (error) {
          console.error("Failed to load saved recipe", error);
          return null;
        }
      })
    );

    favoriteCards
      .filter(Boolean)
      .forEach((cardMarkup) => container.append(cardMarkup));
  } catch (error) {
    console.error("Failed to load favorites", error);
    container.html(
      "<p class='text-danger'>Unable to load saved recipes right now.</p>"
    );
  }
}

async function unsaveRecipe() {
  const favoriteId = $(this).data("id");
  if (!favoriteId) return;

  try {
    await deleteDoc(doc(db, "favorites", favoriteId));
    await loadSavedRecipes();
  } catch (error) {
    console.error("Failed to remove saved recipe", error);
    alert("Unable to remove recipe right now.");
  }
}
