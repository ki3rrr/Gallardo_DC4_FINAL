# Git workflow and checkpoint checklist

## One-time setup
```bash
cd library-management-system
git init
git branch -M main
git add .
git commit -m "chore: project structure, proposal, ERD and wireframes (CP1)"
# create an empty repo on GitHub, add your instructor as collaborator, then:
git remote add origin https://github.com/<your-username>/library-management-system.git
git push -u origin main
```

## Rebuilding the project step by step (what each folder contains)
The exam says to commit at the end of every work session. Work through the project in this
order and commit after each step (20+ commits are expected):

| # | Commit message | Files |
|---|----------------|-------|
| 1 | `docs: proposal, ERD, wireframes` | `docs/` |
| 2 | `chore(api): laravel skeleton, composer.json, env` | `backend/composer.json`, `bootstrap/`, `config/`, `public/`, `artisan` |
| 3 | `feat(api): migrations for users, tokens, authors, categories, books, borrowings` | `backend/database/migrations` |
| 4 | `feat(api): eloquent models and relationships` | `backend/app/Models` |
| 5 | `feat(api): factories and realistic seeders` | `backend/database/factories`, `seeders` |
| 6 | `feat(api): sanctum auth (register/login/logout/user)` | `AuthController`, auth requests, `UserResource` |
| 7 | `feat(api): role middleware and CORS` | `RoleMiddleware`, `bootstrap/app.php`, `config/cors.php` |
| 8 | `feat(api): authors and categories CRUD` | controllers, requests, resources |
| 9 | `feat(api): books CRUD with search, filter, pagination, cover upload` | `BookController`, requests |
| 10 | `feat(api): borrowing requests and status workflow` | `BorrowingController`, `BorrowingPolicy` |
| 11 | `feat(api): dashboard endpoint` | `DashboardController` |
| 12 | `test(api): feature tests` | `backend/tests` |
| 13 | `docs: postman collection (CP2)` | `docs/Library_API.postman_collection.json` |
| 14 | `feat(web): vite react app, router, axios service` | `frontend/` config, `services/api.js` |
| 15 | `feat(web): auth context, protected and admin routes` | `context/`, `ProtectedRoute.jsx` |
| 16 | `feat(web): reusable components` | `components/` |
| 17 | `feat(web): login and register pages with validation` | `pages/Login.jsx`, `Register.jsx` |
| 18 | `feat(web): books page with search, filter, pagination` | `pages/Books.jsx` |
| 19 | `feat(web): book form with cover upload` | `BookFormModal.jsx` |
| 20 | `feat(web): borrowings page and status actions` | `pages/Borrowings.jsx` |
| 21 | `feat(web): authors and categories admin pages` | `ResourceManager.jsx` |
| 22 | `feat(web): dashboard with charts (CP3)` | `pages/Dashboard.jsx` |
| 23 | `style: responsive layout and polish` | `index.css` |
| 24 | `docs: README, screenshots, slides, demo video link (final)` | `README.md`, `docs/` |

Day-by-day: Days 1–2 → rows 1–2 · Days 3–6 → rows 3–13 · Days 7–11 → rows 14–22 · Days 12–13 → rows 23–24.

## Before every checkpoint
- [ ] `git status` is clean, work is pushed (`git push`)
- [ ] No `.env`, `vendor/` or `node_modules/` committed
- [ ] Fresh-clone test: clone into a new folder and follow the README only
