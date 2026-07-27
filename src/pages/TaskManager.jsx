import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Check, Trash2, Edit3, Calendar, Search, BarChart3, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../App'

const CAT_KEYS = ['work', 'personal', 'shopping', 'health', 'project', 'learning']
const CAT_ICONS = ['💼', '🏠', '🛒', '❤️', '📁', '📚']
const CAT_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#f59e0b', '#ec4899']

const PRIORITIES = [
  { key: 'low', color: '#22c55e', level: 1 },
  { key: 'medium', color: '#f59e0b', level: 2 },
  { key: 'high', color: '#ef4444', level: 3 },
]

const loadTasks = () => {
  try { return JSON.parse(localStorage.getItem('nexus_tasks_v3')) || [] } catch { return [] }
}
const saveTasks = (tasks) => localStorage.setItem('nexus_tasks_v3', JSON.stringify(tasks))

export default function TaskManager() {
  const { tr, lang } = useLang()
  const [tasks, setTasks] = useState(loadTasks)
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState(0)
  const [newPriority, setNewPriority] = useState(1)
  const [newDue, setNewDue] = useState('')
  const [showStats, setShowStats] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { saveTasks(tasks) }, [tasks])
  useEffect(() => { if (showAdd && inputRef.current) inputRef.current.focus() }, [showAdd])

  const addTask = () => {
    if (!newTitle.trim()) return
    setTasks(prev => [{ id: Date.now(), title: newTitle.trim(), description: newDesc.trim(), category: newCat, priority: newPriority, dueDate: newDue || null, completed: false, createdAt: new Date().toISOString(), completedAt: null }, ...prev])
    resetForm()
  }

  const resetForm = () => { setNewTitle(''); setNewDesc(''); setNewCat(0); setNewPriority(1); setNewDue(''); setShowAdd(false); setEditTask(null) }

  const startEdit = (task) => { setEditTask(task); setNewTitle(task.title); setNewDesc(task.description); setNewCat(task.category); setNewPriority(task.priority); setNewDue(task.dueDate || ''); setShowAdd(true) }

  const saveEdit = () => {
    if (!newTitle.trim() || !editTask) return
    setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, title: newTitle.trim(), description: newDesc.trim(), category: newCat, priority: newPriority, dueDate: newDue || null } : t))
    resetForm()
  }

  const toggleComplete = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t))
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id))

  const filteredTasks = tasks.filter(t => {
    if (filter === 'open' && t.completed) return false
    if (filter === 'done' && !t.completed) return false
    if (catFilter !== 'all' && t.category !== parseInt(catFilter)) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (b.priority !== a.priority) return b.priority - a.priority
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.completed).length
  const openTasks = totalTasks - doneTasks
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => !t.completed && t.dueDate === today).length

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
                <CheckCircle2 size={22} className="text-[#8b5cf6]" />
                {tr.tasks}
              </h1>
              <p className="text-xs text-[#6b7280]">{tr.tasksSub.replace('_open_', openTasks).replace('_done_', doneTasks)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowStats(!showStats)} className="p-2 rounded-xl border border-[#1e1e2a] text-[#6b7280] hover:text-white hover:bg-[#111118] transition-all">
              <BarChart3 size={18} />
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setShowAdd(true) }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-medium text-sm flex items-center gap-2">
              <Plus size={16} /> {tr.new}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: tr.openFilter, value: openTasks, color: '#8b5cf6', icon: <Clock size={18} /> },
            { label: tr.done, value: doneTasks, color: '#22c55e', icon: <CheckCircle2 size={18} /> },
            { label: '!', value: overdueTasks, color: '#ef4444', icon: <AlertCircle size={18} /> },
            { label: tr.month, value: todayTasks, color: '#f59e0b', icon: <Calendar size={18} /> },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
              <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                {stat.icon}
                <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 p-4 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6b7280]">{tr.overview}</span>
            <span className="text-sm font-bold text-[#8b5cf6]">{progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#1e1e2a] overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]" />
          </div>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 overflow-hidden">
              <div className="p-6 rounded-2xl border border-[#1e1e2a] bg-[#111118]">
                <h3 className="text-lg font-bold text-white mb-4">{tr.categories}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CAT_KEYS.map((key, i) => {
                    const total = tasks.filter(t => t.category === i).length
                    const done = tasks.filter(t => t.category === i && t.completed).length
                    return (
                      <div key={i} className="p-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a]">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{CAT_ICONS[i]}</span>
                          <span className="text-sm text-white">{tr[key]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-[#1e1e2a] overflow-hidden">
                            <div className="h-full rounded-full" style={{ backgroundColor: CAT_COLORS[i], width: total > 0 ? `${(done / total) * 100}%` : '0%' }} />
                          </div>
                          <span className="text-xs text-[#6b7280]">{done}/{total}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-[#6b7280] ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={tr.search}
              className={`w-full py-2.5 rounded-xl bg-[#111118] border border-[#1e1e2a] text-white placeholder-[#6b7280] focus:outline-none focus:border-[#8b5cf6] transition-colors text-sm ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
          </div>
          <div className="flex rounded-xl border border-[#1e1e2a] overflow-hidden">
            {[{ key: 'all', label: tr.open2 }, { key: 'open', label: tr.openFilter }, { key: 'done', label: tr.done }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 text-sm font-medium transition-all ${filter === f.key ? 'bg-[#8b5cf6] text-white' : 'bg-[#111118] text-[#6b7280] hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[#111118] border border-[#1e1e2a] text-white text-sm focus:outline-none focus:border-[#8b5cf6] appearance-none cursor-pointer">
            <option value="all">{tr.allCategories}</option>
            {CAT_KEYS.map((key, i) => <option key={i} value={i}>{CAT_ICONS[i]} {tr[key]}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-[#6b7280]">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-lg">{tr.noTasks}</p>
                <p className="text-sm mt-1">{tr.noTasksSub}</p>
              </motion.div>
            ) : filteredTasks.map((task, i) => (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.02 }}
                className={`group p-4 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-[#111118]/50 border-[#1e1e2a]/50 opacity-60' : 'bg-[#111118] border-[#1e1e2a] hover:border-[#2a2a3a]'}`}>
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleComplete(task.id)}
                    className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-[#22c55e] border-[#22c55e]' : 'border-[#3a3a4a] hover:border-[#8b5cf6]'}`}>
                    {task.completed && <Check size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${task.completed ? 'line-through text-[#6b7280]' : 'text-white'}`}>{task.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIORITIES[task.priority - 1].color}15`, color: PRIORITIES[task.priority - 1].color }}>
                        {tr[PRIORITIES[task.priority - 1].key]}
                      </span>
                    </div>
                    {task.description && <p className={`text-sm mb-2 ${task.completed ? 'text-[#4a4a5a]' : 'text-[#6b7280]'}`}>{task.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                      <span className="flex items-center gap-1" style={{ color: CAT_COLORS[task.category] }}>
                        {CAT_ICONS[task.category]} {tr[CAT_KEYS[task.category]]}
                      </span>
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-[#ef4444]' : ''}`}>
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(task)} className="p-2 rounded-lg text-[#6b7280] hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-2 rounded-lg text-[#6b7280] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#111118] border border-[#1e1e2a] rounded-3xl p-8 shadow-2xl">
              <button onClick={resetForm} className="absolute top-4 right-4 text-[#6b7280] hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-bold text-white mb-6">{editTask ? tr.editTask : tr.newTask}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1">{tr.title2}</label>
                  <input ref={inputRef} type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={tr.titlePlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a] text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    onKeyDown={e => e.key === 'Enter' && (editTask ? saveEdit() : addTask())} />
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1">{tr.description}</label>
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder={tr.descPlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a] text-white placeholder-[#4a4a5a] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-1">{tr.category}</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CAT_KEYS.map((key, i) => (
                        <button key={i} onClick={() => setNewCat(i)}
                          className={`p-2 rounded-lg text-center text-xs transition-all border ${newCat === i ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-white' : 'border-[#1e1e2a] bg-[#0a0a0f] text-[#6b7280] hover:border-[#2a2a3a]'}`}>
                          <span className="block text-lg">{CAT_ICONS[i]}</span>
                          <span className="block mt-0.5 truncate">{tr[key]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#6b7280] mb-1">{tr.priority}</label>
                    <div className="space-y-1.5">
                      {PRIORITIES.map((p, i) => (
                        <button key={i} onClick={() => setNewPriority(p.level)}
                          className={`w-full p-2.5 rounded-lg text-left text-sm flex items-center gap-2 transition-all border ${newPriority === p.level ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-white' : 'border-[#1e1e2a] bg-[#0a0a0f] text-[#6b7280] hover:border-[#2a2a3a]'}`}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                          {tr[p.key]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#6b7280] mb-1">{tr.dueDate}</label>
                  <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#1e1e2a] text-white focus:outline-none focus:border-[#8b5cf6] transition-colors" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={resetForm} className="flex-1 py-3 rounded-xl border border-[#1e1e2a] text-[#6b7280] font-medium hover:bg-[#1a1a24] transition-all">{tr.cancel}</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={editTask ? saveEdit : addTask}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-medium">
                    {editTask ? tr.save : tr.add}
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
