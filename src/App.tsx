import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import Agenda from './routes/Agenda'
import Spike from './routes/Spike'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Agend<span className="text-indigo-600">.AI</span>
          </Link>
          <nav className="text-sm text-gray-500">
            <Link to="/" className="hover:text-indigo-600 mr-4">Agenda</Link>
            <Link to="/spike" className="hover:text-indigo-600">⚡ Spike</Link>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Agenda />} />
            <Route path="/spike" element={<Spike />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
