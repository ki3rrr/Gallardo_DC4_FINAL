# Project Proposal – Library Book Management System

**Student:** [Your Full Name]  
**Client:** [Your Library / School Name], a small school library with about 2,000 books and 300 students

## 1. Problem statement
The librarian records borrowed books in a paper logbook. Students cannot see which books are in
stock, requests are verbal and easily forgotten, overdue books are found only during manual
checks, and the librarian cannot quickly report how many books are on loan.

## 2. User roles
| Role | What they can do |
|------|------------------|
| Admin (librarian) | Manage books, authors, categories; approve/reject requests; mark returns; view the dashboard |
| Member (student/teacher) | Register, search the catalog, request books, track own requests and due dates |

## 3. Main entities (besides users)
1. **authors** – name, nationality, bio
2. **categories** – name, description
3. **books** – title, ISBN, author, category, copies, cover image
4. **borrowings** – user, book, status, due date, returned date, note

Relationships: author 1-N books · category 1-N books · user 1-N borrowings · book 1-N borrowings

## 4. Planned features (mapped to requirements)
| Requirement | Planned feature |
|-------------|-----------------|
| Authentication | Register / login / logout / current user with Sanctum tokens |
| Role-based access | Admin-only pages for authors, categories, book management, approvals |
| Full CRUD (2+ resources) | Books, authors, categories; borrowing requests |
| Search and filter | Books by keyword/category/availability; borrowings by status/keyword/overdue |
| Pagination | `paginate()` on every list |
| Dashboard | Titles, members, pending requests, active loans, overdue loans, returned this week |
| Validation | Form Requests + React form checks with messages under the fields |
| User feedback | Spinners, toasts, error boxes, confirm before delete/approve/reject |
| Status workflow | pending → approved → returned (or rejected), changed by the admin |
| Bonus | Cover upload, dashboard charts, Laravel Feature tests |
