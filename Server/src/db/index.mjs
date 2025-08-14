import pkg from 'pg';
export const pool = new pkg.Pool({
  user: 'dev',
  host: 'localhost',     // or docker service name
  database: 'appdb',
  password: 'magicthegathering',
  port: 5432,
});
