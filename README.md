# 🥗 The Recipe Box

> A full-stack culinary management system built with **ASP.NET Core 8**, **MySQL**, and **Docker**.

![Status](https://img.shields.io/badge/Status-Complete-success)
![Stack](https://img.shields.io/badge/Stack-Fullstack_.NET-purple)
![License](https://img.shields.io/badge/License-Educational-green)

## 📖 Project Overview

The Recipe Box is a modern, distributed web application that allows users to securely organize, share, and discover recipes. Unlike static websites, this application leverages a robust **N-Tier Architecture** to provide persistent data storage, secure user sessions, and dynamic image handling.

**Academic Context:**
This project was engineered as a Capstone Project to demonstrate proficiency in RESTful API design, relational database modeling, and containerized deployment.

---

## 🚀 Getting Started

Follow these steps to get the project running locally in minutes using Docker.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Ensure it is running)
- Git

### Installation & Run

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/your-username/the-recipe-box.git](https://github.com/your-username/the-recipe-box.git)
    cd the-recipe-box
    ```

2.  **Run with Docker Compose**
    This command builds the images, creates the network, and starts the backend (ASP.NET), database (MySQL), and frontend services.

    ```bash
    docker-compose up --build
    ```

    _Note: The first run may take a few moments as the MySQL container initializes and populates the database._

3.  **Access the Application**
    - **Frontend Dashboard:** Open `http://localhost:8080` (Check your terminal for the exact port mapped in compose)
    - **API Documentation (Swagger):** Open `http://localhost:5000/swagger`

---

## 🛠️ Architecture & Tech Stack

We utilized a **Headless Architecture**, strictly decoupling the frontend client from the backend services.

### **Frontend (Client)**

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Communication:** Asynchronous `Fetch API` consuming REST endpoints.
- **Design:** Custom Responsive Grid System.

### **Backend (Server)**

- **Framework:** ASP.NET Core 8 Web API.
- **Language:** C#.
- **Security:** Stateless JWT (JSON Web Token) Authentication & BCrypt Password Hashing.
- **ORM:** Entity Framework Core (Code-First).

### **Database (Data)**

- **System:** MySQL 8.0.
- **Infrastructure:** Docker Containerization for environment consistency.

---

## ✨ Key Features

1.  **Secure Authentication:** Users can register and login. Passwords are never stored in plain text (Salted & Hashed).
2.  **Recipe CRUD:** Full Create, Read, Update, Delete functionality for recipes.
3.  **Image Handling:** Recipes support file uploads, processed and served via the .NET static file handler.
4.  **Smart Search:** Real-time filtering by category and keywords on the client side.
5.  **API Documentation:** Integrated **Swagger UI** for testing endpoints directly.

---

## 📂 Project Structure

```text
the-recipe-box/
├── docker-compose.yml   # Orchestrates Backend, DB, and Frontend services
├── .gitignore           # Specifies files ignored by Git
├── README.md            # Project documentation
├── frontend/            # Client-Side Application
│   ├── assets/          # Images and fonts
│   ├── index.html       # Main Dashboard (Protected)
│   ├── landing.html     # Public Home Page
│   ├── login.html       # Auth Interface
│   ├── script.js        # Core Logic (API calls)
│   └── style.css        # Responsive Styling
│
└── backend/             # Server-Side Application
    ├── Controllers/     # API Endpoints
    ├── Services/        # Business Logic
    ├── Data/            # DB Context & Repositories
    ├── Domain/          # Database Models
    ├── Program.cs       # App Configuration
    └── Dockerfile       # Container Config
```
