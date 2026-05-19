import { useEffect, useState } from 'react'

export default function StatCard({ icon: Icon, label, value, color = 'text-cyan', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplay(value)
      return
    }
    let start = 0
    const duration = 1500
    const step = numValue / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= numValue) {
        setDisplay(numValue)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-3 hover:border-white/20
      transition-all duration-300 group hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center
        bg-white/5 group-hover:scale-110 transition-transform duration-300 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className={`text-3xl font-bold ${color}`}>
          {typeof value === 'number' ? display : value}{suffix}
        </div>
        <div className="text-sm text-muted mt-1">{label}</div>
      </div>
    </div>
  )
}