# Sentencio Development Roadmap

## Completed

### v0.1.0 — Clean Foundation
- Deleted legacy JS controllers and dead code
- Fixed identity model (username-based, dropped FK constraints)
- Fixed lobby creation → join → redirect flow
- Environment variables for DB credentials

### v0.1.1 — Live Lobby
- Real-time user list via Socket.io room broadcasts
- Users see each other join and leave in real time
- `lobby-users-updated` event pattern established

### v0.1.2 — Ready Up & Lobby Lifecycle
- Ready toggle with atomic DB flip
- All-players-ready detection and broadcast
- Owner-only "Start Game" button (stubbed)
- Empty lobby auto-deletion with CASCADE cleanup
- Upsert on rejoin resets ready state
- Zod validation on toggle-ready

### v0.1.3 — Lobby Chat
- Ephemeral chat (no DB persistence)
- System messages on join/leave
- Server-generated timestamps
- Renamed `userId` → `username` across all layers
- Auto-scroll chat, Enter-to-send

### v0.1.4 — Guard the Gates (Input Validation & Error System)
- Server-side maxUsers enforcement on join
- Server-side password verification on join
- Shared Zod field schemas (Username, LobbyName) with regex sanitization
- Removed socket from controller signatures (transport layer separation)
- Controller returns typed `Promise<ILobbyUser>` on join
- Converted errorHandler and constants from JS to TypeScript
- Error enum (`ErrorTypes`) used consistently across all handlers
- Dedicated `app-error` socket event (no longer overloading reserved `error` event)
- Client-side error display with auto-clear and redirect on join failure
- Deleted dead `LIST_ALL_USERS` handler and all commented-out code from server.ts

### v0.1.5 — Live Lobby Browser
- Real-time lobby list updates via global broadcast on create/join/leave/delete
- Player count from JOIN query on lobby_users
- Password field sanitized to "protected" in lobby list responses
- LobbyCard shows Full/In Progress states with disabled join button
- Removed manual refresh button (unnecessary with real-time updates)
- Empty lobby list state messaging
- Cleaned dead code from LobbyCard and LobbyList

### Backlog — UX Polish (unscheduled, pre-v1.0)
- Error modals instead of inline redirect for join failures (lobby full, wrong password)
- Client-side username validation on Landing page input (inline feedback on invalid chars/length)
- Surface `app-error` events on CreateLobbyForm page
- Lobby browser: show error when navigating to a deleted/nonexistent lobby
- Lobby list sorting (default by newest, options: player count, time active)

## Planned Sprints — Lobby Hardening

### v0.1.6 — Session Identity
- Generate client-side session UUID (`crypto.randomUUID()`)
- Store in sessionStorage, persist across page navigations
- Change `lobby_users` PK from `(lobby_id, username)` to `(lobby_id, session_id)`
- Add `display_name` column for cosmetic names
- Update all services, controllers, socket events, and frontend
- Duplicate display names now allowed
- Enables future reconnection handling

### v0.1.7 — Owner Transfer & Disconnect Handling
- Transfer ownership when owner leaves but lobby isn't empty
- Broadcast ownership change so new owner gets Start Game button
- Map socket IDs to session IDs (in-memory or DB column)
- Handle `disconnect` event: identify which lobby the socket was in, remove user
- Grace period before removal (allow reconnection window)

### v0.1.8 — Lobby Polish & Real-Time Browser
- Broadcast lobby create/delete globally for live server browser
- Player count on LobbyCard in server browser
- Filter or visually mark full lobbies
- "Game in progress" status display
- Lobby expiry: auto-delete stale lobbies after 30min idle

### v0.1.9 — Ready System Polish
- 5-second auto-start countdown when all players ready
- Cancel countdown if anyone unreadies
- Owner can force-start regardless of ready states
- Minimum 2 players for auto-start (owner can still solo-start)
- Rate-limit ready toggle to prevent spam

### v0.1.10 — Pre-Game Config
- Owner configures: number of rounds, round duration, word categories
- Settings visible to all lobby players
- Settings passed to game creation flow
- Bridge between lobby system and game system

## Planned Sprints — Core Gameplay

### v0.2.0 — Start Game Flow
- Owner clicks Start Game → transition all players to game view
- Game record created (DB or in-memory)
- Lobby status changes to "in-progress"
- All clients navigate to game screen
- Connect existing WordContainer and RoundTimer components

### v0.2.1 — Word Distribution
- Word pool system: shared pool per round
- Word categories and parts-of-speech tagging
- Server distributes words to all players simultaneously
- Words rendered in draggable WordContainer

### v0.2.2 — Sentence Building
- Players drag words from pool into sentence container
- Real-time local state (no server sync during building)
- Submit sentence when satisfied or timer expires
- Server collects all submissions

### v0.2.3 — Voting Phase
- Display all submitted sentences anonymously
- Players vote on funniest (can't vote for own)
- Tally votes, award points
- Display round results with scores

### v0.2.4 — Game Loop & Scoring
- Multiple rounds with cumulative scoring
- Round transitions with score display
- End-of-game results screen
- Winner announcement with confetti

## Future Epics (Not Yet Planned)

### User Accounts
- Registration and login (email/password or OAuth)
- Persistent user profiles with match history
- Session identity upgrades to authenticated identity
- Friends list and invite system

### Word System
- User-submitted words with moderation pipeline
- Word categories, difficulty levels
- PG-13 vs adult word pools
- Parts-of-speech tagging with DB GIN indexes

### Infrastructure & Deployment
- Docker Compose for local dev (Postgres + backend + frontend)
- Self-hosting on spare machine with Ubuntu Server + Caddy
- Redis for scaling beyond single-server
- CI/CD pipeline
- Monitoring and error tracking

### Polish & Juice
- GSAP animations on word drag, score reveals
- Howler.js sound effects (drag, drop, submit, vote, win)
- Canvas confetti on round/game wins
- Mobile-responsive layout
- Accessibility pass

### Changelog Automation
- Conventional commit enforcement (commitlint)
- Auto-generated changelogs from commit prefixes
- GitHub releases tied to version tags
