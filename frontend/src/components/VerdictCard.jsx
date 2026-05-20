import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react'
import ScoreRing from './ScoreRing'
import { motion } from 'framer-motion'

function ThreatLevel({ score }) {
  const level =
    score >= 0.75 ? 'Critical' :
    score >= 0.50 ? 'High'     :
    score >= 0.25 ? 'Medium'   : 'Low'

  const map = {
    Critical: { bg: 'rgba(255,59,59,0.15)',  color: '#FF4444', border: 'rgba(255,59,59,0.5)'  },
    High:     { bg: 'rgba(249,115,22,0.15)', color: '#F97316', border: 'rgba(249,115,22,0.5)' },
    Medium:   { bg: 'rgba(244,162,97,0.15)', color: '#F4A261', border: 'rgba(244,162,97,0.5)' },
    Low:      { bg: 'rgba(0,200,150,0.15)',  color: '#00C896', border: 'rgba(0,200,150,0.5)'  },
  }
  const s = map[level]

  return (
    <span
      className="text-xs font-bold px-3 py-1 rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {level} Risk
    </span>
  )
}

export default function VerdictCard({ result }) {
  if (!result) return null
  const isPhishing = result.verdict === 'Phishing'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-2xl p-6 md:p-8 border-2"
      style={{
        borderColor: isPhishing ? 'rgba(255,59,59,0.5)' : 'rgba(0,200,150,0.5)',
        background:  isPhishing ? 'rgba(255,59,59,0.05)' : 'rgba(0,200,150,0.05)',
        animation:   isPhishing
          ? 'phishingPulse 2s ease-in-out infinite'
          : 'safePulse 2s ease-in-out infinite',
      }}
    >
      {/* ── Header — icon RIGHT NEXT TO verdict text ─────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center
              justify-center flex-shrink-0"
            style={{
              background: isPhishing
                ? 'rgba(255,59,59,0.2)'
                : 'rgba(0,200,150,0.2)',
            }}
          >
            {isPhishing
              ? <ShieldAlert size={28} style={{ color: '#FF3B3B' }} />
              : <ShieldCheck size={28} style={{ color: '#00C896' }} />}
          </div>
          <div>
            <div
              className="text-xs uppercase tracking-widest font-semibold mb-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Verdict
            </div>
            <div
              className="text-xl md:text-2xl font-black leading-tight"
              style={{ color: isPhishing ? '#FF3B3B' : '#00C896' }}
            >
              {isPhishing ? 'PHISHING DETECTED' : 'SAFE'}
            </div>
          </div>
        </div>
        <ThreatLevel score={result.hybrid_score} />
      </div>

      {/* ── URL ──────────────────────────────────────────────── */}
      <div
        className="mb-5 p-3 glass rounded-xl"
      >
        <div
          className="text-xs font-semibold mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Checked URL
        </div>
        <div
          className="text-sm break-all font-medium"
          style={{ color: 'var(--text)' }}
        >
          {result.url}
        </div>
      </div>

      {/* ── Score Rings ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-5 p-4 glass rounded-xl">
        <ScoreRing
          score={result.hybrid_score}
          label="Hybrid Score"
          color="auto"
          size={100}
        />
        <ScoreRing
          score={result.ml_score}
          label="ML Score"
          color="#1565C0"
          size={100}
        />
        <ScoreRing
          score={result.heuristic_score}
          label="Heuristic Score"
          color="#00B4D8"
          size={100}
        />
      </div>

      {/* ── Flags ─────────────────────────────────────────────── */}
      {result.flags && result.flags.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: '#FF3B3B' }} />
            <span
              className="text-sm font-semibold"
              style={{ color: '#FF3B3B' }}
            >
              {result.flags.length} Warning{result.flags.length > 1 ? 's' : ''} Detected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.flags.map((flag, i) => (
              <span key={i} className="flag-chip">{flag}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <CheckCircle size={15} style={{ color: '#00C896' }} />
          <span className="text-sm font-medium" style={{ color: '#00C896' }}>
            No suspicious indicators detected
          </span>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <div
        className="mt-4 pt-4 border-t border-white/10
          flex justify-between items-center text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>
          Method:{' '}
          <span
            className="capitalize font-medium"
            style={{ color: 'var(--text)' }}
          >
            {result.method}
          </span>
        </span>
        <span>{new Date(result.scanned_at).toLocaleString()}</span>
      </div>
    </motion.div>
  )
}