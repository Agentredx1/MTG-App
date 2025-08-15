// test-scryfall.js
(async () => {
  const { getCardInfoByName } =
    await import('../services/scryfallService.mjs');

  try {
    const card = await getCardInfoByName('Sol Ring');
    console.log(card);
  } catch (e) {
    console.error('Lookup failed:', e);
  }
})();
