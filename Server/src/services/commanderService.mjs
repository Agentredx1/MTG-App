import { pool } from '../db/pool.mjs';
import { getCardInfoByName } from './scryfallService.mjs';

export async function ensureCommandersExist(names) {
  const unique = [...new Set((names || []).map(n => (n || '').trim()).filter(Boolean))];
  if (unique.length === 0) return;

  const { rows } = await pool.query(
    `SELECT commander_name FROM commanders WHERE commander_name = ANY($1)`,
    [unique]
  );
  const existing = new Set(rows.map(r => r.commander_name));
  const missing = unique.filter(n => !existing.has(n));
  if (missing.length === 0) return;

  await Promise.all(missing.map(async (name) => {
    try {
      const card = await getCardInfoByName(name, { exact: false });
      const colors = (Array.isArray(card.color_identity) && card.color_identity.length)
        ? card.color_identity.map(c => String(c).toUpperCase().trim())
        : null;
      const image = card.image;
      console.log(card);
      await pool.query(
        `INSERT INTO commanders (commander_name, color_id, image)
         VALUES ($1, $2::char(1)[], $3)
         ON CONFLICT (commander_name) DO NOTHING`,
        [name, colors, image]
      );
    } catch (e) {
      console.warn(`Scryfall failed for "${name}":`, e.message || e);
    }
  }));
}

