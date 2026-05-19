import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const links = [
    { to: '/',             label: 'URL Scanner'  },
    { to: '/history',      label: 'Scan History' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about',        label: 'About'        },
  ]

  const info = [
    'Chiogbonda Godwins Aruchi',
    'DE.2022/7432',
    'Computer Science',
    'Rivers State University',
    'Supervisor: Dr. E.O. Bennett',
  ]

  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
              src="/src/assets/logo.svg"
              alt="GwinShield"
              className="w-8 h-8"
              />
              <span className="font-bold gradient-text">GwinShield</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Your AI-Powered Defence Against Phishing.
              Hybrid detection using Heuristic Analysis and Random Forest.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
            <div className="space-y-2">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Project Info</h4>
            <div className="space-y-2">
              {info.map((item, i) => (
                <p key={i} className="text-sm text-muted">{item}</p>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            2026 GwinShield. Final Year Project - Rivers State University.
          </p>
          <p className="text-xs text-muted flex items-center gap-1">
            Built with
            <Heart size={12} className="text-danger mx-1" />
            by Gwin D
          </p>
        </div>

      </div>
    </footer>
  )
}