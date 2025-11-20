# The Recipe Box 🍳

The Recipe Box is a lightweight web application that allows users to discover, create, and save their favorite recipes. It features a responsive UI built with Bootstrap and uses a local JSON server to simulate a real backend database.

## 🚀 Features

- **User Authentication:** Sign up and Login functionality (simulated).
- **Recipe Dashboard:** View a dynamic grid of recipes.
- **Search & Filter:** Real-time searching and category filtering.
- **Recipe Management:**
  - **Add:** Create new recipes with ingredients, instructions, and images.
  - **Delete:** Remove recipes from the database.
  - **Save/Favorite:** Save recipes to a personal "Saved" list.
- **Responsive Design:** Works on mobile and desktop.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (jQuery)
- **Backend (Mock):** [json-server](https://github.com/typicode/json-server) (Acts as a REST API)
- **Database:** `db.json` (JSON file storage)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Required to run the JSON server)

## ⚙️ Installation

1.  **Clone or Download the repository** to your local machine.
2.  **Navigate to the project folder** in your terminal:
    ```bash
    cd path/to/the-recipe-box
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
    _(This will download `json-server` automatically based on the `package.json` file)_

## 🏃‍♂️ How to Run

1.  **Start the Backend Server**:
    In your terminal, run the following command to start the database:

    ```bash
    npm start
    ```

    _Alternatively, you can run: `npx json-server --watch db.json --port 3000`_

    You should see a message confirming the server is running at `http://localhost:3000`.

2.  **Launch the Application**:
    - Open the `landing.html` file in your web browser.
    - **Note:** For the best experience, it is recommended to use a live server (like the "Live Server" extension in VS Code), but double-clicking the HTML file will also work for this setup.

## 🔑 Demo Credentials

To log in immediately without signing up, use the default user (if configured in your `db.json`):

- **Email:** `john@example.com`
- **Password:** `password`

## 📂 Project Structure

```text
/the-recipe-box
│── assets/              # Images, fonts, and extra CSS
│── db.json              # The database file (Stores users and recipes)
│── index.html           # Main dashboard (Requires login)
│── landing.html         # Landing page
│── login.html           # Login page
│── signup.html          # Signup page
│── script.js            # Main logic (API calls, Auth, UI updates)
│── style.css            # Custom styling
│── package.json         # Dependency manager
└── README.md            # Documentation
```
