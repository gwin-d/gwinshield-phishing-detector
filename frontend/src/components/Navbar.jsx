import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Activity, Sun, Moon } from 'lucide-react'
import { getHealth } from '../api/client'
import { useTheme } from '../ThemeContext'

export default function Navbar() {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

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

  const isActive = path => location.pathname === path

  const navBg = scrolled
    ? 'nav-glass'
    : 'bg-transparent'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all
      duration-300 ${navBg} ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/src/assets/logo.svg"
            alt="GwinShield"
            className="w-10 h-10 group-hover:scale-110
              transition-transform duration-300"
          />
          <div>
            <span className="text-xl font-bold gradient-text">
              GwinShield
            </span>
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

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-3">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="glass w-9 h-9 rounded-full flex items-center
              justify-center hover:border-cyan/40 transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark'
              ? <Sun  size={16} className="text-warning" />
              : <Moon size={16} className="text-primary" />}
          </button>

          {/* API Status */}
          <div className="flex items-center gap-2 glass
            px-4 py-2 rounded-full">
            <Activity size={14}
              className={apiOnline ? 'text-safe' : 'text-danger'} />
            <span className={`text-xs font-medium
              ${apiOnline ? 'text-safe' : 'text-danger'}`}>
              {apiOnline ? 'API Online' : 'API Offline'}
            </span>
            <div className={`w-2 h-2 rounded-full animate-pulse
              ${apiOnline ? 'bg-safe' : 'bg-danger'}`} />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="glass w-9 h-9 rounded-full flex items-center
              justify-center"
          >
            {theme === 'dark'
              ? <Sun  size={15} className="text-warning" />
              : <Moon size={15} className="text-primary" />}
          </button>
          <button
            className="text-white ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10
          px-6 py-4 space-y-4">
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
            <div className={`w-2 h-2 rounded-full animate-pulse
              ${apiOnline ? 'bg-safe' : 'bg-danger'}`} />
            <span className={`text-xs
              ${apiOnline ? 'text-safe' : 'text-danger'}`}>
              {apiOnline ? 'API Online' : 'API Offline'}
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}