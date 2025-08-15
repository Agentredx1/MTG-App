import { Pool } from 'pg';

export const pool = new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'appdb',
    password: 'magicthegathering',
    port: 5432,
});