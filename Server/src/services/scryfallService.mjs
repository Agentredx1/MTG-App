export async function getCardInfoByName(name, { exact = false, timeoutMs = 8000 } = {}) {
  if (!name || !name.trim()) {
    const err = new Error('Card name is required'); err.status = 400; throw err;
  }
  const url = new URL('https://api.scryfall.com/cards/named');
  url.searchParams.set(exact ? 'exact' : 'fuzzy', name.trim());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) {
      let msg = 'Scryfall lookup failed';
      try { const j = await r.json(); msg = j.details || j.message || msg; } catch {}
      const err = new Error(msg); err.status = r.status; throw err;
    }
    const card = await r.json();

    // pick an image
    let image = card.image_uris?.normal || null;
    if (!image && Array.isArray(card.card_faces) && card.card_faces.length) {
      const face = card.card_faces.find(f => f.image_uris?.normal) || card.card_faces[0];
      image = face?.image_uris?.normal || null;
    }

    return {
      name: card.name,
      color_identity: Array.isArray(card.color_identity) ? card.color_identity : [],
      image,
      set: card.set,
      type_line: card.type_line,
      scryfall_uri: card.scryfall_uri,
      id: card.id
    };
  } finally {
    clearTimeout(timer);
  }
}
