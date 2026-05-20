import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Search, Zap, Brain,
  AlertTriangle, Globe, Lock,
  Activity, Copy, FileText
} from 'lucide-react'
import { checkURL, getStats } from '../api/client'
import VerdictCard from '../components/VerdictCard'
import ThreatFeed from '../components/ThreatFeed'
import { SkeletonCard } from '../components/Skeleton'
import { toast } from '../components/Toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id:       i,
    size:     Math.random() * 70 + 20,
    x:        Math.random() * 100,
    y:        Math.random() * 100,
    delay:    Math.random() * 6,
    duration: Math.random() * 4 + 5,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle absolute rounded-full"
          style={{
            width:             p.size,
            height:            p.size,
            left:              `${p.x}%`,
            top:               `${p.y}%`,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

function Counter({ value, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const end = typeof value === 'number' ? value : 0
    if (!end) return
    let start = 0
    const step  = end / (1500 / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>{typeof value === 'number' ? count : value}{suffix}</span>
}

export default function Home() {
  const [url,     setUrl]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [stats,   setStats]   = useState(null)

  useEffect(() => {
    getStats().then(setStats).catch(() => {})
  }, [])

  const handleCheck = async () => {
    const trimmed = url.trim()
    if (!trimmed) { setError('Please enter a URL'); return }
    const hasScheme = trimmed.startsWith('http://') ||
                      trimmed.startsWith('https://') ||
                      trimmed.startsWith('www.')
    if (!hasScheme && !trimmed.includes('.')) {
      setError('Please enter a valid URL — e.g. https://example.com')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await checkURL(trimmed)
      setResult(data)
      if (data.verdict === 'Phishing') {
        toast('Phishing site detected — avoid this URL!', 'error')
      } else {
        toast('URL is safe — no threats detected.', 'success')
      }
      getStats().then(setStats).catch(() => {})
    } catch (e) {
      if (e.response?.status === 422) {
        setError('Invalid URL format. Please enter a valid URL.')
      } else {
        setError('Could not connect to API. Make sure the backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleCheck()
  }

  const copyResult = () => {
    if (!result) return
    const text =
`GwinShield Scan Result
URL: ${result.url}
Verdict: ${result.verdict}
Hybrid Score: ${Math.round(result.hybrid_score * 100)}%
ML Score: ${Math.round(result.ml_score * 100)}%
Heuristic Score: ${Math.round(result.heuristic_score * 100)}%
Flags: ${result.flags?.join(', ') || 'None'}
Method: ${result.method}
Scanned: ${new Date(result.scanned_at).toLocaleString()}`
    navigator.clipboard.writeText(text)
    toast('Result copied to clipboard', 'success')
  }

  const downloadReport = () => {
    if (!result) return
    const isPhishing = result.verdict === 'Phishing'
    const doc = new jsPDF()

    doc.setFillColor(13, 27, 62)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(0, 180, 216)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('GwinShield Threat Report', 14, 18)
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Hybrid Phishing Detection System — Rivers State University', 14, 26)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33)

    if (isPhishing) {
      doc.setFillColor(220, 38, 38)
    } else {
      doc.setFillColor(0, 200, 150)
    }
    doc.rect(0, 44, 210, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(
      isPhishing ? 'PHISHING SITE DETECTED' : 'SITE IS SAFE',
      14, 56
    )

    doc.setFillColor(245, 247, 250)
    doc.rect(0, 66, 210, 22, 'F')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.text('ANALYSED URL', 14, 73)
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(10)
    doc.text(result.url, 14, 82, { maxWidth: 182 })

    autoTable(doc, {
      startY: 94,
      head:   [['Score Type', 'Value', 'Interpretation']],
      body:   [
        ['Hybrid Score (S)', `${Math.round(result.hybrid_score * 100)}%`,
          result.hybrid_score >= 0.5 ? 'PHISHING (>= 50%)' : 'SAFE (< 50%)'],
        ['ML Score (M)', `${Math.round(result.ml_score * 100)}%`,
          'Random Forest probability'],
        ['Heuristic Score (H)', `${Math.round(result.heuristic_score * 100)}%`,
          'Rule-based score (divided by 1.45)'],
      ],
      headStyles:         { fillColor: [21, 101, 192], textColor: 255 },
      bodyStyles:         { textColor: [30, 41, 59]  },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 14, right: 14 },
    })

    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(`Detection Method: ${result.method}`, 14, finalY)
    doc.text(
      'Formula: S = (M x 0.30) + (H x 0.70) — Tier 2 Heuristic Dominant',
      14, finalY + 7
    )

    if (result.flags && result.flags.length > 0) {
      autoTable(doc, {
        startY:      finalY + 16,
        head:        [['Triggered Heuristic Rules']],
        body:        result.flags.map(f => [f]),
        headStyles:  { fillColor: [220, 38, 38], textColor: 255 },
        bodyStyles:  { textColor: [30, 41, 59]  },
        margin:      { left: 14, right: 14 },
      })
    } else {
      const y2 = finalY + 18
      doc.setFillColor(0, 200, 150)
      doc.roundedRect(14, y2, 182, 10, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('No heuristic rules triggered — URL appears legitimate', 18, y2 + 7)
    }

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `GwinShield | Chiogbonda Godwins Aruchi | DE.2022/7432 | Rivers State University | Page ${i}/${pageCount}`,
        14, 290
      )
    }

    doc.save(`GwinShield_Threat_Report_${Date.now()}.pdf`)
    toast('Threat report downloaded', 'success')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col
        items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        <div className="absolute inset-0 bg-hero-gradient animated-mesh opacity-80" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <Particles />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full
          bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full
          bg-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass px-4 py-2
              rounded-full mb-8 text-xs text-cyan font-medium"
          >
            <Activity size={12} className="animate-pulse" />
            AI-Powered Phishing Detection
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            style={{ color: 'var(--text)' }}
          >
            Is This URL{' '}
            <span className="gradient-text">Safe?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            Paste any URL below. GwinShield analyses it instantly using
            Heuristic Analysis and Random Forest AI to detect phishing threats.
          </motion.p>

          {/* Scanner Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-3xl p-6 md:p-8 glow-blue mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className={`flex-1 relative rounded-2xl overflow-hidden
                ${loading ? 'input-scanning' : ''}`}>
                <Globe
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com or paste any suspicious link..."
                  className="w-full rounded-2xl pl-12 pr-4 py-4
                    focus:outline-none transition-all duration-300
                    text-sm md:text-base relative z-10"
                  style={{
                    background:  'var(--input-bg)',
                    border:      '1px solid',
                    borderColor: loading ? '#00B4D8' : 'var(--input-border)',
                    color:       'var(--text)',
                  }}
                />
              </div>
              <button
                onClick={handleCheck}
                disabled={loading}
                className="btn-primary px-8 py-4 rounded-2xl font-bold
                  text-white flex items-center justify-center gap-3
                  min-w-[160px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30
                      border-t-white rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Check URL
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-danger
                  text-sm mt-2 mb-2"
              >
                <AlertTriangle size={14} />
                {error}
              </motion.div>
            )}

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <Lock size={12} />
              <span>
                Analysed in real-time using 9 heuristic rules + Random Forest AI.
                Press Enter to check.
              </span>
            </div>
          </motion.div>

          {/* Loading skeleton */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <SkeletonCard />
            </motion.div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <VerdictCard result={result} />
                <div className="flex items-center justify-center gap-3
                  mt-3 flex-wrap">
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-2 glass px-4 py-2
                      rounded-xl text-xs font-medium transition-colors
                      hover:border-cyan/40"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Copy size={12} />
                    Copy Result
                  </button>
                  <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 glass px-4 py-2
                      rounded-xl text-xs font-medium transition-colors
                      hover:border-warning/40 text-warning"
                  >
                    <FileText size={12} />
                    Download Threat Report (PDF)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: 'Total Scans',      value: stats.total_scans,    color: 'text-cyan'   },
                { label: 'Threats Detected', value: stats.phishing_found, color: 'text-danger' },
                { label: 'Model Accuracy',   value: stats.model_accuracy, color: 'text-safe', suffix: '%' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-4 text-center">
                  <div className={`text-2xl md:text-3xl font-black ${s.color}`}>
                    <Counter value={s.value} suffix={s.suffix || ''} />
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl md:text-4xl font-black mb-4"
            style={{ color: 'var(--text)' }}
          >
            How <span className="gradient-text">GwinShield</span> Works
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Three steps. Zero effort. Instant results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon:  Globe,
              step:  '01',
              title: 'Paste Your URL',
              desc:  'Drop any suspicious link into the scanner — http or https, long or short, any domain.',
              color: 'text-cyan',
              bg:    'bg-cyan/10',
            },
            {
              icon:  Brain,
              step:  '02',
              title: 'AI Analysis',
              desc:  'Our hybrid engine runs 9 heuristic rules and a 100-tree Random Forest simultaneously.',
              color: 'text-primary',
              bg:    'bg-primary/10',
            },
            {
              icon:  Shield,
              step:  '03',
              title: 'Instant Verdict',
              desc:  'Get a clear Safe or Phishing verdict with risk level, score breakdown, and threat flags.',
              color: 'text-safe',
              bg:    'bg-safe/10',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-8 hover:-translate-y-2
                transition-transform duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${item.bg}
                  flex items-center justify-center ${item.color}
                  group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={26} />
                </div>
                <span className="text-5xl font-black opacity-10">
                  {item.step}
                </span>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--text)' }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: 'var(--text-muted)' }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap size={22} className="text-cyan" />
              <h3
                className="text-xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                Hybrid Detection
              </h3>
            </div>
            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              GwinShield combines two complementary detection layers.
              The heuristic engine catches obvious threats with 9 rules
              including brand impersonation. The Random Forest model
              catches subtle, learned patterns. Together: 99.91% accuracy.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Heuristic Rules', value: '9'      },
                { label: 'ML Features',     value: '12'     },
                { label: 'Accuracy',        value: '99.91%' },
                { label: 'Training Data',   value: '11,055' },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="text-xl font-black text-cyan">{m.value}</div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <ThreatFeed />
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}