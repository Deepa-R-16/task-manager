# Task Manager (MERN)

A task tracking web app with user login (JWT) and task filtering.

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

## Features
- Register / log in (passwords hashed with bcrypt, sessions via JWT)
- Each user sees only their own tasks
- Create, edit, delete tasks (title, notes, status, priority, due date)
- Filter by status and priority, search by title
- Overdue tasks highlighted

## Project structure
```
task-manager/
├── server/            Express API
│   ├── models/        User.js, Task.js
│   ├── middleware/    auth.js (JWT check)
│   ├── routes/        auth.js, tasks.js
│   ├── server.js
│   └── .env.example
├── client/            React app (Vite)
│   └── src/           App, Auth, Dashboard, api, styles
└── README.md
```

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- MongoDB running locally (https://www.mongodb.com/try/download/community) **or** a free MongoDB Atlas cluster

## How to run

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=any_long_random_string
```
(For Atlas, paste your connection string into `MONGO_URI`.)

Start it:
```bash
npm run dev
```
You should see `MongoDB connected` and `Server running on http://localhost:5000`.

### 2. Frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173**, create an account, and start adding tasks.
The Vite dev server proxies `/api` calls to the backend on port 5000.

## API reference
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in, returns token |
| GET | /api/tasks?status=&priority=&search= | List/filter your tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

Task routes require the header `Authorization: Bearer <token>`.

## Push to GitHub

1. Create an empty repository on https://github.com/new (e.g. `task-manager`). Do **not** add a README or .gitignore there.
2. In the project root:
```bash
cd task-manager
git init
git add .
git commit -m "Initial commit: MERN task manager"
git branch -M main
git remote add origin https://github.com/<your-username>/task-manager.git
git push -u origin main
```
3. `.gitignore` already excludes `node_modules` and `.env`, so your secrets are not uploaded. Share `.env.example` instead.

To push later changes:
```bash
git add .
git commit -m "Describe your change"
git push
```

## Troubleshooting
- **MongoDB connection failed:** make sure `mongod` is running, or check your Atlas connection string and IP allow-list.
- **Port in use:** change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.
- **Logged out unexpectedly:** the JWT expires after 7 days; log in again.
