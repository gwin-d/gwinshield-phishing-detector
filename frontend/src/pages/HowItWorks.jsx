import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Brain, Zap, ChevronDown,
  Globe, AlertTriangle, CheckCircle,
  ArrowRight, Lock, Eye, Hash, Flag
} from 'lucide-react'

const heuristicRules = [
  { rule: 'IP Address in URL',      weight: '0.25', icon: Globe,
    desc: 'Raw IP addresses in domains are extremely rare in legitimate sites and almost always indicate phishing', highlight: false },
  { rule: '@ Symbol Present',       weight: '0.20', icon: Hash,
    desc: 'Forces browsers to ignore everything before the @ symbol — a classic URL obfuscation trick', highlight: false },
  { rule: 'Brand Impersonation',    weight: '0.35', icon: Flag,
    desc: 'A known brand name (e.g. paypal, google, apple) appears in the URL but the domain does not belong to that brand — highest weighted rule', highlight: true },
  { rule: 'Typosquatting Detected', weight: '0.20', icon: Eye,
    desc: 'Domain is 1-2 characters away from a known brand name (e.g. paypa1.com vs paypal.com)', highlight: false },
  { rule: 'URL Length > 75 chars',  weight: '0.10', icon: ArrowRight,
    desc: 'Excessively long URLs often contain obfuscated redirects and encoded parameters', highlight: false },
  { rule: 'Subdomain Count > 3',    weight: '0.10', icon: Globe,
    desc: 'Attackers inject trusted brand names as subdomains (e.g. paypal.com.malicious.net)', highlight: false },
  { rule: 'No HTTPS',               weight: '0.10', icon: Lock,
    desc: 'Absence of HTTPS is a strong red flag — virtually all legitimate sites use HTTPS today', highlight: false },
  { rule: 'Suspicious Keywords',    weight: '0.10', icon: AlertTriangle,
    desc: 'Words like login, verify, secure, update, confirm in non-institutional domains', highlight: false },
  { rule: 'URL Shortener Used',     weight: '0.05', icon: Lock,
    desc: 'Services like bit.ly and tinyurl.com hide the real destination URL', highlight: false },
]

const tiers = [
  {
    tier:      'Tier 1 — Fast-path',
    condition: 'H >= 0.60',
    formula:   'Verdict: Phishing immediately',
    titleColor: '#FF6B6B',
    bg:         'rgba(255,59,59,0.12)',
    border:     'rgba(255,59,59,0.5)',
  },
  {
    tier:      'Tier 2 — Heuristic Dominant',
    condition: '0.15 <= H < 0.60',
    formula:   'S = (M x 0.30) + (H x 0.70), if S >= 0.20',
    titleColor: '#F4A261',
    bg:         'rgba(244,162,97,0.12)',
    border:     'rgba(244,162,97,0.5)',
  },
  {
    tier:      'Tier 3 — ML Dominant',
    condition: 'H < 0.15',
    formula:   'S = (M x 0.70) + (H x 0.30), if S >= 0.50',
    titleColor: '#00C896',
    bg:         'rgba(0,200,150,0.12)',
    border:     'rgba(0,200,150,0.5)',
  },
]

const faqs = [
  {
    q: 'What is phishing?',
    a: 'Phishing is a cyber attack where criminals create fake websites that look identical to trusted ones — like your bank or PayPal — to steal your login credentials, financial details, or personal information.',
  },
  {
    q: 'How accurate is GwinShield?',
    a: 'GwinShield achieves 99.91% accuracy, 100% precision, 99.83% recall, and 99.92% F1-Score on the UCI Phishing Website Dataset (11,055 URLs). This means it catches almost all phishing sites with zero false positives on the test set.',
  },
  {
    q: 'Does GwinShield store my URLs?',
    a: 'Yes — scan results including the URL, verdict, and scores are stored in a local SQLite database to power the scan history and statistics features. No personal identifying information is collected.',
  },
  {
    q: 'How is the extension different from the portal?',
    a: 'The web portal requires you to manually paste a URL and click Check. The browser extension works automatically — every website you visit is silently checked in the background, and you are only alerted if a threat is detected.',
  },
  {
    q: 'What does the hybrid score mean?',
    a: 'The hybrid score (S) is computed using a three-tier system. If H >= 0.60, Phishing immediately. If H >= 0.15, S = (M x 0.30) + (H x 0.70), verdict if S >= 0.20. Otherwise S = (M x 0.70) + (H x 0.30), verdict if S >= 0.50.',
  },
  {
    q: 'What is brand impersonation?',
    a: 'Brand impersonation is when a phishing URL contains a well-known brand name (like paypal or google) but the actual domain does not belong to that brand. GwinShield detects this against a list of over 60 known brands with a weight of 0.35 — the highest of all rules.',
  },
]

function FAQ({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between
          px-6 py-5 text-left transition-colors"
        style={{ background: open ? 'rgba(255,255,255,0.03)' : 'transparent' }}
      >
        <span
          className="font-semibold text-sm md:text-base"
          style={{ color: 'var(--text)' }}
        >
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 transition-transform duration-300
            ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 pb-5 text-sm leading-relaxed
            border-t border-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          <p className="pt-4">{item.a}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function HowItWorks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 pt-28 pb-20"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <h1
          className="text-4xl md:text-6xl font-black mb-4"
          style={{ color: 'var(--text)' }}
        >
          How It <span className="gradient-text">Works</span>
        </h1>
        <p className="max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          A deep look inside GwinShield's two-layer detection engine
        </p>
      </div>

      {/* Pipeline */}
      <div className="mb-16">
        <h2
          className="text-2xl font-black text-center mb-10"
          style={{ color: 'var(--text)' }}
        >
          Detection <span className="gradient-text">Pipeline</span>
        </h2>
        <div className="flex flex-col md:flex-row items-center
          justify-center gap-4 md:gap-0">
          {[
            { label: 'URL Input',          icon: Globe,       color: 'bg-cyan/20 text-cyan'       },
            { label: 'Feature Extraction', icon: Hash,        color: 'bg-primary/20 text-primary'  },
            { label: 'Heuristic Engine',   icon: Zap,         color: 'bg-warning/20 text-warning'  },
            { label: 'RF Classifier',      icon: Brain,       color: 'bg-safe/20 text-safe'        },
            { label: 'Hybrid Scorer',      icon: Shield,      color: 'bg-cyan/20 text-cyan'        },
            { label: 'Verdict',            icon: CheckCircle, color: 'bg-safe/20 text-safe'        },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-16 h-16 rounded-2xl ${step.color}
                  flex items-center justify-center`}>
                  <step.icon size={24} />
                </div>
                <span
                  className="text-xs text-center w-20"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {step.label}
                </span>
              </motion.div>
              {i < arr.length - 1 && (
                <ArrowRight
                  size={16}
                  className="mx-3 flex-shrink-0 hidden md:block"
                  style={{ color: 'var(--card-border)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

        {/* Heuristic Engine */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/20
              flex items-center justify-center">
              <Zap size={20} className="text-warning" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Heuristic Engine
            </h3>
          </div>
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            9 rule-based checks. Fast, transparent, no training required.
          </p>
          <p
            className="text-xs font-mono mb-5"
            style={{ color: 'var(--text-muted)' }}
          >
            H = Raw Score / 1.45
          </p>

          <div className="space-y-3">
            {heuristicRules.map((r, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{
                  background:  r.highlight
                    ? 'rgba(255,59,59,0.12)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: r.highlight
                    ? 'rgba(255,59,59,0.45)'
                    : 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <r.icon
                      size={13}
                      style={{ color: r.highlight ? '#FF6B6B' : '#F4A261' }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text)' }}
                    >
                      {r.rule}
                    </span>
                    {r.highlight && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: 'rgba(255,59,59,0.2)',
                          color:      '#FF6B6B',
                        }}
                      >
                        Highest
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: r.highlight
                        ? 'rgba(255,59,59,0.2)'
                        : 'rgba(244,162,97,0.15)',
                      color: r.highlight ? '#FF6B6B' : '#F4A261',
                    }}
                  >
                    w: {r.weight}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-4 p-3 glass rounded-xl text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span style={{ color: 'var(--text)' }} className="font-semibold">
              Max Raw Score: 1.45
            </span>
            {' '}— sum of all rule weights
          </div>
        </motion.div>

        {/* RF Model */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-safe/20
              flex items-center justify-center">
              <Brain size={20} className="text-safe" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Random Forest Model
            </h3>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            100 decision trees trained on 11,055 URLs.
            Learns subtle patterns no rule can capture.
          </p>

          {/* Feature importance bars */}
          <div className="space-y-4 mb-8">
            {[
              { feat: 'url_length',              imp: 35, color: '#00C896' },
              { feat: 'has_suspicious_keywords', imp: 17, color: '#00B4D8' },
              { feat: 'path_length',             imp: 14, color: '#1565C0' },
              { feat: 'uses_https',              imp: 13, color: '#F4A261' },
              { feat: 'is_typosquatting',        imp:  7, color: '#FF3B3B' },
              { feat: 'subdomain_count',         imp:  5, color: '#00C896' },
              { feat: 'has_ip_address',          imp:  4, color: '#00B4D8' },
              { feat: 'special_chars',           imp:  2, color: '#1565C0' },
            ].map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                    {f.feat}
                  </span>
                  <span className="font-bold" style={{ color: f.color }}>
                    {f.imp}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${f.imp * 2.5}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Three-tier scorer */}
          <h4
            className="text-sm font-bold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Three-Tier Hybrid Scorer
          </h4>
          <div className="space-y-3">
            {tiers.map((t, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border"
                style={{
                  background:  t.bg,
                  borderColor: t.border,
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="text-xs font-bold"
                    style={{ color: t.titleColor }}
                  >
                    {t.tier}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t.condition}
                  </span>
                </div>
                <p
                  className="text-xs font-mono"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.formula}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Formula */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-8 md:p-12 text-center mb-16"
      >
        <h2
          className="text-2xl font-black mb-6"
          style={{ color: 'var(--text)' }}
        >
          The Hybrid <span className="gradient-text">Scoring System</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-4 border"
              style={{ background: t.bg, borderColor: t.border }}
            >
              <div
                className="text-xs font-bold mb-2"
                style={{ color: t.titleColor }}
              >
                {t.tier}
              </div>
              <div
                className="text-sm font-mono"
                style={{ color: 'var(--text)' }}
              >
                {t.formula}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { sym: 'S', label: 'Hybrid Score',   desc: 'Final risk score combining both layers', color: '#00B4D8' },
            { sym: 'M', label: 'ML Score',        desc: 'Random Forest probability output',       color: '#00C896' },
            { sym: 'H', label: 'Heuristic Score', desc: 'Raw Score / 1.45 — normalised',          color: '#F4A261' },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="text-3xl font-black mb-1"
                style={{ color: item.color }}
              >
                {item.sym}
              </div>
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--text)' }}
              >
                {item.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <div>
        <h2
          className="text-2xl font-black text-center mb-8"
          style={{ color: 'var(--text)' }}
        >
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((item, i) => (
            <FAQ key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}