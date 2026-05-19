import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X, Activity } from 'lucide-react'
import { getHealth } from '../api/client'

export default function Navbar() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [apiOnline,  setApiOnline]  = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const location = useLocation()

  useEffect(() => {
    getHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/',             label: 'Home'         },
    { to: '/history',      label: 'History'      },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about',        label: 'About'        },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'glass border-b border-white/10 py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

       {/* Logo */}
       <Link to="/" className="flex items-center gap-3 group">
       <img
       src="/src/assets/logo.svg"
       alt="GwinShield Logo"
       className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
       />
      <div>
    <span className="text-xl font-bold gradient-text">GwinShield</span>
    <div className="text-xs text-muted -mt-1">by Gwin D</div>
  </div>
</Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-all duration-200
                ${isActive(link.to)
                  ? 'text-cyan border-b-2 border-cyan pb-0.5'
                  : 'text-muted hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* API Status */}
        <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-full">
          <Activity size={14} className={apiOnline ? 'text-safe' : 'text-danger'} />
          <span className={`text-xs font-medium ${apiOnline ? 'text-safe' : 'text-danger'}`}>
            {apiOnline ? 'API Online' : 'API Offline'}
          </span>
          <div className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-safe' : 'bg-danger'}
            animate-pulse`} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 px-6 py-4 space-y-4">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-2
                ${isActive(link.to) ? 'text-cyan' : 'text-muted'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <div className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-safe' : 'bg-danger'}
              animate-pulse`} />
            <span className={`text-xs ${apiOnline ? 'text-safe' : 'text-danger'}`}>
              {apiOnline ? 'API Online' : 'API Offline'}
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}