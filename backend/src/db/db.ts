import postgres from 'postgres'

export const sql = postgres({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
})

async function test() {
    try {
        const result = await sql`SELECT version()`
        console.log("Connected! Postgres version:", result[0].version)
    } catch (err) {
        console.error("Failed to connect:", err)
    }
}

test()