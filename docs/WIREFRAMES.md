# Wireframes (key pages)

## Login
```
+--------------------------------------+
|        📚 Library Login              |
|  Email    [______________________]   |
|  Password [______________________]   |
|  [            Login              ]   |
|  No account yet? Register            |
|  Demo accounts: Use admin | Use member|
+--------------------------------------+
```

## Dashboard (admin)
```
+--------------------------------------------------------------+
| 📚 Library  Dashboard Books Borrowings Authors Categories  Elena [Logout] |
+--------------------------------------------------------------+
| Welcome, Elena 👋                                            |
| [📚 25 titles][👥 8 members][⏳ 5 pending][📖 8 active][⚠️ 4 overdue][✅ 9 returned] |
| +---- Borrowings by status ----+ +-- Top categories ------+ |
| |  bar chart                   | |  horizontal bar chart  | |
| +------------------------------+ +------------------------+ |
| Latest pending requests ........................ View all → |
|  Book title  - Member • requested date          [Pending]    |
+--------------------------------------------------------------+
```

## Books (catalog)
```
Books                                              [+ Add book] (admin)
[ Search title, author or ISBN… ] [All categories ▼] [ ] Available only
+---------+ +---------+ +---------+ +---------+
| cover   | | cover   | | cover   | | cover   |
| Title   | | Title   | | Title   | | Title   |
| Author  | | Author  | | Author  | | Author  |
| 2 of 3  | | 1 of 2  | | On loan | | 3 of 3  |
|[Request]| |[Request]| |[Unavail]| |[Request]|   (admin: [Edit][Delete])
+---------+ +---------+ +---------+ +---------+
        ← Previous    Page 1 of 4    Next →
```

## Borrowings
```
Borrowings
[ Search book or member… ] [All statuses ▼] [ ] Overdue only
| Book | Member | Requested | Due | Returned | Status | Note | Actions |
| ...  | ...    | ...       | ... | ...      |[Pending]|     |[Approve][Reject] |
| ...  | ...    | ...       | ... | ...      |[Overdue]|     |[Mark returned]   |
        ← Previous    Page 1 of 3    Next →
```

## Add / Edit book (modal)
```
+---------------- Add book ------------------ ✕ +
| Title *        [___________]  ISBN * [_______] |
| Author *       [Select ▼  ]  Category * [Select ▼] |
| Publisher      [___________]  Year   [_______] |
| Total copies * [___]   Cover image [Choose file] |
| Description    [______________________________] |
|                         [Cancel] [Add book]     |
+------------------------------------------------+
```

## Mobile
The navigation collapses into a ☰ menu, book cards stack in one column, and tables become
stacked cards (label on the left, value on the right).
