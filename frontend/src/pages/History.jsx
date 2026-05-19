import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert, ShieldCheck, Search,
  Clock, BarChart2, Download, Copy
} from 'lucide-react'
import { getHistory, getStats } from '../api/client'
import { toast } from '../components/Toast'
import { SkeletonRow, SkeletonStat } from '../components/Skeleton'
import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

function timeAgo(dateString) {
  const now  = new Date()
  const then = new Date(new Date(dateString).getTime() + 60 * 60 * 1000)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 0)     return 'just now'
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return then.toLocaleDateString()
}

export default function History() {
  const [records,  setRecords]  = useState([])
  const [stats,    setStats]    = useState(null)
  const [filter,   setFilter]   = useState('All')
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    Promise.all([getHistory(100), getStats()])
      .then(([h, s]) => { setRecords(h); setStats(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = records.filter(r => {
    const matchFilter = filter === 'All' || r.verdict === filter
    const matchSearch = r.url.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast('No records to export', 'error')
      return
    }
    const headers = [
      'URL', 'Verdict', 'Hybrid Score',
      'ML Score', 'Heuristic Score', 'Source', 'Scanned At'
    ]
    const rows = filtered.map(r => [
      `"${r.url}"`,
      r.verdict,
      r.hybrid_score,
      r.ml_score,
      r.heuristic_score,
      r.source,
      new Date(r.scanned_at).toLocaleString(),
    ])
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `gwinshield_history_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('Scan history exported successfully', 'success')
  }

  const copyURL = (e, url) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    toast('URL copied to clipboard', 'success')
  }

  const pieData = stats ? [
    { name: 'Safe',     value: stats.safe_found,     color: '#00C896' },
    { name: 'Phishing', value: stats.phishing_found, color: '#FF3B3B' },
  ] : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 pt-28 pb-20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2">
            Scan <span className="gradient-text">History</span>
          </h1>
          <p className="text-muted">All URLs checked through GwinShield</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 glass px-5 py-3 rounded-xl
            text-cyan border border-cyan/30 hover:bg-cyan/10
            transition-all duration-200 text-sm font-medium mt-2"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <SkeletonStat key={i} />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Scans',    value: stats.total_scans,         color: 'text-cyan'    },
            { label: 'Phishing Found', value: stats.phishing_found,      color: 'text-danger'  },
            { label: 'Safe URLs',      value: stats.safe_found,          color: 'text-safe'    },
            { label: 'Threat Rate',    value: `${stats.phishing_rate}%`, color: 'text-warning' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Table — takes 2 columns */}
        <div className="lg:col-span-2">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2
                -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search URLs..."
                className="w-full bg-white/5 border border-white/10 rounded-xl
                  pl-10 pr-4 py-3 text-white placeholder:text-muted/60
                  focus:outline-none focus:border-cyan/50 text-sm
                  transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Safe', 'Phishing'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${filter === f
                      ? f === 'Phishing'
                        ? 'bg-danger/20 text-danger border border-danger/30'
                        : f === 'Safe'
                          ? 'bg-safe/20 text-safe border border-safe/30'
                          : 'bg-white/10 text-white border border-white/20'
                      : 'glass text-muted hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Records */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5,6].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Clock size={40} className="text-muted mx-auto mb-4 opacity-50" />
              <p className="text-muted font-medium">No scan records yet</p>
              <p className="text-sm text-muted/60 mt-1">
                Check a URL on the home page to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div
                    onClick={() =>
                      setExpanded(expanded === r.id ? null : r.id)
                    }
                    className={`glass rounded-xl p-4 cursor-pointer
                      hover:border-white/20 transition-all duration-200
                      border-l-4 ${r.verdict === 'Phishing'
                        ? 'border-l-danger'
                        : 'border-l-safe'}`}
                  >
                    {/* Main row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {r.verdict === 'Phishing'
                          ? <ShieldAlert size={18}
                              className="text-danger flex-shrink-0" />
                          : <ShieldCheck size={18}
                              className="text-safe flex-shrink-0" />}
                        <span className="text-sm text-white/80 truncate">
                          {r.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-bold px-3 py-1
                          rounded-full ${r.verdict === 'Phishing'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-safe/20 text-safe'}`}>
                          {r.verdict}
                        </span>
                        <span className="text-xs text-muted hidden sm:block">
                          {timeAgo(r.scanned_at)}
                        </span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expanded === r.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        {/* Score bars */}
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          {[
                            { label: 'Hybrid Score',    value: r.hybrid_score    },
                            { label: 'ML Score',        value: r.ml_score        },
                            { label: 'Heuristic Score', value: r.heuristic_score },
                          ].map((s, j) => (
                            <div key={j} className="text-center">
                              <div className="text-lg font-bold text-white">
                                {Math.round(s.value * 100)}%
                              </div>
                              <div className="text-xs text-muted mb-2">
                                {s.label}
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full">
                                <div
                                  className={`h-full rounded-full transition-all
                                    ${s.value >= 0.5 ? 'bg-danger' : 'bg-safe'}`}
                                  style={{ width: `${s.value * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Meta + copy button */}
                        <div className="flex items-center
                          justify-between flex-wrap gap-2">
                          <div className="text-xs text-muted">
                            Source:{' '}
                            <span className="text-white capitalize">
                              {r.source}
                            </span>
                            {' | '}
                            {new Date(r.scanned_at).toLocaleString()}
                          </div>
                          <button
                            onClick={e => copyURL(e, r.url)}
                            className="flex items-center gap-1.5 text-xs
                              text-cyan hover:text-white transition-colors
                              glass px-3 py-1.5 rounded-lg"
                          >
                            <Copy size={11} />
                            Copy URL
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pie Chart — sticky sidebar */}
        <div className="glass rounded-2xl p-6 h-fit sticky top-28">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={18} className="text-cyan" />
            <h3 className="font-semibold">Scan Breakdown</h3>
          </div>

          {stats && (stats.safe_found + stats.phishing_found) > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        style={{
                          filter: `drop-shadow(0 0 6px ${entry.color})`
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background:   '#111827',
                      border:       '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color:        '#F1F5F9',
                    }}
                  />
                  <Legend
                    formatter={value => (
                      <span style={{ color: '#94A3B8', fontSize: '13px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {[
                  {
                    label: 'Safe URLs',
                    value: stats.safe_found,
                    color: 'text-safe',
                    bg:    'bg-safe/10',
                  },
                  {
                    label: 'Phishing Detected',
                    value: stats.phishing_found,
                    color: 'text-danger',
                    bg:    'bg-danger/10',
                  },
                ].map((item, i) => (
                  <div key={i}
                    className={`flex justify-between items-center
                      ${item.bg} rounded-xl px-4 py-2`}>
                    <span className="text-xs text-muted">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center
                  glass rounded-xl px-4 py-2">
                  <span className="text-xs text-muted">Threat Rate</span>
                  <span className="text-sm font-bold text-warning">
                    {stats.phishing_rate}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center
              text-muted text-sm text-center">
              <div>
                <Clock size={32} className="mx-auto mb-3 opacity-50" />
                <p>No data yet</p>
                <p className="text-xs mt-1 opacity-60">
                  Check some URLs to see stats
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}