import { useState } from 'react'
import { StoreProvider } from './store'
import Configuracoes from './components/Configuracoes'
import Materiais from './components/Materiais'
import NovaCotacao from './components/NovaCotacao'
import Historico from './components/Historico'
import Caixa from './components/Caixa'

const ABAS = [
  { id: 'cotacao', label: '+ Nova Cotação' },
  { id: 'historico', label: 'Histórico' },
  { id: 'caixa', label: 'Caixa' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'config', label: 'Configurações' },
]

function AppInner() {
  const [aba, setAba] = useState('cotacao')

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Prisma Figures" className="logo-img" />
        </div>
        <nav className="nav">
          {ABAS.map(a => (
            <button
              key={a.id}
              className={`nav-btn ${aba === a.id ? 'ativo' : ''}`}
              onClick={() => setAba(a.id)}
            >
              {a.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {aba === 'cotacao' && <NovaCotacao onSalva={() => {}} />}
        {aba === 'historico' && <Historico />}
        {aba === 'caixa' && <Caixa />}
        {aba === 'materiais' && <Materiais />}
        {aba === 'config' && <Configuracoes />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
