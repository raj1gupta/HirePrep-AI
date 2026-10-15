# HirePrep-AI 🚀

An AI-powered interview preparation platform designed to help candidates prepare, practice, and evaluate their interview readiness with real-time feedback, report generation, and personalized recommendations.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Google Gemini AI (`@google/genai`), Puppeteer, JWT, Multer, Zod
- **Frontend**: React, Vite, Sass, Axios, React Router

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # DB and app configs
│   │   ├── controllers/     # Auth and interview handlers
│   │   ├── middlewares/     # Auth & upload middlewares
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express route definitions
│   │   └── services/        # AI & business logic
│   ├── .env.example         # Example environment variables
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) cluster or local instance
- [Google AI Studio API Key](https://aistudio.google.com/) for Gemini

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Populate your `.env` variables:
   ```env
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   PORT=3000
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

---

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔒 Security & Credentials

All sensitive credentials and environment files (`.env`, `*.key`, etc.) and heavy dependencies (`node_modules/`, `dist/`) are safely excluded via `.gitignore` to prevent secret leaks.
