# CollabBoard

A real-time collaborative task board — think a lightweight Trello/Notion — built to explore concurrent multi-user state, role-based access control, and WebSocket synchronization.

> 🚧 **Status: in progress.** This README documents the target architecture and tracks what's built vs. planned. See [Progress](#progress) below.

---

## Why this project

Most CRUD portfolio projects stop at "logged-in users can create/edit/delete their own data." This one goes further by tackling three things that are genuinely hard to get right:

- **Real-time sync** — when one user moves a card, every other connected user sees it instantly, no refresh, powered by Socket.io.
- **Role-based permissions on shared resources** — Owner / Editor / Viewer roles on a board, enforced on both REST routes and socket events, not just hidden in the UI.
- **Concurrency edge cases** — what happens when two users move the same card at the same time, or a card is deleted while someone else is mid-drag on it.

---

## Features

- **Boards, columns, tasks** — create boards, organize columns (To Do / In Progress / Done, or custom), and cards with title, description, due date, and labels.
- **Drag-and-drop** — reorder tasks within and across columns using fractional ordering (no full re-indexing on every move).
- **Live collaboration** — task moves, edits, and creations broadcast instantly to every connected user on the same board via Socket.io.
- **Roles & permissions** — board owners can invite members as Editors (can modify) or Viewers (read-only); enforced server-side on every route and socket event.
- **Activity log** — a running feed of who did what on a board ("Alex moved 'Fix login bug' to Done — 2 min ago").
- **Comments** — per-task discussion threads.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) |
| State / data fetching | Redux Toolkit + RTK Query |
| Drag-and-drop | dnd-kit |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | MongoDB (Mongoose) |
| Auth | JWT via httpOnly cookies |
| Validation | Zod |

**Note on JavaScript vs. TypeScript:** this project is written in plain JavaScript by design. The priority was shipping a fully working real-time system end to end rather than adding a second learning curve on top of Redux Toolkit, Socket.io, and concurrent state handling at the same time. A TypeScript pass on the backend models and socket payloads is a planned follow-up (see [Roadmap](#roadmap)).

---

## Architecture

### Data model

```
User
 ├─< BoardMember >─ Board
 │                    ├─< Column ─< Task ─< Comment
 │                    ├─< Invite
 │                    └─< ActivityLog
```

`BoardMember` is the join collection that makes the User↔Board relationship many-to-many *with a role attached* (`owner` / `editor` / `viewer`), rather than a single hardcoded "owner" field. Both `Board` and `BoardMember` are created together inside a MongoDB transaction when a board is created, so a board can never exist without a valid owner record.

Task ordering uses **fractional positioning** (new order = midpoint between neighbors) instead of integer indices, so a single drag-drop move never requires re-writing every other card in the column.

### Permission enforcement

Role checks run through a single reusable Express middleware (`requireRole('editor')`) applied to every board-scoped route, and the same role check is re-run server-side on every incoming Socket.io event — the server never trusts a client's optimistic action, it re-derives and re-validates before broadcasting.

### Real-time flow

1. Client authenticates via REST (httpOnly cookie), then opens a Socket.io connection.
2. Client emits `join_board` for a given board ID; the server verifies board membership before adding the socket to that board's room.
3. Actions (`task:move`, `task:update`, `comment:add`, etc.) are validated and persisted server-side, then the canonical result is broadcast to every other socket in the room.
4. On reconnect, the client re-syncs from the server rather than trusting local optimistic state.

---

## Local setup

```bash
git clone https://github.com/<your-username>/collabboard.git
cd collabboard

# backend
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET
npm run dev

# frontend
cd ../client
npm install
npm run dev
```

### Environment variables (`server/.env`)

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

> MongoDB transactions require a replica set. A free MongoDB Atlas cluster satisfies this by default; a plain local standalone `mongod` will not.

---

## Progress

- [x] Auth (register, login, logout, session persistence via httpOnly cookie + JWT)
- [x] Redux Toolkit + RTK Query wired up for auth state
- [x] Board + BoardMember models, created together in a transaction
- [ ] Board CRUD routes + role middleware — *in progress: create/read + role middleware (viewer/owner tested) done; update/delete pending*
- [x] Dashboard page (list/create boards)
- [ ] Columns + Tasks CRUD — *in progress: create/read for Lists + Cards done (nested routes, mergeParams verified); update/delete pending*
- [ ] Drag-and-drop UI (REST-only, no sockets yet)
- [ ] Socket.io real-time layer
- [ ] Invites + role management UI
- [ ] Comments
- [ ] Activity log

---

## Roadmap / stretch goals

- Live cursors and "user is typing…" indicators
- TypeScript conversion of backend models and socket event payloads
- Redis adapter for Socket.io to support horizontal scaling across multiple server instances

---

## What this project demonstrates

- Designing a proper many-to-many schema with role metadata, rather than a simplistic owner field
- Using MongoDB transactions to guarantee related documents are never created in a partial/inconsistent state
- Enforcing authorization consistently across two different transport layers (REST and WebSocket), instead of only gating the UI
- Reasoning through concurrency edge cases (simultaneous edits, stale sockets, out-of-order events) before they become production bugs
