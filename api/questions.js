export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { topic = 'Diseño y Arte', total = 10 } = req.body || {}

  const prompt = `Eres un generador de preguntas de trivia sobre ${topic}.
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 2000 }
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```json|\n|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar preguntas', detail: err.message })
  }
}
