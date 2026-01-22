import { config } from "dotenv";
import { Pool } from "pg";
config()

const pool = new Pool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
})

async function db_connect() {
    try {
        await pool.connect()
        console.log("✅ Database connected!")
    } catch (error) {
        console.log(error)
    }
}

db_connect()

export default pool