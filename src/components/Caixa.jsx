import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { fmt } from '../calc'

const CATEGORIAS_ENTRADA = ['Venda de peça', 'Comissão', 'Outro']
const CATEGORIAS_SAIDA = ['Resina', 'Equipamento', 'Material de acabamento', 'Manutenção', 'Embalagem', 'Outro']

const EMPTY = { descricao: '', valor: '', categoria: '', data: new Date().toISOString().slice(0, 10), observacao: '' }

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function mesAno(iso) {
  const d = new Date(iso + 'T12:00:00')
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`
}

export default function Caixa() {
  const { lancamentos, addLancamento, deletarLancamento } = useStore()
  const [tipo, setTipo] = useState('entrada')
  const [form, setForm] = useState({ ...EMPTY, categoria: CATEGORIAS_ENTRADA[0] })
  const [filtroMes, setFiltroMes] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  function handle(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function changeTipo(t) {
    setTipo(t)
    setForm({ ...EMPTY, categoria: t === 'entrada' ? CATEGORIAS_ENTRADA[0] : CATEGORIAS_SAIDA[0] })
  }

  function salvar() {
    if (!form.descricao || !form.valor || !form.data) return
    addLancamento({
      id: crypto.randomUUID(),
      tipo,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      data: form.data,
      observacao: form.observacao,
    })
    setForm({ ...EMPTY, categoria: tipo === 'entrada' ? CATEGORIAS_ENTRADA[0] : CATEGORIAS_SAIDA[0] })
  }

  // meses disponíveis para filtro
  const mesesDisponiveis = useMemo(() => {
    const set = new Set(lancamentos.map(l => mesAno(l.data)))
    return ['todos', ...Array.from(set).reverse()]
  }, [lancamentos])

  const lancamentosFiltrados = useMemo(() => {
    return lancamentos.filter(l => {
      const mesOk = filtroMes === 'todos' || mesAno(l.data) === filtroMes
      const tipoOk = filtroTipo === 'todos' || l.tipo === filtroTipo
      return mesOk && tipoOk
    }).sort((a, b) => b.data.localeCompare(a.data))
  }, [lancamentos, filtroMes, filtroTipo])

  const totalEntradas = lancamentosFiltrados.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const totalSaidas = lancamentosFiltrados.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
  const saldo = totalEntradas - totalSaidas

  // agrupamento por categoria para o resumo
  const porCategoria = useMemo(() => {
    const map = {}
    lancamentosFiltrados.forEach(l => {
      if (!map[l.categoria]) map[l.categoria] = { tipo: l.tipo, total: 0 }
      map[l.categoria].total += l.valor
    })
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total)
  }, [lancamentosFiltrados])

  return (
    <div className="page">
      <h2>Controle de Caixa</h2>

      {/* Resumo */}
      <div className="caixa-resumo">
        <div className="caixa-card verde">
          <span>Entradas</span>
          <strong>{fmt(totalEntradas)}</strong>
        </div>
        <div className="caixa-card vermelho">
          <span>Saídas</span>
          <strong>{fmt(totalSaidas)}</strong>
        </div>
        <div className={`caixa-card ${saldo >= 0 ? 'roxo' : 'vermelho'}`}>
          <span>Saldo</span>
          <strong>{fmt(saldo)}</strong>
        </div>
      </div>

      {/* Novo lançamento */}
      <section className="card">
        <h3>Novo lançamento</h3>
        <div className="tipo-toggle">
          <button className={`toggle-btn ${tipo === 'entrada' ? 'ativo-verde' : ''}`} onClick={() => changeTipo('entrada')}>
            ↑ Entrada
          </button>
          <button className={`toggle-btn ${tipo === 'saida' ? 'ativo-vermelho' : ''}`} onClick={() => changeTipo('saida')}>
            ↓ Saída
          </button>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="campo">
            <label>Descrição</label>
            <input name="descricao" value={form.descricao} onChange={handle} placeholder={tipo === 'entrada' ? 'Ex: Venda Dragão articulado' : 'Ex: Resina cinza 1kg'} />
          </div>
          <div className="campo">
            <label>Valor (R$)</label>
            <input name="valor" type="number" step="0.01" value={form.valor} onChange={handle} />
          </div>
          <div className="campo">
            <label>Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handle}>
              {(tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Data</label>
            <input name="data" type="date" value={form.data} onChange={handle} />
          </div>
          <div className="campo" style={{ gridColumn: '1 / -1' }}>
            <label>Observação <small>(opcional)</small></label>
            <input name="observacao" value={form.observacao} onChange={handle} placeholder="Ex: Pago via Pix" />
          </div>
        </div>
        <div className="row-btns">
          <button className="btn-primary" onClick={salvar} disabled={!form.descricao || !form.valor}>
            Registrar {tipo === 'entrada' ? 'entrada' : 'saída'}
          </button>
        </div>
      </section>

      {/* Filtros + extrato */}
      {lancamentos.length > 0 && (
        <section className="card">
          <h3>Extrato</h3>
          <div className="caixa-filtros">
            <div className="campo">
              <label>Período</label>
              <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                {mesesDisponiveis.map(m => <option key={m} value={m}>{m === 'todos' ? 'Todos os meses' : m}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Tipo</label>
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
            </div>
          </div>

          {lancamentosFiltrados.length === 0 ? (
            <p className="hint" style={{ marginTop: 12 }}>Nenhum lançamento no período.</p>
          ) : (
            <table className="tabela" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lancamentosFiltrados.map(l => (
                  <tr key={l.id}>
                    <td className="text-dim">{new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>
                      {l.descricao}
                      {l.observacao && <span className="text-dim" style={{ display: 'block', fontSize: 11 }}>{l.observacao}</span>}
                    </td>
                    <td><span className="badge-cat">{l.categoria}</span></td>
                    <td className={l.tipo === 'entrada' ? 'valor-verde' : 'valor-vermelho'}>
                      {l.tipo === 'entrada' ? '+' : '-'}{fmt(l.valor)}
                    </td>
                    <td><button className="btn-danger sm" onClick={() => deletarLancamento(l.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Resumo por categoria */}
      {porCategoria.length > 0 && (
        <section className="card">
          <h3>Por categoria</h3>
          <div className="cat-grid">
            {porCategoria.map(([cat, { tipo: t, total }]) => (
              <div key={cat} className="cat-item">
                <span>{cat}</span>
                <strong className={t === 'entrada' ? 'valor-verde' : 'valor-vermelho'}>{fmt(total)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
