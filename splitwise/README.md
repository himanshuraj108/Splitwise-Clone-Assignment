# SplitWise Clone

A full-stack expense splitting application built as an internship assignment for Spreetail.

**Live Demo:** _[Deploy URL — to be updated after deployment]_

**GitHub:** himanshuraj108/advanced-payment-fruad-detection-tool _(rename repo to splitwise-clone)_

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Django 4.2 + Django REST Framework |
| Database | SQLite (local) / Supabase PostgreSQL (production) |
| Auth | JWT (djangorestframework-simplejwt) |
| Real-time Chat | Polling (3s interval) / Supabase Realtime (production) |
| Deployment | Render.com (backend) + Vercel (frontend) |

**AI Tool Used:** Antigravity (Google DeepMind) — Claude Sonnet 4.6 (Thinking)

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env
# Edit .env with your values (SQLite works locally without any changes)

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver 8000
```

Backend runs at: **http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env
# VITE_API_URL=/api (uses Vite proxy, no change needed for local)

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
SPLITWISE/
├── backend/
│   ├── config/             # Django settings, URLs, WSGI
│   ├── apps/
│   │   ├── users/          # Auth, profile, friendships
│   │   ├── groups/         # Group CRUD + member management
│   │   ├── expenses/       # Expense CRUD + split calculator
│   │   ├── payments/       # Debt settlements
│   │   ├── balances/       # Balance computation + debt simplification
│   │   └── chat/           # Expense-level messaging
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route pages (Dashboard, Friends, Groups, etc.)
│   │   ├── components/     # Reusable components (modals, layout)
│   │   ├── contexts/       # Auth context (React Context API)
│   │   ├── api.js          # Centralized API client (Axios)
│   │   ├── App.jsx         # Router + protected routes
│   │   └── index.css       # Full design system
│   └── vite.config.js
├── README.md
├── BUILD_PLAN.md
└── AI_CONTEXT.md
```

---

## 🗄️ Database Schema

```sql
users            -- Custom auth user with UUID PK, avatar_color
friendships      -- Bidirectional friend connections
groups           -- Expense groups (trip/home/couple/other)
group_members    -- Many-to-many with role (admin/member)
expenses         -- Expenses with split_type (equal/unequal/percentage/shares)
expense_splits   -- Per-user amount owed for each expense
payments         -- Debt settlements between users
messages         -- Chat messages per expense
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| GET | `/api/auth/me/` | Get current user |
| GET | `/api/friends/` | List friends + balances |
| POST | `/api/friends/add/` | Add friend by email |
| GET | `/api/groups/` | List groups |
| POST | `/api/groups/` | Create group |
| POST | `/api/groups/{id}/invite/` | Invite member |
| GET | `/api/expenses/` | List expenses (filter by group/friend) |
| POST | `/api/expenses/` | Create expense with splits |
| GET | `/api/balances/user/` | Overall balance summary |
| GET | `/api/balances/group/{id}/` | Group balance + simplified debts |
| POST | `/api/payments/` | Record settlement |
| GET | `/api/chat/{expense_id}/messages/` | Get messages |
| POST | `/api/chat/{expense_id}/messages/` | Post message |

---

## 🔑 Environment Variables

### Backend `.env`
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://...  # Leave empty for SQLite
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚢 Deployment

### Backend → Render.com
1. Push to GitHub
2. New Web Service → connect repo → set `Root Directory: backend`
3. Build: `pip install -r requirements.txt && python manage.py migrate`
4. Start: `gunicorn config.wsgi:application`
5. Add env vars: `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `CORS_ALLOWED_ORIGINS`

### Frontend → Vercel
1. New project → connect repo → set `Root Directory: frontend`
2. Framework: Vite
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## ✅ Features

- ✅ Login / Register (JWT auth)
- ✅ Add friends by email
- ✅ Create groups (trip/home/couple/other)
- ✅ Invite & remove group members
- ✅ Add expenses with 4 split types:
  - Equal split
  - Unequal (exact amounts)
  - Percentage (must sum to 100%)
  - By shares
- ✅ Real-time chat on expenses (3s polling)
- ✅ Per-friend balance summary
- ✅ Per-group balance with **debt simplification**
- ✅ Record debt settlements (Settle Up)
- ✅ Dashboard with total balance, you owe, you're owed
- ✅ Profile page with avatar color picker
- ✅ Dark mode design system

---

## 🤖 AI Tool

**Tool:** Antigravity IDE (powered by Claude Sonnet 4.6 Thinking)

The AI was used as a junior engineer collaborator — it was directed to:
1. Ask detailed questions before building
2. Maintain `AI_CONTEXT.md` as the source of truth
3. Build systematically: schema → backend → frontend → docs

See `AI_CONTEXT.md` for the full collaboration log and `BUILD_PLAN.md` for the architecture decisions.

# Splitwise-Clone-Assignment
