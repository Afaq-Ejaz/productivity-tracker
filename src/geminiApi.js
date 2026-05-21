const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

export async function getGeminiInsight(summary, rangeType) {
  const prompt = `You are a sharp, direct productivity coach. Analyze this person's productivity data for the past ${rangeType} and respond in exactly this JSON format (no markdown, no extra text):

{
  "encouragement": "one punchy encouraging sentence based on what they actually did well",
  "painPoint": "one specific, honest pain point they are likely ignoring based on the data",
  "streak": "a short observation about their consistency pattern"
}

Data:
- Average productivity score: ${summary.avg}/100
- Total tasks completed: ${summary.totalTasks}
- Total calendar events attended: ${summary.totalEvents}
- Zero-productivity days: ${summary.zeroDays} out of ${summary.days}
- Best day score: ${summary.best?.score ?? 0} on ${summary.best?.label ?? 'N/A'}
- Worst day score: ${summary.worst?.score ?? 0} on ${summary.worst?.label ?? 'N/A'}

Be brutally honest but constructive. No fluff. Max 20 words per field.`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {
      encouragement: 'Keep showing up — consistency beats perfection every time.',
      painPoint: 'Your zero-days are silently killing your momentum.',
      streak: 'Your pattern shows room for more intentional scheduling.',
    }
  }
}
