# FairShare — Shared Expenses App

FairShare is a production-ready full-stack shared expenses application built to handle messy real-world transaction spreadsheets, dynamic group memberships, multi-currency splits, and debt simplification.

## Local Setup

### Prerequisites
*   Python 3.11+
*   Node.js 18+
*   Git (optional)

---

### Backend Setup (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate virtual environment:**
    ```bash
    python -m venv .venv
    .venv\Scripts\activate  # Windows
    # source .venv/bin/activate  # macOS / Linux
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Create `.env` file:**
    Copy from `.env.example` or create a new `.env` with:
    ```env
    SECRET_KEY=your-secret-key-here
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=http://localhost:5173
    ```
5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```
6.  **Start the local Django server:**
    ```bash
    python manage.py runserver 8000
    ```
    The backend server will run at: **http://127.0.0.1:8000**

---

### Frontend Setup (Vite + React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install npm packages:**
    ```bash
    npm install
    ```
3.  **Start the local Vite development server:**
    ```bash
    npm run dev
    ```
    The frontend client will run at: **http://localhost:5173** (API requests to `/api` are automatically proxied to the backend at port 8000).

---

## Tech Stack
*   **Frontend**: React 18 + Vite + Lucide Icons + React Hot Toast
*   **Backend**: Django 4.2 + Django REST Framework + SimpleJWT (Token Auth)
*   **Database**: SQLite (local dev) / PostgreSQL (production setup ready via dj-database-url)

## AI Development Collaborator
This application was co-developed using the **Antigravity IDE** powered by Google DeepMind's agentic AI coding models. All models, logic, schemas, and UI elements were designed collaboratively and vetted line-by-line.
