# Collab Board

**A real-time collaborative Kanban workspace inspired by Trello. Multiple users work on the same board, manage tasks, discuss in comments, and see every change instantly, with no refresh.**

### [Live Demo](https://collab-board-ebon-five.vercel.app/) · [Video Walkthrough](#-demo) · [Architecture](#-architecture) · [Engineering Decisions](#-engineering-decisions)

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![RTK Query](https://img.shields.io/badge/RTK_Query-764ABC?logo=redux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

<!-- 👉 HERO GIF: two browser windows side by side. Move a card in one, watch it appear in the other. -->


https://github.com/user-attachments/assets/6f7c1ccc-5a18-4f5a-ac01-93a26a56abe6


</div>

---

## Try It in 30 Seconds

**Live app:** https://collab-board-ebon-five.vercel.app/

> The backend runs on a free tier, so the first request may take ~30 seconds to wake up.

| Account | Email | Password |
| --- | --- | --- |
| Demo user 1 | `demo1@example.com` | `your-password` |
| Demo user 2 | `demo2@example.com` | `your-password` |

**See real-time sync:** open the app in two different browsers (or one normal and one incognito window), sign in as each demo user, open the same board, and move a card.

<!-- Replace the demo credentials above with real ones, or delete this table and say "register a new account". -->

---

## Why This Project

The interesting part wasn't CRUD. Real-time collaboration forced me to solve:

- **Authorization**: a valid JWT doesn't mean access to every board
- **Resource ownership**: a valid board ID must not be combinable with a list or card from another board
- **Real-time synchronization**: updates go only to people on the same board
- **Concurrency**: stale updates are detected instead of silently overwriting newer data
- **Consistency**: multi-document operations are atomic and the database stays the source of truth

---

## Features

| Area | Details |
| --- | --- |
| **Boards, lists, cards** | Create boards, organize work in lists, and manage cards with title, description, due date, labels and assignees |
| **Drag & drop** | Reorder within a list or move across lists, using fractional ordering so one drag updates one document |
| **Live collaboration** | Card create / update / move / delete appear instantly for everyone on the board (Socket.io board rooms) |
| **Role-based access** | `owner > editor > viewer`, enforced server-side on every REST route and socket event |
| **Invitations** | In-app invite flow with `pending → accepted / declined / expired / revoked` states |
| **Comments** | Comment thread on each card |
| **Activity log** | Board-level history of meaningful events (task moved, role changed, comment added, …) |
| **Conflict detection** | Optimistic concurrency via a `version` field; stale writes return `409 Conflict` |
| **Reconnection handling** | Rejoins the board room and refetches the latest state after a dropped connection |
| **Live role changes** | Role updates and member removal take effect for connected users |

---

## Demo

<!-- Short clips (10–20s each). Keep GIFs under ~5 MB, or link a video. -->

### Real-time sync

https://github.com/user-attachments/assets/6f7c1ccc-5a18-4f5a-ac01-93a26a56abe6

<!-- <img src="docs/media/realtime-sync.gif" alt="Card moved in one browser appears instantly in another" width="800" /> -->

### Permissions: a Viewer can't mutate

https://github.com/user-attachments/assets/e8af2a51-056e-42e9-8c54-52b643b0832e


<!-- <img src="docs/media/viewer-forbidden.gif" alt="Viewer blocked with 403 when trying to edit" width="800" /> -->

### Concurrency: stale update → 409


https://github.com/user-attachments/assets/9883ab77-0c66-47d6-8856-757b9c6ca7f5


### Screenshots

| Dashboard | Board |
| --- | --- |
| <img width="1710" height="987" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/14000cdd-e1df-4251-8ae7-6367996f877f" /> | <img width="1710" height="987" alt="Board Preview" src="https://github.com/user-attachments/assets/a14cff5e-1985-4217-8fd9-2bd5ab56a41c" /> |

| Card details & comments | Members & invitations |
| --- | --- |
| <img width="1710" height="987" alt="Card Preview with comments" src="https://github.com/user-attachments/assets/2a82fc71-a902-4652-979b-0da8376f4a0b" /> | <img width="1710" height="987" alt="image" src="https://github.com/user-attachments/assets/beaf939b-d4d5-45ae-b2b2-8b5d653691aa" /> |

**Full walkthrough (2–3 min):** [Watch on YouTube / Loom](#)

---

## Architecture

```
React
  ↓
RTK Query
  ↓
REST API + Socket.io
  ↓
Node.js / Express
  ↓
Middleware
  ├── Authentication (JWT)
  ├── Authorization / RBAC (requireRole)
  └── Resource ownership validation
  ↓
Services
  ↓
MongoDB
```

| Layer | Responsibility |
| --- | --- |
| **REST** | Auth, initial board load, CRUD. The source of truth for request/response operations |
| **Socket.io** | Live synchronization, pushing state changes to connected collaborators |
| **RTK Query** | Client cache: tag invalidation for REST mutations, `updateQueryData` for socket events, refetch on reconnect |

### Real-time flow

```
Client event → Authenticate → Authorize → Validate
        ↓
  Database update
        ↓
  Read canonical server state
        ↓
  Broadcast to board room
```

The server never broadcasts the client's optimistic result. It validates, persists, then broadcasts canonical state.

### Data model

```
User ─< BoardMember >─ Board
                         ├─< List ─< Card ─< Comment
                         ├─< Invite
                         └─< ActivityLog
```

| Collection | Notes |
| --- | --- |
| `User` | `name`, `email` (unique), `passwordHash` (bcrypt), `avatarUrl` |
| `Board` | `title`, `description`, `ownerId` |
| `BoardMember` | `boardId`, `userId`, `role`, `invitedBy`, `joinedAt`. Unique index on `(boardId, userId)` |
| `List` | `boardId`, `title`, `order` |
| `Card` | `boardId`, `listId`, `title`, `description`, `dueDate`, `labels`, `assigneeIds`, `order`, `createdBy`, **`version`** |
| `Comment` | `cardId`, `authorId`, `body`, `editedAt` |
| `ActivityLog` | `boardId`, `actorId`, `type`, `targetId`, `metadata` |
| `Invite` | `boardId`, `inviteeId`, `role`, `status`. Partial unique index on `(boardId, inviteeId)` where `status = 'pending'` |

**Why a separate `BoardMember` collection?** A user can have a different role on each board (owner on Board A, viewer on Board B). A join collection models that cleanly, makes "all boards I'm on" a single indexed query, and avoids unbounded arrays on `Board`.

---

## Engineering Decisions

### 1. Authentication ≠ Authorization
JWT middleware proves *who* you are. A reusable `requireRole('editor')` middleware proves *what you can do on this board*. Hiding buttons in the UI is UX; the server is the security boundary. A Viewer sending a manual `PATCH` from DevTools gets `403 Forbidden`.

### 2. Parent-child ownership validation
Membership alone isn't enough. Each nested request verifies the hierarchy:

```js
const list = await List.findOne({ _id: listId, boardId });
const card = await Card.findOne({ _id: cardId, listId });
```

This blocks cross-board ID attacks (Board A + List B + Card B).

### 3. Optimistic concurrency control
The client sends the `version` it last saw. The server applies the update only if that version is still current, and increments it:

```js
Card.findOneAndUpdate(
  { _id: cardId, version: clientVersion },
  { $set: fields, $inc: { version: 1 } },
  { new: true }
);
```

If another write landed first, no document matches and the server returns **`409 Conflict`** instead of overwriting newer data.

### 4. Socket security
- User identity comes from the **verified JWT in the socket handshake**, never from a client-sent `userId`
- `joinBoard` checks `BoardMember` **before** `socket.join(boardId)`
- Every socket mutation re-checks the user's **current** role

### 5. Fractional ordering
`order = (prevOrder + nextOrder) / 2`, so a drag updates **one** card instead of reindexing every card below it. Because repeated inserts shrink the gap, a normalization pass is the planned maintenance strategy.

### 6. Transactions for multi-step changes
Invitation acceptance (create `BoardMember` + mark `Invite` accepted) and cascading board deletion run in MongoDB transactions. Socket events like `board:deleted` are emitted **only after the commit**, so clients never react to something that later rolled back.

### 7. Invite history vs. current membership
`Invite` stores history and `BoardMember` stores current membership. A **partial unique index** allows only one *pending* invite per board/user pair while still allowing multiple historical ones.

### 8. Reconnection
Events can be missed while offline. On reconnect the client rejoins the room and refetches the board, so server state wins over stale local state.

### 9. `version` vs. activity log
`version` protects **data consistency**; the activity log is **human-readable history**. A same-list reorder bumps `version` but doesn't write an activity entry, which keeps the feed from flooding.

### Deliberate scope decisions
- **Task-level collaboration, not character-level.** No CRDT/OT; conflicts are handled with version checks.
- **In-app invitations** for existing users instead of email-token invites.
- **Single-server** Socket.io (see [Scaling](#-scaling-notes)).

---

## Security

- Passwords hashed with **bcrypt**
- JWT authentication middleware on protected routes
- Server-side RBAC on **every REST route and socket event**
- Resource-hierarchy validation against cross-board access
- Socket room authorization before join
- Centralized error handling (`403`, `404`, `409`, `500`)
- Input validation, and user content treated as untrusted (XSS)

---

## API Overview

| Group | Examples |
| --- | --- |
| **Auth** | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` |
| **Boards** | `GET/POST /api/boards` · `GET/PATCH/DELETE /api/boards/:boardId` |
| **Members** | `GET /api/boards/:boardId/members` · `PATCH/DELETE …/members/:userId` |
| **Invites** | create · list · accept · decline |
| **Lists & cards** | CRUD, plus move (`listId`, `order`, `version`) |
| **Comments** | `GET/POST` per card |
| **Activity** | `GET /api/boards/:boardId/activity` |

**Socket events:** `task:created` · `task:updated` · `task:moved` · `task:deleted` · `column:updated` · `comment:created` · `member:role_changed` · `member:removed` · `board:deleted` · `activity:new`

<!-- ✏️ Adjust route paths and event names to match your code exactly. -->

---

## Run Locally

### Prerequisites
- Node.js 18+
- A MongoDB **replica set** (required for transactions). A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works out of the box.

### Setup

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Backend
cd server && npm install && cp .env.example .env

# Frontend
cd ../client && npm install && cp .env.example .env
```

**`server/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=change-me
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Start

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`.

<!-- ✏️ Update variable names, ports and scripts to match your project (e.g. CRA uses REACT_APP_ instead of VITE_). -->

---

## Project Structure

```
.
├── client/                  # React app
│   └── src/
│       ├── app/             # store + RTK Query API
│       ├── features/        # boards, cards, auth, invites
│       ├── components/
│       └── socket/          # socket client + handlers
├── server/
│   └── src/
│       ├── middleware/      # auth, requireRole, ownership, errors
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── sockets/
└── docs/media/              # README screenshots and GIFs
```

<!-- ✏️ Replace with your real folder tree. -->

---

## Scaling Notes

The current implementation is **single-server**: Socket.io room state lives in process memory. To run multiple instances I would add a shared adapter such as **Redis pub/sub** so events propagate across servers.

---

## Roadmap

- [ ] Rate limiting on login and invitation endpoints
- [ ] Fractional-order normalization job
- [ ] Presence indicators and "user is typing"
- [ ] Reusable board-level labels
- [ ] Redis adapter for horizontal scaling
- [ ] Email-based invitations
- [ ] Automated tests for RBAC, concurrency and invite flows

<!-- ✏️ Remove anything you've already built or don't plan to build. -->

---

## Key Takeaway

> Real-time collaboration isn't just sending WebSocket events. It required solving authorization, resource ownership, stale state, concurrency, reconnects and data consistency, so that **the server stays the source of truth**.

---

## Author

**Rajiv Kumar** · [LinkedIn](#) · [Portfolio](#) · [GitHub](#)

<div align="center">

⭐ If you found this project interesting, consider giving it a star.

</div>
