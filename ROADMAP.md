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

### v0.2.0 — Start Game & Game Screen Transition
- Owner clicks Start Game → server creates in-memory game state
- Lobby status changes to "started" (prevents new joins)
- All clients in the room navigate to the game view
- Game state shape designed for future metrics/history persistence
- Consistent `playerId` field internally (eases future identity refactor)
- `getPublicState()` omits sensitive data (other players' sentences)
- `GameStore` in-memory Map keyed by shortCode
- `GameConfig` with defaults and partial override support

### v0.2.1 — Word Distribution & Round Start
- Hardcoded word lists organized by category (nouns, verbs, adjectives, modifiers, function words)
- Server selects random subset per round, sends identical words to all players
- Random prompt selected (with deduplication across rounds)
- Client renders categorized word pools and prompt display
- Player names injected into word pool as usable words
- `shuffleAndPick` utility for random selection

### v0.2.2 — Sentence Building
- Drag words from pools into sentence drop zone (svelte-dnd-action)
- Word.svelte with GSAP hover animations, WordPool.svelte and SentenceBuilder.svelte components
- GSAP pop animation on word drop into sentence
- Sentence preview text renders below drop zone
- Max word limit with visual feedback (orange border at limit)
- Submit button and server-authoritative timer with 1-second broadcast ticks
- Server validates submitted words exist in the distributed pool (cheat prevention)
- Auto-submit empty sentence on timer expiry
- Early completion: timer skipped when all players submit
- Submission count broadcast (X/Y players submitted)
- `navigatingToGame` flag to prevent leave-lobby emit during game start navigation
- GameController extracted from server.ts (startGame, submitSentence)

### v0.2.3 — Voting Phase
- `buildAnonymousSentences()` generates sentenceId → playerId (server) and sentenceId → text (client)
- Anonymous sentence list broadcast via VOTING_SENTENCES event
- VotingCard.svelte with `mode` prop ("voting" | "results") for dual-use
- Vote selection with visual highlight (ring indicator on selected card)
- Done button to confirm vote (disabled until selection made)
- Server-side vote validation: phase check, duplicate check, self-vote prevention
- `registerVote()` on GameState, `castVote()` on GameController
- Vote timer with server-authoritative countdown
- `endVotingPhase`: tally votes, award points to sentence authors, reveal results
- Results screen: sentences ranked by votes, authors revealed, vote counts displayed
- Cumulative scoreboard on results screen

### Backlog — UX Polish (unscheduled, pre-v1.0)
- Error modals instead of inline redirect for join failures (lobby full, wrong password)
- Client-side username validation on Landing page input (inline feedback on invalid chars/length)
- Surface `app-error` events on CreateLobbyForm page
- Lobby browser: show error when navigating to a deleted/nonexistent lobby
- Lobby list sorting (default by newest, options: player count, time active)
- Real-time global player count (io.emit on connect/disconnect)
- Word pool cross-dragging restriction (pools should only accept returns from sentence)
- GSAP pop animation only on word addition (not removal) in SentenceBuilder
- Configurable word counts per category (nounCount, verbCount, adjectiveCount in GameConfig)

## Planned Sprints — Core Gameplay

### v0.2.4 — Results Screen & Round Transition
- Results timer: auto-advance to next round after N seconds
- Hide building/voting timer during results phase
- Show only round scores on results screen, not cumulative totals
- Server starts next round: new words, new prompt, phase resets to BUILDING
- Client resets all round state between rounds (word pools, sentence, voting state)
- Smooth transition between results → next round building phase

### v0.2.5 — Game Loop & End Game
- Full N-round loop working end-to-end
- Early exit on all-voted during voting phase (skip timer)
- Final results screen after last round (cumulative scores, winner highlight)
- Return to lobby option
- Game cleanup: reset lobby status to "waiting", remove game from GameStore
- Lobby browser updates when game ends

### v0.2.6 — Polish & Configurability
- Ranked choice voting option (3 weighted votes)
- Score weighting for different vote ranks
- Sound effects via Howler.js (vote click, results reveal, round transition, winner)
- GSAP animations on vote selection, score reveals, winner announcement
- Canvas confetti on game win
- Configurable timers (building, voting, results)
- Configurable round count and max words per sentence
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

### Dark Mode & Theming
- Dark mode toggle (localStorage preference)
- CSS custom properties for theme colors
- Consistent theming across all pages (lobby, game, results)
- Respect OS-level prefers-color-scheme

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