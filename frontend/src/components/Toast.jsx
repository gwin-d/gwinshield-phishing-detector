import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react'

let toastFn = null

export function toast(message, type = 'info', duration = 4000) {
  if (toastFn) toastFn(message, type, duration)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = (message, type, duration) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return () => { toastFn = null }
  }, [])

  const icons = {
    success: <CheckCircle  size={16} className="text-safe"    />,
    error:   <AlertTriangle size={16} className="text-danger" />,
    info:    <Info          size={16} className="text-cyan"   />,
  }

  const colors = {
    success: 'border-safe/30 bg-safe/10',
    error:   'border-danger/30 bg-danger/10',
    info:    'border-cyan/30 bg-cyan/10',
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1   }}
            exit={{    opacity: 0, x: 50, scale: 0.9 }}
            className={`flex items-center gap-3 glass rounded-xl px-4 py-3
              border min-w-[280px] max-w-[380px] shadow-xl ${colors[t.type]}`}
          >
            {icons[t.type]}
            <span className="text-sm text-white flex-1">{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-muted hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}