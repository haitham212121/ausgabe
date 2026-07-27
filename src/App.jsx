import { HashRouter, Routes, Route } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import Hub from './pages/Hub'
import TaskManager from './pages/TaskManager'
import Expenses from './pages/Expenses'
import { getLanguage, t } from './i18n/translations'

export const LangContext = createContext()
export function useLang() { return useContext(LangContext) }

function App() {
  const [lang, setLang] = useState(getLanguage)
  const tr = t(lang)

  return (
    <LangContext.Provider value={{ lang, tr, setLang }}>
      <HashRouter>
        <div dir={tr.dir} className="min-h-screen bg-[#0a0a0f] text-white">
          <div className="max-w-md mx-auto">
            <Routes>
              <Route path="/" element={<Hub />} />
              <Route path="/aufgaben" element={<TaskManager />} />
              <Route path="/ausgaben" element={<Expenses />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </LangContext.Provider>
  )
}

export default App
