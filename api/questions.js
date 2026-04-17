export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { topic = 'Diseño y Arte', total = 10 } = req.body || {}

  const systemPrompt = `Eres un generador de preguntas de trivia sobre ${topic}.
Genera exactamente ${total} preguntas variadas que cubran: diseño gráfico, tipografía, historia del arte, movimientos artísticos, diseño industrial, arquitectura icónica, color, fotografía, artistas y diseñadores famosos.

Responde SOLO con un JSON válido, sin backticks ni texto extra, con este formato:
{
  "questions": [
    {
      "q": "Pregunta aquí",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "fun_fact": "Dato curioso breve sobre la respuesta correcta."
    }
  ]
}

donde "answer" es el índice (0-3) de la opción correcta. Mezcla dificultad: fácil, media y difícil. Todas en español.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Genera el trivia ahora.' }]
      })
    })

    const data = await response.json()
    const text = data.content?.find(b => b.type === 'text')?.text || ''
    const parsed = JSON.parse(text)
    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar preguntas', detail: err.message })
  }
}
