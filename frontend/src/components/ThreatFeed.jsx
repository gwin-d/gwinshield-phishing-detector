import { useEffect, useState } from 'react'
import { ShieldAlert, ShieldCheck, Clock } from 'lucide-react'
import { getHistory } from '../api/client'

function timeAgo(dateString) {
  const now  = new Date()
  let then   = new Date(dateString)
  let diff   = Math.floor((now - then) / 1000)
  if (diff < 0) {
    then = new Date(then.getTime() - 60 * 60 * 1000)
    diff = Math.floor((now - then) / 1000)
  }
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return then.toLocaleDateString()
}

function truncateDomain(url) {
  try {
    return new URL(url).hostname
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
    } catch {}
  }

  useEffect(() => {
    fetchFeed()
    const interval = setInterval(fetchFeed, 30000)
    return () => clearInterval(interval)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="glass rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-cyan" />
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text)' }}
        >
          Live Threat Feed
        </h3>
        <div className="w-2 h-2 rounded-full bg-safe animate-pulse ml-auto" />
      </div>

      <div className="space-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3"
            style={{
              borderBottom: i < items.length - 1
                ? '1px solid var(--card-border)'
                : 'none',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.verdict === 'Phishing'
                ? <ShieldAlert size={16} className="text-danger flex-shrink-0" />
                : <ShieldCheck  size={16} className="text-safe  flex-shrink-0" />}
              <span
                className="text-sm truncate max-w-[160px] font-medium"
                style={{ color: 'var(--text)' }}
              >
                {truncateDomain(item.url)}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full
                  ${item.verdict === 'Phishing'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-safe/20 text-safe'}`}
              >
                {item.verdict}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {timeAgo(item.scanned_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}