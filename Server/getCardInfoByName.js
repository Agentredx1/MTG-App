// scryfall.js (ESM)
export async function getCardInfoByName(name, { exact = false, timeoutMs = 8000 } = {}) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Card name is required');
    err.status = 400;
    throw err;
  }

  const url = new URL('https://api.scryfall.com/cards/named');
  url.searchParams.set(exact ? 'exact' : 'fuzzy', name.trim());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'mtg-library/1.0 (+https://example.com)' }
    });

    // Error JSON response
    if (!r.ok) {
      let details = 'Scryfall lookup failed';
      try {
        const j = await r.json();
        details = j?.details || j?.message || details;
      } catch { /* ignore */ }
      const err = new Error(details);
      err.status = r.status;
      throw err;
    }

    const card = await r.json();

    const color_identity = Array.isArray(card.color_identity) ? card.color_identity : [];

    // Choose an image URL (works for MDFCs/split/adventure)
    let image = null;
    if (card.image_uris?.normal) {
      image = card.image_uris.normal;
    } else if (Array.isArray(card.card_faces) && card.card_faces.length) {
      const face = card.card_faces.find(f => f.image_uris?.normal) || card.card_faces[0];
      image = face?.image_uris?.normal || null;
    }

    return {
      name: card.name,
      color_identity,
      image,
      // extras that are often handy:
      set: card.set,
      type_line: card.type_line,
      scryfall_uri: card.scryfall_uri,
      id: card.id
    };
  } catch (e) {
    if (e?.name === 'AbortError') {
      const err = new Error('Scryfall request timed out');
      err.status = 504;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
