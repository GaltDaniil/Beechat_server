import pg from 'pg';

const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DB_NAME } = process.env;

const pool = new pg.Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DB_NAME,
    password: PG_PASSWORD,
    //@ts-ignore
    port: PG_PORT,
});
const client = await pool.connect();

export default client;
