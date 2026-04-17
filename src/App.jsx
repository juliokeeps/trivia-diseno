import { useState } from 'react'

const TOTAL = 10
const palette = {
  yellow: '#F6C32D', orange: '#FF5032', beige: '#CDCDBE',
  tan: '#CDA56E', dark: '#1E1E1E', light: '#F5F5F0',
}

export default function App() {
  const [phase, setPhase] = useState('start')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFact, setShowFact] = useState(false)

  async function startGame() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Diseño y Arte', total: TOTAL })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setQuestions(data.questions); setScore(0); setCurrent(0)
      setSelected(null); setAnswered([]); setShowFact(false); setPhase('game')
    } catch (e) { setError('Error al cargar preguntas. Revisa tu API key.') }
    setLoading(false)
  }

  function handleSelect(idx) {
    if (selected !== null) return
    setSelected(idx)
    const correct = questions[current].answer === idx
    setAnswered(a => [...a, { selected: idx, correct, q: questions[current] }])
    if (correct) setScore(s => s + 1)
    setShowFact(false)
  }

  function next() {
    if (current + 1 >= questions.length) { setPhase('result') }
    else { setCurrent(c => c + 1); setSelected(null); setShowFact(false) }
  }

  const q = questions[current]
  const pct = Math.round((score / TOTAL) * 100)
  const badge = pct >= 80 ? { label: '🏆 Experto creativo', bg: palette.yellow, color: palette.dark }
    : pct >= 50 ? { label: '👁 Buen ojo', bg: palette.tan, color: palette.dark }
    : { label: '🎨 Sigue explorando', bg: palette.beige, color: palette.dark }

  const s = {
    wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
    card: { background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 540, boxShadow: '0 2px 24px rgba(0,0,0,0.08)' },
    optBase: { display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', borderRadius: 10, fontSize: 14, cursor: 'pointer', marginBottom: 8, border: '1.5px solid #E0E0D8', background: '#fff', color: palette.dark, transition: 'all 0.15s', lineHeight: 1.4 },
  }

  if (phase === 'start') return (
    <div style={s.wrap}><div style={{ ...s.card, textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎨</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Trivia Diseño & Arte</h1>
      <p style={{ color: '#666', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>{TOTAL} preguntas únicas sobre diseño gráfico, tipografía, arte e historia visual.</p>
      {error && <p style={{ color: palette.orange, marginBottom: 16, fontSize: 14 }}>{error}</p>}
      <button onClick={startGame} disabled={loading} style={{ background: palette.yellow, color: palette.dark, border: 'none', borderRadius: 10, padding: '12px 36px', fontSize: 16, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Generando preguntas...' : 'Comenzar →'}
      </button>
    </div></div>
  )

  if (phase === 'game' && q) {
    const progress = (current / TOTAL) * 100
    return (
      <div style={s.wrap}><div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#999' }}>{current + 1} / {TOTAL}</span>
          <span style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>✓ {score}</span>
        </div>
        <div style={{ height: 4, background: '#F0EFE8', borderRadius: 2, marginBottom: 20 }}>
          <div style={{ height: 4, width: `${progress}%`, background: palette.yellow, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginBottom: 20 }}>{q.q}</p>
        {q.options.map((opt, i) => {
          let style = { ...s.optBase }
          if (selected !== null) {
            if (i === q.answer) style = { ...style, background: '#E8F7EF', borderColor: '#1D9E75', color: '#0F6E56' }
            else if (i === selected && selected !== q.answer) style = { ...style, background: '#FEEEEE', borderColor: palette.orange, color: '#993C1D' }
            else style = { ...style, opacity: 0.5 }
          }
          return <button key={i} onClick={() => handleSelect(i)} style={style}><span style={{ fontWeight: 700, marginRight: 10 }}>{['A','B','C','D'][i]}.</span>{opt}</button>
        })}
        {selected !== null && q.fun_fact && (
          <div>
            <button onClick={() => setShowFact(f => !f)} style={{ background: 'none', border: 'none', color: palette.tan, fontSize: 13, cursor: 'pointer', padding: '8px 0', fontWeight: 600 }}>
              {showFact ? '▲ Ocultar dato' : '💡 Ver dato curioso'}
            </button>
            {showFact && <div style={{ background: '#FAFAF5', border: `1px solid ${palette.beige}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>{q.fun_fact}</div>}
          </div>
        )}
        {selected !== null && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button onClick={next} style={{ background: palette.dark, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {current + 1 < TOTAL ? 'Siguiente →' : 'Ver resultado →'}
            </button>
          </div>
        )}
      </div></div>
    )
  }

  if (phase === 'result') return (
    <div style={s.wrap}><div style={{ ...s.card, textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 8 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👁' : '🎨'}</div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{score} / {TOTAL}</h2>
      <div style={{ display: 'inline-block', padding: '5px 18px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>{badge.label}</div>
      <div style={{ textAlign: 'left', marginBottom: 24 }}>
        {answered.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 10, marginBottom: 6, background: a.correct ? '#E8F7EF' : '#FEEEEE', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 700, color: a.correct ? '#1D9E75' : palette.orange, marginTop: 1 }}>{a.correct ? '✓' : '✗'}</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>{a.q.q}</p>
              {!a.correct && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>Correcta: {a.q.options[a.q.answer]}</p>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={startGame} disabled={loading} style={{ background: palette.yellow, color: palette.dark, border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Cargando...' : 'Jugar de nuevo →'}
      </button>
    </div></div>
  )

  return null
}
