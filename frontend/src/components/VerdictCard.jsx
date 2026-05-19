import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react'
import ScoreRing from './ScoreRing'
import { motion } from 'framer-motion'

function ThreatLevel({ score }) {
  const level = score >= 0.75 ? 'Critical'
    : score >= 0.50 ? 'High'
    : score >= 0.25 ? 'Medium'
    : 'Low'

  const styles = {
    Critical: 'bg-danger/20 text-danger border-danger/40',
    High:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Medium:   'bg-warning/20 text-warning border-warning/40',
    Low:      'bg-safe/20 text-safe border-safe/40',
  }

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${styles[level]}`}>
      {level} Risk
    </span>
  )
}

export default function VerdictCard({ result }) {
  if (!result) return null
  const isPhishing = result.verdict === 'Phishing'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`rounded-2xl p-6 md:p-8 border-2 transition-all
        ${isPhishing
          ? 'border-danger/50 bg-danger/5 verdict-phishing'
          : 'border-safe/50 bg-safe/5 verdict-safe'}`}
    >
      {/* Header — icon and text side by side, tightly grouped */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center
          justify-center flex-shrink-0
          ${isPhishing ? 'bg-danger/20' : 'bg-safe/20'}`}>
          {isPhishing
            ? <ShieldAlert size={32} className="text-danger" />
            : <ShieldCheck size={32} className="text-safe"   />}
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-widest mb-0.5">
            Verdict
          </div>
          <div className={`text-2xl font-black leading-tight
            ${isPhishing ? 'text-danger' : 'text-safe'}`}>
            {isPhishing ? 'PHISHING DETECTED' : 'SAFE'}
          </div>
        </div>
        <div className="ml-auto">
          <ThreatLevel score={result.hybrid_score} />
        </div>
      </div>

      {/* URL */}
      <div className="mb-5 p-3 glass rounded-xl">
        <div className="text-xs text-muted mb-1">Checked URL</div>
        <div className="text-sm text-white/80 break-all">{result.url}</div>
      </div>

      {/* Score Rings */}
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

      {/* Flags */}
      {result.flags && result.flags.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <span className="text-sm font-semibold text-danger">
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
          <CheckCircle size={16} className="text-safe" />
          <span className="text-sm text-safe">
            No suspicious indicators detected
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10
        flex justify-between items-center text-xs text-muted">
        <span>
          Method:{' '}
          <span className="text-white capitalize">{result.method}</span>
        </span>
        <span>{new Date(result.scanned_at).toLocaleString()}</span>
      </div>
    </motion.div>
  )
}