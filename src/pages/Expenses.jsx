import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit3, TrendingUp, TrendingDown, PieChart, Calendar, Search, X, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../App'

const CAT_KEYS = ['food', 'transport', 'housing', 'leisure', 'shopping', 'health', 'education', 'other']
const CAT_ICONS = ['🍔', '🚗', '🏠', '🎮', '🛍️', '💊', '📚', '📦']
const CAT_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#6366f1', '#6b7280']

const loadExpenses = () => { try { return JSON.parse(localStorage.getItem('nexus_expenses_v3')) || [] } catch { return [] } }
const loadBudgets = () => { try { return JSON.parse(localStorage.getItem('nexus_budgets_v3')) || [300, 200, 800, 150, 200, 100, 100, 100] } catch { return [300, 200, 800, 150, 200, 100, 100, 100] } }
const saveExpenses = (e) => localStorage.setItem('nexus_expenses_v3', JSON.stringify(e))
const saveBudgets = (b) => localStorage.setItem('nexus_budgets_v3', JSON.stringify(b))

export default function Expenses() {
  const { tr, lang } = useLang()
  const [expenses, setExpenses] = useState(loadExpenses)
  const [budgets, setBudgets] = useState(loadBudgets)
  const [filter, setFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth())
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editExp, setEditExp] = useState(null)
  const [showBudgets, setShowBudgets] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [newAmount, setNewAmount] = useState('')
  const [newCat, setNewCat] = useState(0)
  const [newNote, setNewNote] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newType, setNewType] = useState('expense')
  const inputRef = useRef(null)

  useEffect(() => { saveExpenses(expenses) }, [expenses])
  useEffect(() => { saveBudgets(budgets) }, [budgets])
  useEffect(() => { if (showAdd && inputRef.current) inputRef.current.focus() }, [showAdd])

  const addExp = () => {
    if (!newAmount || parseFloat(newAmount) <= 0) return
    setExpenses(prev => [{ id: Date.now(), amount: parseFloat(newAmount), category: newCat, note: newNote.trim(), date: newDate, type: newType }, ...prev])
    resetForm()
  }

  const resetForm = () => { setNewAmount(''); setNewCat(0); setNewNote(''); setNewDate(new Date().toISOString().split('T')[0]); setNewType('expense'); setShowAdd(false); setEditExp(null) }

  const startEdit = (exp) => { setEditExp(exp); setNewAmount(exp.amount.toString()); setNewCat(exp.category); setNewNote(exp.note); setNewDate(exp.date); setNewType(exp.type); setShowAdd(true) }

  const saveEdit = () => {
    if (!newAmount || !editExp) return
    setExpenses(prev => prev.map(e => e.id === editExp.id ? { ...e, amount: parseFloat(newAmount), category: newCat, note: newNote.trim(), date: newDate, type: newType } : e))
    resetForm()
  }

  const filtered = expenses.filter(e => {
    const d = new Date(e.date)
    if (d.getMonth() !== monthFilter || d.getFullYear() !== yearFilter) return false
    if (filter !== 'all' && e.type !== filter) return false
    if (search && !e.note.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const monthExp = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === monthFilter && d.getFullYear() === yearFilter && e.type === 'expense' })
  const monthInc = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === monthFilter && d.getFullYear() === yearFilter && e.type === 'income' })
  const totalExp = monthExp.reduce((s, e) => s + e.amount, 0)
  const totalInc = monthInc.reduce((s, e) => s + e.amount, 0)
  const balance = totalInc - totalExp

  const catSpend = CAT_KEYS.map((_, i) => ({
    key: CAT_KEYS[i], icon: CAT_ICONS[i], color: CAT_COLORS[i], name: tr[CAT_KEYS[i]],
    spent: monthExp.filter(e => e.category === i).reduce((s, e) => s + e.amount, 0),
    budget: budgets[i] || 0,
  }))

  const dailySpending = {}
  monthExp.forEach(e => { const day = new Date(e.date).getDate(); dailySpending[day] = (dailySpending[day] || 0) + e.amount })

  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(yearFilter, monthFilter - i, 1)
    const m = d.getMonth(); const y = d.getFullYear()
    const mE = expenses.filter(e => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y && e.type === 'expense' }).reduce((s, e) => s + e.amount, 0)
    const mI = expenses.filter(e => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y && e.type === 'income' }).reduce((s, e) => s + e.amount, 0)
    monthlyData.push({ month: tr.months[m], expenses: mE, income: mI })
  }
  const maxBar = Math.max(...monthlyData.map(d => Math.max(d.expenses, d.income)), 1)

  const locale = lang === 'ar' ? 'ar-SA' : 'de-DE'
  const currFormat = (v) => v.toLocaleString(locale, { style: 'currency', currency: 'EUR' })
  const dateFormat = (d) => new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short' })

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1e1e2a]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-xl bg-[#111118] border border-[#1e1e2a] hover:bg-[#1a1a24] transition-all">
              <ArrowLeft size={18} className={`text-white ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet size={22} className="text-[#ec4899]" /> {tr.expenses}
              </h1>
              <p className="text-xs text-[#6b7280]">{tr.months[monthFilter]} {yearFilter}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowBudgets(!showBudgets)} className="p-2 rounded-xl border border-[#1e1e2a] text-[#6b7280] hover:text-white hover:bg-[#111118] transition-all">
              <PieChart size={18} />
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setShowAdd(true) }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f59e0b] text-white font-medium text-sm flex items-center gap-2">
              <Plus size={16} /> {tr.new}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Month Nav */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => { if (monthFilter === 0) { setMonthFilter(11); setYearFilter(y => y - 1) } else setMonthFilter(m => m - 1) }}
            className={`p-2 rounded-xl border border-[#1e1e2a] text-[#6b7280] hover:text-white hover:bg-[#111118] transition-all ${lang === 'ar' ? 'rotate-180' : ''}`}>
            <ArrowLeft size={16} />
          </button>
          <span className="text-lg font-bold text-white min-w-[160px] text-center">{tr.months[monthFilter]} {yearFilter}</span>
          <button onClick={() => { if (monthFilter === 11) { setMonthFilter(0); setYearFilter(y => y + 1) } else setMonthFilter(m => m + 1) }}
            className={`p-2 rounded-xl border border-[#1e1e2a] text-[#6b7280] hover:text-white hover:bg-[#111118] transition-all ${lang === 'ar' ? '' : 'rotate-180'}`}>
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: tr.income, value: totalInc, color: '#10b981', icon: <ArrowUpRight size={18} /> },
            { label: tr.totalExpenses, value: totalExp, color: '#ef4444', icon: <ArrowDownRight size={18} /> },
            { label: tr.balance, value: balance, color: balance >= 0 ? '#22c55e' : '#ef4444', icon: <TrendingUp size={18} /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
                <span className="text-sm text-[#6b7280]">{s.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: s.color }}>{currFormat(s.value)}</div>
            </motion.div>
          ))}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[{ key: 'overview', label: tr.overview, icon: <PieChart size={16} /> }, { key: 'list', label: tr.allEntries, icon: <Calendar size={16} /> }, { key: 'chart', label: tr.charts, icon: <TrendingUp size={16} /> }].map(tab => (
            <button key={tab.key} onClick={() => setActiveView(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeView === tab.key ? 'border-[#ec4899] bg-[#ec4899]/10 text-[#ec4899]' : 'border-[#1e1e2a] bg-[#111118] text-[#6b7280] hover:text-white'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
              <h3 className="text-lg font-bold text-white mb-4">{tr.categories}</h3>
              <div className="space-y-3">
                {catSpend.filter(c => c.spent > 0 || c.budget > 0).map((cat, i) => {
                  const pct = cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0
                  const over = cat.spent > cat.budget && cat.budget > 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white flex items-center gap-2"><span>{cat.icon}</span> {cat.name}</span>
                        <span className={`text-sm font-medium ${over ? 'text-[#ef4444]' : 'text-[#6b7280]'}`}>
                          {currFormat(cat.spent)}{cat.budget > 0 && ` / ${cat.budget}€`}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#1e1e2a] overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                          className="h-full rounded-full" style={{ backgroundColor: over ? '#ef4444' : cat.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
              <h3 className="text-lg font-bold text-white mb-4">{tr.monthlyChart}</h3>
              <div className="flex items-end gap-3 h-48">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                      <div className="flex-1 rounded-t-md bg-[#10b981]" style={{ height: `${(d.income / maxBar) * 100}%`, minHeight: d.income > 0 ? 4 : 0 }} />
                      <div className="flex-1 rounded-t-md bg-[#ef4444]" style={{ height: `${(d.expenses / maxBar) * 100}%`, minHeight: d.expenses > 0 ? 4 : 0 }} />
                    </div>
                    <span className="text-[10px] text-[#6b7280]">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <span className="flex items-center gap-1.5 text-xs text-[#6b7280]"><div className="w-3 h-3 rounded-sm bg-[#10b981]" /> {tr.income}</span>
                <span className="flex items-center gap-1.5 text-xs text-[#6b7280]"><div className="w-3 h-3 rounded-sm bg-[#ef4444]" /> {tr.totalExpenses}</span>
              </div>
            </div>
            <div className="md:col-span-2 p-6 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
              <h3 className="text-lg font-bold text-white mb-4">{tr.topExpenses}</h3>
              <div className="space-y-2">
                {monthExp.sort((a, b) => b.amount - a.amount).slice(0, 5).map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CAT_ICONS[e.category]}</span>
                      <div>
                        <span className="text-sm text-white font-medium">{e.note || tr[CAT_KEYS[e.category]]}</span>
                        <span className="text-xs text-[#6b7280] block">{dateFormat(e.date)}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#ef4444]">-{currFormat(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-[#6b7280] ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={tr.search}
                  className={`w-full py-2.5 rounded-xl bg-[#111118] border border-[#1e1e2a] text-white placeholder-[#6b7280] focus:outline-none focus:border-[#ec4899] transition-colors text-sm ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
              </div>
              <div className="flex rounded-xl border border-[#1e1e2a] overflow-hidden">
                {[{ key: 'all', label: tr.open2 }, { key: 'expense', label: tr.totalExpenses }, { key: 'income', label: tr.income }].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 text-sm font-medium transition-all ${filter === f.key ? 'bg-[#ec4899] text-white' : 'bg-[#111118] text-[#6b7280] hover:text-white'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-[#6b7280]">
                    <div className="text-4xl mb-4">💰</div>
                    <p>{tr.noTasks}</p>
                  </motion.div>
                ) : filtered.map((exp, i) => (
                  <motion.div key={exp.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.02 }}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-[#1e1e2a] bg-[#111118] hover:border-[#2a2a3a] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${CAT_COLORS[exp.category]}15` }}>{CAT_ICONS[exp.category]}</div>
                      <div>
                        <div className="font-medium text-white text-sm">{exp.note || tr[CAT_KEYS[exp.category]]}</div>
                        <div className="text-xs text-[#6b7280] flex items-center gap-2">
                          <span>{tr[CAT_KEYS[exp.category]]}</span><span>·</span><span>{dateFormat(exp.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm ${exp.type === 'expense' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {exp.type === 'expense' ? '-' : '+'}{currFormat(exp.amount)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(exp)} className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#ec4899] hover:bg-[#ec4899]/10 transition-all"><Edit3 size={13} /></button>
                        <button onClick={() => setExpenses(prev => prev.filter(e => e.id !== exp.id))} className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Chart View */}
        {activeView === 'chart' && (
          <div className="p-6 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
            <h3 className="text-lg font-bold text-white mb-6">{tr.charts} - {tr.months[monthFilter]}</h3>
            <div className="flex items-end gap-1 h-48">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const amount = dailySpending[day] || 0
                const maxD = Math.max(...Object.values(dailySpending), 1)
                return (
                  <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-[#ec4899] to-[#f59e0b]" style={{ height: `${(amount / maxD) * 100}%`, minHeight: amount > 0 ? 4 : 0 }} />
                    <span className="text-[9px] text-[#6b7280] mt-1">{day}</span>
                    {amount > 0 && <div className="absolute -top-8 bg-[#1a1a2e] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{currFormat(amount)}</div>}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center text-sm text-[#6b7280]">
              {tr.totalExpenses}: <span className="text-[#ef4444] font-bold">{currFormat(totalExp)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Budget Panel */}
      <AnimatePresence>
        {showBudgets && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowBudgets(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#111118] border border-[#1e1e2a] rounded-3xl p-8 shadow-2xl">
              <button onClick={() => setShowBudgets(false)} className="absolute top-4 right-4 text-[#6b7280] hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-bold text-white mb-6">{tr.budgets}</h3>
              <div className="space-y-4">
                {CAT_KEYS.map((key, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl w-8">{CAT_ICONS[i]}</span>
                    <span className="text-sm text-white flex-1">{tr[key]}</span>
                    <div className="flex items-center gap-1">
                      <input type="number" value={budgets[i]} onChange={e => { const n = [...budgets]; n[i] = parseInt(e.target.value) || 0; setBudgets(n) }}
                        className="w-20 px-2 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#1e1e2a] text-white text-sm text-right focus:outline-none focus:border-[#ec4899]" />
                      <span className="text-xs text-[#6b7280]">€</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowBudgets(false)} className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f59e0b] text-white font-medium">{tr.save}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#111118] border border-[#1e1e2a] rounded-3xl p-8 shadow-2xl">
              <button onClick={resetForm} className="absolute top-4 right-4 text-[#6b7280] hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-bold text-white mb-6">{editExp ? tr.editEntry : tr.addEntry}</h3>
              <div className="space-y-4">
                <div className="flex rounded-xl border border-[#1e1e2a] overflow-hidden">
                  <button onClick={() => setNewType('expense')} className={`flex-1 py-3 text-sm font-medium transition-all ${newType === 'expense' ? 'bg-[#ef4444] text-white' : 'bg-[#0a0a0f] text-[#6b7280]'}`}>{tr.totalExpenses}</button>
                  <button onClick={() => setNewType('income')} className={`flex-1 py-3 text-sm font-medium transition-all ${newType === 'income' ? 'bg-[#22c55e] text-white' : 'bg-[#0a0a0f] text-[#6b7280]'}`}>{tr.income}</button>
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1">{tr.amount}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] text-lg">€</span>
                    <input ref={inputRef} type="number" step="0.01" min="0" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a] text-white text-2xl font-bold placeholder-[#4a4a5a] focus:outline-none focus:border-[#ec4899] transition-colors"
                      onKeyDown={e => e.key === 'Enter' && (editExp ? saveEdit() : addExp())} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1">{tr.category}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CAT_KEYS.map((key, i) => (
                      <button key={i} onClick={() => setNewCat(i)}
                        className={`p-3 rounded-xl text-center transition-all border ${newCat === i ? 'border-[#ec4899] bg-[#ec4899]/10' : 'border-[#1e1e2a] bg-[#0a0a0f] hover:border-[#2a2a3a]'}`}>
                        <span className="text-xl block">{CAT_ICONS[i]}</span>
                        <span className="text-[10px] text-[#6b7280] block mt-1">{tr[key]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-1">{tr.date}</label>
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a] text-white focus:outline-none focus:border-[#ec4899] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-1">{tr.note}</label>
                    <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={tr.notePlaceholder}
                      className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a] text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#ec4899] transition-colors" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={resetForm} className="flex-1 py-3 rounded-xl border border-[#1e1e2a] text-[#6b7280] font-medium hover:bg-[#1a1a24] transition-all">{tr.cancel}</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={editExp ? saveEdit : addExp}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f59e0b] text-white font-medium">
                    {editExp ? tr.save : tr.add}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
