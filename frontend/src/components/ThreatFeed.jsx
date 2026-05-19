import { useEffect, useState } from 'react'
import { ShieldAlert, ShieldCheck, Clock } from 'lucide-react'
import { getHistory } from '../api/client'

function timeAgo(dateString) {
  const now  = new Date()
  // Add 1 hour offset for WAT (UTC+1)
  const then = new Date(new Date(dateString).getTime() + 60 * 60 * 1000)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 0)    return 'just now'
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return new Date(then).toLocaleDateString()
}
function truncateDomain(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return url.slice(0, 30) + '...'
  }
}

export default function ThreatFeed() {
  const [items, setItems] = useState([])

  const fetchFeed = async () => {
    try {
      const data = await getHistory(6)
      setItems(data)
    } catch {
      // API might be offline
    }
  }

  useEffect(() => {
    fetchFeed()
    const interval = setInterval(fetchFeed, 30000)
    return () => clearInterval(interval)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-cyan" />
        <h3 className="text-sm font-semibold text-white">Live Threat Feed</h3>
        <div className="w-2 h-2 rounded-full bg-safe animate-pulse ml-auto" />
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between
            py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              {item.verdict === 'Phishing'
                ? <ShieldAlert size={16} className="text-danger flex-shrink-0" />
                : <ShieldCheck  size={16} className="text-safe flex-shrink-0" />}
              <span className="text-sm text-white/80 truncate max-w-[180px]">
                {truncateDomain(item.url)}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-xs font-bold px-2 py-1 rounded-full
                ${item.verdict === 'Phishing'
                  ? 'bg-danger/20 text-danger'
                  : 'bg-safe/20 text-safe'}`}>
                {item.verdict}
              </span>
              <span className="text-xs text-muted">
                {timeAgo(item.scanned_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}