import { motion } from 'framer-motion'
import {
  Shield, User, BookOpen, Cpu,
  Database, Globe, Award, Target
} from 'lucide-react'

const metrics = [
  { label: 'Accuracy',  value: '99.91%', color: '#00C896', desc: 'Overall classification accuracy' },
  { label: 'Precision', value: '100%',   color: '#00B4D8', desc: 'Zero false positives on test set' },
  { label: 'Recall',    value: '99.83%', color: '#1565C0', desc: 'Phishing sites correctly caught'  },
  { label: 'F1-Score',  value: '99.92%', color: '#F4A261', desc: 'Harmonic mean of Precision & Recall' },
]

const techStack = [
  { name: 'Python 3.13',    role: 'Backend & ML',         color: 'text-cyan'    },
  { name: 'FastAPI',        role: 'REST API',              color: 'text-primary' },
  { name: 'Random Forest',  role: 'ML Classifier',         color: 'text-warning' },
  { name: 'React + Vite',   role: 'Web Portal',            color: 'text-safe'    },
  { name: 'SQLite',         role: 'Database',              color: 'text-danger'  },
  { name: 'Manifest V3',    role: 'Browser Extension',     color: 'text-muted'   },
]

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 pt-28 pb-20"
    >
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 glass px-4 py-2
          rounded-full mb-6 text-xs text-cyan font-medium">
          <BookOpen size={12} />
          Final Year Research Project
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4">
          About <span className="gradient-text">GwinShield</span>
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          A hybrid phishing website detection system combining heuristic
          analysis and machine learning — built for the Nigerian cybersecurity
          context.
        </p>
      </div>

      {/* Two interface cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: Globe,
            title: 'Web Portal',
            color: 'text-cyan',
            bg: 'bg-cyan/10',
            desc: 'A publicly accessible React web application where any user can manually paste a suspicious URL and receive an instant phishing risk verdict, complete with a hybrid score, heuristic flags, and scan history — no installation required.',
          },
          {
            icon: Shield,
            title: 'Browser Extension',
            color: 'text-primary',
            bg: 'bg-primary/10',
            desc: 'A Manifest V3 cross-browser extension compatible with Chrome, Firefox, and Edge that automatically intercepts every URL visited and checks it in real time, displaying a red warning for phishing sites and a green indicator for safe ones.',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-8"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg}
              ${item.color} flex items-center justify-center mb-5`}>
              <item.icon size={26} />
            </div>
            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Model Performance */}
      <div className="mb-12">
        <h2 className="text-2xl font-black mb-2 text-center">
          Model <span className="gradient-text">Performance</span>
        </h2>
        <p className="text-muted text-center text-sm mb-8">
          Evaluated on UCI Phishing Website Dataset — 11,055 instances
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center group
                hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="text-4xl font-black mb-2"
                style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="text-white font-semibold text-sm mb-1">
                {m.label}
              </div>
              <div className="text-muted text-xs">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-12">
        <h2 className="text-2xl font-black mb-8 text-center">
          Technology <span className="gradient-text">Stack</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-5 flex items-center gap-4
                hover:border-white/20 transition-all duration-300"
            >
              <Cpu size={20} className={t.color} />
              <div>
                <div className="font-semibold text-sm text-white">{t.name}</div>
                <div className="text-xs text-muted">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Research Info + Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Database size={20} className="text-cyan" />
            <h3 className="font-bold text-lg">Research Details</h3>
          </div>
          <div className="space-y-4 text-sm">
            {[
              { label: 'Dataset',     value: 'UCI Phishing Website Dataset' },
              { label: 'Instances',   value: '11,055 URLs' },
              { label: 'Features',    value: '12 URL-based features' },
              { label: 'Algorithm',   value: 'Random Forest (100 estimators)' },
              { label: 'Train Split', value: '80% training / 20% testing' },
              { label: 'Heuristic Rules',   value: '9 rules (max weight 1.45)' },
              { label: 'Hybrid Formula',    value: 'Three-tier scoring system'  },
            ].map((item, i) => (
              <div key={i} className="flex justify-between
                py-2 border-b border-white/5 last:border-0">
                <span className="text-muted">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <User size={20} className="text-cyan" />
            <h3 className="font-bold text-lg">The Developer</h3>
          </div>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br
              from-primary to-cyan flex items-center justify-center
              text-3xl font-black text-white mb-4 glow-blue">
              GD
            </div>
            <h4 className="text-xl font-black gradient-text">
              Chiogbonda Godwins Aruchi
            </h4>
            <p className="text-muted text-sm mt-1">Gwin D</p>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Matric No',   value: 'DE.2022/7432'          },
              { label: 'Department',  value: 'Computer Science'       },
              { label: 'University',  value: 'Rivers State University' },
              { label: 'Supervisor',  value: 'Dr. E.O. Bennett'      },
              { label: 'Year',        value: '2026'                   },
            ].map((item, i) => (
              <div key={i} className="flex justify-between
                py-2 border-b border-white/5 last:border-0">
                <span className="text-muted">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}