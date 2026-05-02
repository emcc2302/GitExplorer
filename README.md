# 🚀 GitExplorer – MERN GitHub Explorer App

GitExplorer is a full-stack MERN application that allows users to explore GitHub profiles and repositories, authenticate using GitHub OAuth, like other users' profiles, discover popular repositories by programming language, and chat in real-time with other users.
This project is built with production-grade authentication, API handling, real-time communication, and deployment using modern best practices.

---

## ✨ Features

* 🔐 **GitHub OAuth Authentication** (Passport.js)
* 👤 View any GitHub user’s profile and repositories
* ⭐ Like other users’ profiles (stored in MongoDB)
* ❤️ View profiles that liked you
* 🔍 Explore trending repositories by language
* ⚡ Authenticated GitHub API requests (avoids rate limits)
* 💬 Real-time chat system (Socket.io)
* 🌐 Fully deployed (Frontend + Backend)
* 🧠 Clean architecture with controllers, routes, and middleware

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* React Hot Toast

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Passport.js (GitHub OAuth)
* GitHub REST API

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 🌍 Live URLs

* **Frontend:**

  ```
   https://git-explorer-soriful-islam-sks-projects.vercel.app/
  ```

* **Backend API:**

  ```
  https://gitexplorer-backend-2xtf.onrender.com
  ```

---

## 🔐 Environment Variables

### Backend (`Render`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_API_KEY=your_github_personal_access_token
CLIENT_BASE_URL=https://git-explorer-dbamvbh4o-soriful-islam-sks-projects.vercel.app
SESSION_SECRET=any_long_random_secret
```

### Frontend (`Vercel`)

```env
VITE_API_BASE_URL=https://gitexplorer-backend-2xtf.onrender.com
```

---

## 🔑 GitHub Token Requirements

You need **two different GitHub credentials**:

1. **GitHub OAuth App**

   * Used for login
   * Provides `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

2. **GitHub Personal Access Token (Classic)**

   * Used to fetch GitHub API data
   * Scopes required:

     * `read:user`
     * `public_repo`

---

## 🧩 API Endpoints

### Authentication

```
GET /api/auth/github
GET /api/auth/github/callback
GET /api/auth/check
GET /api/auth/logout
```

### Users

```
GET  /api/users/profile/:username
POST /api/users/like/:username
GET  /api/users/likes
```

### Explore

```
GET /api/explore/repos/:language
```

---

## 🧪 Running Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/emcc2302/GitExplorer.git
cd GitExplorer
```

### 2️⃣ Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3️⃣ Add `.env` files (see above)

### 4️⃣ Start the app

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 📸 Screenshots
<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/bbb1d9df-292a-4e72-961e-425d27459cf3" />


---

## 📌 Learning Outcomes

* GitHub OAuth with Passport.js
* Secure session handling across domains
* Handling third-party APIs safely
* CORS & cookies in production
* Environment-based configuration
* Real-world deployment debugging

---

## 🧑‍💻 Author

**Soriful Islam Sk**
3rd Year CSE Student
Aliah University

---

## ⭐ Acknowledgements

* GitHub REST API
* Passport.js Documentation
* Render & Vercel Docs
