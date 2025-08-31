import { getCardInfoByName } from '../services/scryfallService.mjs';

export async function getCardDetails(req, res) {
  try {
    const cardName = req.params.name?.trim();
    
    if (!cardName) {
      return res.status(400).json({ error: 'Card name is required' });
    }

    const cardData = await getCardInfoByName(cardName, { exact: false });
    res.json(cardData);
  } catch (err) {
    console.error('Card details error:', err);
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to fetch card details' });
  }
}