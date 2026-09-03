# Game Backlog

A full-stack game backlog tracker for a web development final project. Users can browse a public game catalog, build a personal library, and submit new games for admin review.

## Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Express.js, Express Sessions, bcrypt password hashing
- **Database:** PostgreSQL (4 tables: `users`, `game`, `users_game`, `pending_game`)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/download/windows/) installed and running

---

## Quick start

You need **two terminals** running at the same time (backend + frontend).

### Step 1: Start the backend

```powershell
cd back-end
npm start
```

API runs at **http://localhost:3001**

### Step 2: Start the frontend

Open a **second terminal**:

```powershell
cd front-end
copy .env.local.example .env.local
npm install
npm run dev
```

App runs at **http://localhost:3000**

### Step 4: Create an admin account

New accounts are regular users by default. To review submitted games, promote your account to admin:

1. Register at **http://localhost:3000/register**
2. Run this in PowerShell (use your actual username):

```powershell
cd back-end
npm run make-admin -- your_username
```

Example:

```powershell
npm run make-admin -- damia
```

3. **Log out and log back in** at http://localhost:3000/login
4. Click **Admin** in the navbar, or go to **http://localhost:3000/admin**

> **Important:** `game_app_admin` in `.env` is the **database** login for the API, not your app login. Your app account must be promoted with `make-admin`.

#### Manual SQL option (if you prefer)

```sql
UPDATE users SET role = 'admin_user' WHERE username = 'your_username';
```

---

## Using the app

### Pages

| Page | URL | Who can access |
|------|-----|----------------|
| Home | `/` | Everyone |
| Game catalog | `/games` | Everyone |
| Game details | `/games/[id]` | Everyone |
| Register | `/register` | Everyone |
| Log in | `/login` | Everyone |
| My library | `/library` | Logged-in users |
| Submit game | `/submit` | Logged-in users |
| Admin moderation | `/admin` | Admin users only |

### Typical user flow

1. **Browse anonymously**: visit Home or Catalog without logging in
2. **Register / log in**: unlock library and submission features
3. **Add games**: click **Add to library** on the catalog or game detail page
4. **Manage library**: update status, playtime, and achievements on `/library`
5. **Submit a new game**: use `/submit` to send a game for admin review

### Admin flow

1. Log in as an admin user
2. Go to `/admin`
3. For each pending submission:
   - **Approve and publish**: fill in cover URL, description, and achievement count, then approve (adds it to the public catalog)
   - **Reject**: optionally add a rejection reason

---

## Environment variables

### `back-end/.env`

| Variable | Default | Purpose |
|----------|---------|---------|
| `PGPASSWORD` | *(required)* | Postgres superuser password for setup scripts |
| `PG_HOST` | `localhost` | Database host |
| `PG_PORT` | `5432` | Database port |
| `PG_ADMIN_USER` | `postgres` | Superuser for setup scripts |
| `PG_DATABASE` | `final` | Database name |
| `PG_APP_USER` | `game_app_admin` | API database user |
| `PG_APP_PASSWORD` | `password` | API database password |

The API connection settings in `back-end/index.js` must match `PG_APP_USER`, `PG_APP_PASSWORD`, and `PG_DATABASE`.

### `front-end/.env.local`

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Express API base URL |

---

## NPM scripts

### Backend (`back-end/`)

| Command | Description |
|---------|-------------|
| `npm start` | Start API with nodemon |

### Frontend (`front-end/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Run production build |

---

## API overview

Visit **http://localhost:3001** while the backend is running for a JSON list of all endpoints.

### Public endpoints
- `POST /register`: create account
- `POST /login`: log in, receive JWT token
- `GET /games`: list all approved games
- `GET /games/:game_id`: single game details

### Authenticated endpoints (Bearer token required)
- `GET /me`: current user profile
- `GET /me/games`: personal library
- `POST /me/games`: add game to library
- `PATCH /me/games/:user_game_id`: update library entry
- `DELETE /me/games/:user_game_id`: remove from library
- `POST /pending-games`: submit game for review

### Admin endpoints (admin role required)
- `GET /admin/pending-games`: list pending submissions
- `POST /admin/pending-games/:id/approve`: approve and publish
- `PATCH /admin/pending-games/:id/reject`: reject submission
- `POST /admin/games`: create game directly
- `PATCH /admin/games/:id`: update game
- `DELETE /admin/games/:id`: delete game

---

## Project structure

```
final/
├── README.md
├── back-end/
│   ├── .env.example        # Database config template
│   ├── index.js            # Express API
│   ├── schema.sql          # Tables + sample games
│   ├── make-admin.js       # Promote user to admin
│   └── package.json
└── front-end/
    ├── .env.local.example  # API URL template
    └── src/
        ├── app/            # Next.js pages
        ├── components/     # Shared UI components
        └── lib/            # API client
```
