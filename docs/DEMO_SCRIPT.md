# Demo script (video + live presentation)

Both apps must already be running (`php artisan serve` and `npm run dev`) before you start.

## 1. Opening (2 min)
Introduce yourself as the developer. State the client's problem (paper logbook, no visibility,
late overdue discovery) and the goals of the system.

## 2. Solution overview (3 min)
Roles (admin vs member), the 9 delivered features, and the ERD / three-part architecture
explained without jargon: "React is the website, Laravel is the rule-keeper, MySQL is the filing cabinet."

## 3. Live walkthrough (8–10 min)
Scenario: *a student requests a book, the librarian approves it, the student sees the update.*

1. **Register** a new member – show client-side errors (empty fields, short password) and a server 422 (duplicate email).
2. **Login as member** (`member@library.test`): dashboard figures; Books page → search "clean", filter by category, tick *Available only*, change page.
3. **Request** a book → confirm dialog → success toast. Open *My Borrowings* → status **Pending**; cancel one to show the confirm step.
4. Try opening `/authors` as member → redirected (React). *(Optional: show 403 in Postman.)*
5. **Logout, login as admin** (`admin@library.test`): dashboard with charts, 6 figures, latest pending requests.
6. **Borrowings** → find the member's request → **Approve** (confirm) → book copies drop by 1. Filter *Overdue only*. Mark one **returned**.
7. **Books** (admin): add a book with a cover image (show validation messages first), edit it, delete it (confirm).
8. **Authors / Categories**: add, edit, search, show that deleting one that still has books is refused.
9. Resize the browser to phone width: menu, cards, stacked tables.

## 4. Handover (2–3 min)
GitHub repo, README setup steps, demo accounts, Postman collection in `/docs`, security:
Sanctum tokens, `role:admin` middleware, policy, Form Requests.

## 5. Closing (2 min)
Delivered vs. Day 2 proposal, known limitations, Phase 2 (email reminders, fines, reservations, deployment).
