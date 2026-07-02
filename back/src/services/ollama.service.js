export async function generateWaveComment({ wave_number, blobs_eliminated, lives_lost, towers_used }) {
  const prompt = `Tu es un chroniqueur médiéval fantasy dramatique et épique.
Le joueur vient de terminer la vague ${wave_number} d'une partie de tower defense.
Voici ce qui s'est passé :
- Blobs éliminés : ${blobs_eliminated}
- Vies perdues : ${lives_lost}
- Tours utilisées : ${towers_used.join(', ') || 'aucune'}

Génère un commentaire narratif court (2-3 phrases maximum) dans un style médiéval fantasy,
en vouvoyant le joueur ("m'lord", "vaillant défenseur"...).
Adapte le ton : épique si peu de vies perdues, sombre si beaucoup.
Réponds uniquement avec le commentaire, sans guillemets ni formatage.`;

  try {
    const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:  process.env.OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const data = await response.json();
    return data.response?.trim() ?? null;

  } catch (err) {
    console.warn('Ollama indisponible :', err.message);
    return null;
  }
}