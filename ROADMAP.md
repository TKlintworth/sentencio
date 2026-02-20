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
- Real-time global player count

## Current Sprint

### v0.2.0 — Start Game & Game Screen Transition
- Owner clicks Start Game → server creates in-memory game state
- Lobby status changes to "started" (prevents new joins)
- All clients in the room navigate to the game view
- Design game state shape to support future metrics/history persistence
- Use consistent `playerId` field internally (eases future identity refactor)
- Game screen shows placeholder layout with player list

## Planned Sprints — Core Gameplay

### v0.2.1 — Word Distribution & Round Start
- Hardcoded word lists organized by category (nouns, verbs, adjectives, modifiers, function words)
- Server selects random subset per round, sends identical words to all players
- Random prompt selected and sent to all players
- Client renders word pools by category and prompt display
- Player names injected into word pool as usable words

### v0.2.2 — Sentence Building
- Drag words from pools into sentence drop zone (svelte-dnd-action)
- Words removed from pool when used, returned if removed from sentence
- Sentence preview text renders below drop zone
- Max word limit on sentence area
- Submit button (early submit) and server-authoritative timer
- Server validates submitted words exist in the distributed pool (cheat prevention)
- Auto-submit on timer expiry (blank if nothing built)

### v0.2.3 — Voting Phase
- Server collects all submissions, broadcasts sentences anonymously
- Voting UI: sentence cards with vote buttons
- Single vote per player initially (ranked choice as future option)
- Cannot vote for own sentence (server-enforced)
- Server rejects duplicate votes
- Timer on voting phase

### v0.2.4 — Vote Tallying & Round Results
- Server tallies votes, reveals authors
- Results screen: sentences ranked by votes, authors revealed
- Cumulative scoreboard display
- Server advances to next round after results timer

### v0.2.5 — Game Loop & End Game
- Round counter and progression (N rounds, default 10)
- Cumulative scores persisting across rounds
- Game phase state machine: BUILDING → VOTING → RESULTS → repeat → FINAL_RESULTS
- Final results screen with winner highlight
- Return to lobby option after game ends
- Lobby status returns to "waiting" when game ends

### v0.2.6 — Polish & Configurability
- Ranked choice voting option (3 weighted votes)
- Configurable timers (building phase, voting phase)
- Configurable round count
- Configurable max words per sentence
- Prompt selection/customization by lobby owner
- Rematch voting system
- Configurable rule: words consumed on use vs reusable

## Planned Sprints — Lobby Hardening (deferred)

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

### v0.1.8 — Ready System Polish
- 5-second auto-start countdown when all players ready
- Cancel countdown if anyone unreadies
- Owner can force-start regardless of ready states
- Minimum 2 players for auto-start (owner can still solo-start)
- Rate-limit ready toggle to prevent spam

### v0.1.9 — Pre-Game Config
- Owner configures: number of rounds, round duration, word categories
- Settings visible to all lobby players
- Settings passed to game creation flow
- Bridge between lobby system and game system

## Future Epics (Not Yet Planned)

### User Accounts & Identity
- Registration and login (email/password or OAuth)
- Persistent user profiles with match history
- Session identity upgrades to authenticated identity
- Friends list and invite system

### XP, Leveling & Achievements
- Requires: User Accounts & Identity epic
- XP awarded for game actions (play, win, votes received, streaks)
- Level derived from cumulative XP with tunable curve
- Achievement table with unlock conditions checked against match history
- Achievement examples: First Win, Perfect Round, 100 Games Played
- Profile display: level, XP bar, achievement showcase
- In-memory game state already captures all data needed for achievement checks

### Match History & Metrics
- Game history table: id, lobby_name, played_at, rounds, players with scores
- Round history table: game_id, round_number, prompt, sentences with votes
- In-memory game state already structured for easy persistence
- Stats: games won, sentences played, most voted sentences
- Personal stats dashboard

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