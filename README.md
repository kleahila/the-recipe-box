# The Recipe Box 🍳

The Recipe Box is a lightweight web application that lets food lovers discover, create, and save their favorite recipes. The UI is built with Bootstrap, while authentication, protected routes, and data persistence now run on **Firebase Authentication** and **Cloud Firestore**—no local JSON server required.

## 🚀 Features

- **Secure Firebase Auth:** Sign up, login, and logout with real email/password accounts.
- **Protected Dashboard:** `index.html` automatically redirects unauthenticated visitors back to the landing page.
- **Recipe CRUD:** Create, read, update (via re-save), and delete recipes stored in Firestore.
- **Favorites:** Save recipes to a personal favorites list backed by Firestore collections.
- **Search & Filter:** Client-side filtering by title and category for quick discovery.
- **Responsive Design:** Bootstrap 5 and custom CSS keep everything looking sharp across devices.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (jQuery)
- **Backend-as-a-Service:** Firebase Authentication + Cloud Firestore
- **Tooling:** Any static file server (VS Code Live Server, `npx serve`, or your preferred host)

## 📋 Prerequisites

- A Firebase project with Email/Password authentication enabled
- A Firestore database (in Native mode)
- Optional: Node.js if you plan to run a local static server via `npx`

## ⚙️ Setup & Run

1. **Clone the project** and open it in VS Code (or your editor of choice).
2. **Configure Firebase:**
   - Open `firebase.js` and replace the placeholder config with your Firebase project's credentials.
   - Ensure Authentication (Email/Password) and Firestore are enabled in the Firebase console.
3. **Serve the files:**
   - Use VS Code's Live Server extension, or run `npx serve .` from the project root, then open the provided URL.
4. **Create content:** from the dashboard you can add recipes, view them, delete ones you own, and save any recipe to favorites. All data immediately persists to Firestore.

## 🔒 Firebase Security Rules (Suggested)

Update your Firestore rules so users can only modify their own data:

```text
rules_version = '2';
service cloud.firestore {
    match /databases/{database}/documents {
        match /recipes/{recipeId} {
            allow read: if true;
            allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
        }

        match /favorites/{favoriteId} {
            allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
        }

        match /users/{userId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
        }
    }
}
```

## 📂 Project Structure

```text
/the-recipe-box
│── assets/              # Images, fonts, and extra CSS
│── firebase.js          # Firebase initialization + exports for auth/db
│── index.html           # Main dashboard (protected)
│── landing.html         # Public landing page
│── login.html           # Login page
│── signup.html          # Signup page
│── script.js            # Frontend logic (auth + Firestore CRUD)
│── style.css            # Custom styling
│── package.json         # Optional scripts for serving the site
└── README.md            # Documentation
```

Enjoy building and sharing your favorite recipes with real backend superpowers! 🍽️
