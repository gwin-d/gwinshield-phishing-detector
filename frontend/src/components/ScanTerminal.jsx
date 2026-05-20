import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'

function getSteps(url) {
  return [
    { text: '> Initialising GwinShield detection engine v1.0...', delay: 0,    type: 'info'  },
    { text: `> Parsing URL: ${url.length > 50 ? url.slice(0,50)+'...' : url}`, delay: 250,   type: 'dim'   },
    { text: '> Extracting 12 lexical URL features...',            delay: 550,   type: 'info'  },
    { text: '  [url_length] [num_dots] [has_at_symbol] [subdomain_count] [uses_https]...', delay: 800, type: 'dim' },
    { text: '> Running Levenshtein distance check (60+ brands)...', delay: 1100, type: 'info' },
    { text: '> Applying 9 weighted heuristic rules...',           delay: 1600,  type: 'info'  },
    { text: '  [IP Address] [@ Symbol] [Brand Impersonation] [Typosquatting]...', delay: 1900, type: 'dim' },
    { text: '> Loading Random Forest model (.pkl)...',            delay: 2300,  type: 'info'  },
    { text: '> Executing ensemble of 100 decision trees...',      delay: 2700,  type: 'info'  },
    { text: '> Computing weighted hybrid score...',               delay: 3100,  type: 'info'  },
    { text: '> Persisting result to SQLite database...',          delay: 3500,  type: 'dim'   },
  ]
}

export default function ScanTerminal({ url, result, isLoading }) {
  const [lines,    setLines]    = useState([])
  const bottomRef              = useRef(null)

  useEffect(() => {
    if (!isLoading) { setLines([]); return }
    setLines([])
    const steps  = getSteps(url || '')
    const timers = steps.map((s, i) =>
      setTimeout(() => setLines(prev => [...prev, s]), s.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [isLoading, url])

  useEffect(() => {
    if (!result || isLoading) return
    const isPhishing = result.verdict === 'Phishing'
    const extra = [
      {
        text:  `> Applying decision threshold...`,
        type:  'info',
      },
      {
        text:  `> ─────────────────────────────────────────────`,
        type:  'dim',
      },
      {
        text:  `> RESULT: ${result.verdict.toUpperCase()} [S=${(result.hybrid_score).toFixed(4)}] [M=${(result.ml_score).toFixed(4)}] [H=${(result.heuristic_score).toFixed(4)}]`,
        type:  isPhishing ? 'danger' : 'success',
      },
      {
        text:  `> Method: ${result.method} | Flags: ${result.flags?.length || 0} triggered`,
        type:  'dim',
      },
      {
        text:  `> Scan complete. ${new Date().toLocaleTimeString()}`,
        type:  'dim',
      },
    ]
    extra.forEach((line, i) =>
      setTimeout(() => setLines(prev => [...prev, line]), i * 180)
    )
  }, [result, isLoading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  if (!isLoading && lines.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(0,180,216,0.2)',
      }}
    >
      {/* Terminal titlebar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'rgba(0,180,216,0.15)', background: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-safe/60" />
        </div>
        <Terminal size={12} className="text-cyan ml-2" />
        <span className="text-xs font-mono" style={{ color: 'rgba(0,180,216,0.8)' }}>
          GwinShield Detection Engine
        </span>
        {isLoading && (
          <div className="ml-auto flex gap-1">
            {[0, 0.15, 0.3].map((d, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-cyan"
                style={{ animation: `pulse 1s ${d}s infinite` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Terminal body */}
      <div
        className="p-4 font-mono text-xs space-y-1 overflow-y-auto"
        style={{ maxHeight: '200px' }}
      >
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                color:
                  line.type === 'danger'  ? '#FF6B6B'              :
                  line.type === 'success' ? '#00C896'              :
                  line.type === 'dim'     ? 'rgba(148,163,184,0.6)' :
                  'rgba(0,180,216,0.9)',
                fontWeight: line.type === 'danger' || line.type === 'success'
                  ? 700 : 400,
              }}
            >
              {line.text}
              {i === lines.length - 1 && isLoading && (
                <span style={{ animation: 'pulse 1s infinite' }}> █</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </motion.div>
  )
}