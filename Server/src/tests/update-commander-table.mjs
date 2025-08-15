
import { pool } from '../db/pool.mjs';
import { getCardInfoByName } from '../services/scryfallService.mjs';

async function fillMissing() {
  // Fetch commanders whose image is missing (adapt this WHERE clause as needed)
  const { rows } = await pool.query(
    `SELECT commander_name
       FROM commanders
      WHERE image IS NULL OR image = ''`
  );

  for (const { commander_name } of rows) {
    try {

      const cardInfo = await getCardInfoByName(commander_name);
      const { image } = cardInfo; 

      if (image) {
        await pool.query(
          `UPDATE commanders SET image = $1 WHERE commander_name = $2`,
          [image, commander_name]
        );
        console.log(`Updated ${commander_name}`);
      } else {
        console.warn(`No image returned for ${commander_name}; skipping`);
      }
    } catch (err) {
      console.error(`Failed to update ${commander_name}:`, err.message);
    }
  }
}

fillMissing()
  .catch((err) => console.error('Unexpected error:', err))
  .finally(() => pool.end());
