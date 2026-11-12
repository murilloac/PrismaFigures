import { useState, useEffect, createContext, useContext } from 'react'

const DEFAULT_CONFIG = {
  precoResinaKg: 105,
  precoResinaGrama: 0.105,
  percentualFalhas: 15,
  custoKwh: 1.20,
  potenciaImpressora: 100,
  valorImpressora: 2000,
  vidaUtilHoras: 2000,
  depreciacaoPorHora: 1.00,
  manutencaoPorHora: 0.50,
  remuneracaoMensal: 4000,
  horasProdutivas: 100,
  valorHoraTrabalho: 40,
  margemLucro: 30,
  taxasVenda: 5,
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [config, setConfigRaw] = useState(() => load('pf_config', DEFAULT_CONFIG))
  const [materiais, setMateriaisRaw] = useState(() => load('pf_materiais', []))
  const [cotacoes, setCotacoesRaw] = useState(() => load('pf_cotacoes', []))
  const [lancamentos, setLancamentosRaw] = useState(() => load('pf_lancamentos', []))

  function setConfig(v) {
    const next = typeof v === 'function' ? v(config) : v
    setConfigRaw(next)
    save('pf_config', next)
  }

  function setMateriais(v) {
    const next = typeof v === 'function' ? v(materiais) : v
    setMateriaisRaw(next)
    save('pf_materiais', next)
  }

  function setCotacoes(v) {
    const next = typeof v === 'function' ? v(cotacoes) : v
    setCotacoesRaw(next)
    save('pf_cotacoes', next)
  }

  function salvarCotacao(cotacao) {
    setCotacoes(prev => [cotacao, ...prev])
  }

  function deletarCotacao(id) {
    setCotacoes(prev => prev.filter(c => c.id !== id))
  }

  function setLancamentos(v) {
    const next = typeof v === 'function' ? v(lancamentos) : v
    setLancamentosRaw(next)
    save('pf_lancamentos', next)
  }

  function addLancamento(l) {
    setLancamentos(prev => [l, ...prev])
  }

  function deletarLancamento(id) {
    setLancamentos(prev => prev.filter(l => l.id !== id))
  }

  return (
    <Ctx.Provider value={{ config, setConfig, materiais, setMateriais, cotacoes, salvarCotacao, deletarCotacao, lancamentos, addLancamento, deletarLancamento }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  return useContext(Ctx)
}
