import { useEffect, useState } from 'react'

export default function ScoreRing({ score = 0, size = 120, label = '', color = '#00B4D8' }) {
  const [animated, setAnimated] = useState(0)
  const radius      = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset      = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(Math.round(score * 100))
    }, 200)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = () => {
    if (score >= 0.7) return '#FF3B3B'
    if (score >= 0.4) return '#F4A261'
    return '#00C896'
  }

  const ringColor = color === 'auto' ? getColor() : color

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
            style={{
              filter: `drop-shadow(0 0 6px ${ringColor})`,
            }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(score * 100)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted font-medium text-center">{label}</span>
      )}
    </div>
  )
}