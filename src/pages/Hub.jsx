import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, DollarSign, ArrowRight, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLang } from '../App'

const apps = [
  { key: 'tasks', path: '/aufgaben', icon: <CheckSquare size={32} />, gradient: 'from-[#8b5cf6] to-[#06b6d4]', color: '#8b5cf6' },
  { key: 'expenses', path: '/ausgaben', icon: <DollarSign size={32} />, gradient: 'from-[#ec4899] to-[#f59e0b]', color: '#ec4899' },
]

export default function Hub() {
  const [time, setTime] = useState(new Date())
  const { tr, lang } = useLang()

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[150px]" />

      {[...Array(20)].map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981'][i % 4], left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <div className="text-6xl md:text-8xl font-black tracking-tighter">
          <span className="bg-gradient-to-r from-[#8b5cf6] via-[#06b6d4] to-[#ec4899] bg-clip-text text-transparent">
            {time.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <div className="text-[#6b7280] text-lg mt-2">
          {time.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">{tr.title}</span>
          </h1>
        </div>
        <p className="text-[#6b7280] text-lg">{tr.welcome}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mb-12">
        {apps.map((app, i) => (
          <motion.div key={app.path} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
            <Link to={app.path} className="block group">
              <div className={`relative p-8 rounded-3xl border border-[#1e1e2a] bg-[#111118] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
                style={{ borderColor: undefined }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {app.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{tr[app.key]}</h2>
                  <div className="flex items-center gap-2 font-semibold mt-4" style={{ color: app.color }}>
                    {tr.open} <ArrowRight size={18} className={`group-hover:translate-x-2 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="flex items-center gap-8 px-8 py-4 rounded-2xl border border-[#1e1e2a] bg-[#111118]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-sm text-[#6b7280]">Online</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="px-4 py-2 rounded-xl bg-[#111118] border border-[#1e1e2a] hover:bg-[#1a1a24] transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="text-sm text-[#6b7280]">{tr.logOut || tr.logout || 'Logout'}</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
