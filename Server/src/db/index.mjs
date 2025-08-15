import pkg from 'pg';
export const pool = new pkg.Pool({
  user: 'dev',
  host: 'localhost',
  database: 'appdb',
  password: 'magicthegathering',
  port: 5432,
});
