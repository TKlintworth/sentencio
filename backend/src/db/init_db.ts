import postgres from 'postgres'

export const sql = postgres({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    debug: (query, args) => console.log(query, args)
})

async function initializeDatabaseTables(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS games (
        id VARCHAR(36) PRIMARY KEY,
        is_game_in_progress BOOLEAN DEFAULT false,
        current_round INTEGER DEFAULT 0,
        max_rounds INTEGER NOT NULL,
        round_length INTEGER NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'offline'
    )`;

/*     await sql`CREATE TABLE IF NOT EXISTS lobbies (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        max_users INTEGER NOT NULL DEFAULT 10,
        status VARCHAR(50) DEFAULT 'waiting',
        game_id VARCHAR(36) REFERENCES games(id) ON DELETE SET NULL,
        password VARCHAR(255),
        owner_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE
    )`; */
    await sql`CREATE TABLE IF NOT EXISTS lobbies (
        id VARCHAR(36) PRIMARY KEY,
        short_code VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        max_users INTEGER NOT NULL DEFAULT 10,
        status VARCHAR(50) DEFAULT 'waiting',
        game_id VARCHAR(36) REFERENCES games(id) ON DELETE SET NULL,
        password VARCHAR(255),
        owner_id VARCHAR(255),
        users JSONB DEFAULT '[]'  -- add this line
    )`;

    await sql`CREATE TABLE IF NOT EXISTS lobby_users (
        lobby_id VARCHAR(36) REFERENCES lobbies(id) ON DELETE CASCADE,
        username VARCHAR(255) NOT NULL,
        short_code VARCHAR(36),
        PRIMARY KEY (lobby_id, username)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS lobby_messages (
        id VARCHAR(36) PRIMARY KEY,
        lobby_id VARCHAR(36) REFERENCES lobbies(id) ON DELETE CASCADE,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql`CREATE TABLE IF NOT EXISTS game_players (
        game_id VARCHAR(36) REFERENCES games(id) ON DELETE CASCADE,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (game_id, user_id)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS game_scores (
        game_id VARCHAR(36) REFERENCES games(id) ON DELETE CASCADE,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 0,
        PRIMARY KEY (game_id, user_id)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS game_sentences (
        game_id VARCHAR(36) REFERENCES games(id) ON DELETE CASCADE,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
        sentence TEXT NOT NULL,
        PRIMARY KEY (game_id, user_id)
    )`;
}

initializeDatabaseTables()
    .then(() => console.log("Database tables initialized!"))
    .catch(err => console.error("Failed to initialize database tables:", err))
    .finally(() => sql.end());