import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { calcular, fmt, fmtPct } from '../calc'
import ResultadoCotacao from './ResultadoCotacao'

const ATIVIDADES = [
  { key: 'horasPreparacao', label: 'Preparação da impressão' },
  { key: 'horasRemocaoSuportes', label: 'Remoção de suportes' },
  { key: 'horasLimpezaCura', label: 'Limpeza e cura' },
  { key: 'horasLixamento', label: 'Lixamento' },
  { key: 'horasPrimer', label: 'Aplicação de primer' },
  { key: 'horasPintura', label: 'Pintura' },
  { key: 'horasMontagem', label: 'Montagem' },
  { key: 'horasEmbalagem', label: 'Acabamento e embalagem' },
]

const EMPTY_FORM = {
  nome: '',
  pesoGramas: '',
  horasImpressao: '',
  percentualFalhas: '',
  margemLucro: '',
  taxasVenda: '',
  horasPreparacao: '',
  horasRemocaoSuportes: '',
  horasLimpezaCura: '',
  horasLixamento: '',
  horasPrimer: '',
  horasPintura: '',
  horasMontagem: '',
  horasEmbalagem: '',
}

export default function NovaCotacao({ onSalva }) {
  const { config, materiais, salvarCotacao } = useStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [matSel, setMatSel] = useState([]) // [{id, qtdUsada}]
  const [salvo, setSalvo] = useState(false)

  function handle(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function n(v, fallback = 0) {
    const p = parseFloat(v)
    return isNaN(p) ? fallback : p
  }

  const horasAcabamento = useMemo(() =>
    ATIVIDADES.filter(a => a.key !== 'horasPreparacao')
      .reduce((s, a) => s + n(form[a.key]), 0),
    [form]
  )

  const materiaisUsados = useMemo(() =>
    matSel.map(ms => {
      const mat = materiais.find(m => m.id === ms.id)
      return mat ? { ...mat, qtdUsada: ms.qtdUsada } : null
    }).filter(Boolean),
    [matSel, materiais]
  )

  const entrada = useMemo(() => ({
    pesoGramas: n(form.pesoGramas),
    horasImpressao: n(form.horasImpressao),
    percentualFalhas: form.percentualFalhas !== '' ? n(form.percentualFalhas) : config.percentualFalhas,
    horasPreparacao: n(form.horasPreparacao) + horasAcabamento,
    horasAcabamento: 0,
    materiaisUsados,
    margemLucro: form.margemLucro !== '' ? n(form.margemLucro) : config.margemLucro,
    taxasVenda: form.taxasVenda !== '' ? n(form.taxasVenda) : config.taxasVenda,
  }), [form, config, horasAcabamento, materiaisUsados])

  const resultado = useMemo(() => {
    if (!entrada.pesoGramas || !entrada.horasImpressao) return null
    return calcular(entrada, config)
  }, [entrada, config])

  function addMaterial(id) {
    if (!id || matSel.find(m => m.id === id)) return
    setMatSel(prev => [...prev, { id, qtdUsada: 0 }])
  }

  function updateQtd(id, qtd) {
    setMatSel(prev => prev.map(m => m.id === id ? { ...m, qtdUsada: parseFloat(qtd) || 0 } : m))
  }

  function removeMaterial(id) {
    setMatSel(prev => prev.filter(m => m.id !== id))
  }

  function salvar() {
    if (!resultado || !form.nome) return
    const cotacao = {
      id: crypto.randomUUID(),
      criadaEm: new Date().toISOString(),
      nome: form.nome,
      entrada,
      resultado,
      configSnapshot: { ...config },
    }
    salvarCotacao(cotacao)
    setSalvo(true)
    setForm(EMPTY_FORM)
    setMatSel([])
    setTimeout(() => setSalvo(false), 3000)
    onSalva?.()
  }

  return (
    <div className="page">
      <h2>Nova Cotação</h2>

      <section className="card">
        <h3>Dados da peça</h3>
        <div className="grid-2">
          <div className="campo">
            <label>Nome da escultura</label>
            <input name="nome" value={form.nome} onChange={handle} placeholder="Ex: Dragão articulado" />
          </div>
          <div className="campo">
            <label>Peso total (g) <small>incluindo suportes</small></label>
            <input name="pesoGramas" type="number" step="1" value={form.pesoGramas} onChange={handle} />
          </div>
          <div className="campo">
            <label>Tempo de impressão (h)</label>
            <input name="horasImpressao" type="number" step="0.5" value={form.horasImpressao} onChange={handle} />
          </div>
          <div className="campo">
            <label>Falhas (%) <small>padrão: {config.percentualFalhas}%</small></label>
            <input name="percentualFalhas" type="number" step="1" value={form.percentualFalhas} onChange={handle} placeholder={config.percentualFalhas} />
          </div>
          <div className="campo">
            <label>Margem de lucro (%) <small>padrão: {config.margemLucro}%</small></label>
            <input name="margemLucro" type="number" step="1" value={form.margemLucro} onChange={handle} placeholder={config.margemLucro} />
          </div>
          <div className="campo">
            <label>Taxas de venda (%) <small>padrão: {config.taxasVenda}%</small></label>
            <input name="taxasVenda" type="number" step="1" value={form.taxasVenda} onChange={handle} placeholder={config.taxasVenda} />
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Mão de obra</h3>
        <p className="hint">Valor da hora: {fmt(config.valorHoraTrabalho)} — não inclua o tempo de impressão automática</p>
        <div className="grid-2">
          {ATIVIDADES.map(a => (
            <div className="campo" key={a.key}>
              <label>{a.label} (h)</label>
              <input name={a.key} type="number" step="0.25" value={form[a.key]} onChange={handle} placeholder="0" />
            </div>
          ))}
        </div>
        <p className="hint">Total mão de obra: <strong>{(n(form.horasPreparacao) + horasAcabamento).toFixed(2)}h</strong></p>
      </section>

      <section className="card">
        <h3>Materiais de acabamento</h3>
        {materiais.length === 0 ? (
          <p className="hint">Nenhum material cadastrado. Vá em "Materiais" para adicionar.</p>
        ) : (
          <>
            <div className="campo">
              <label>Adicionar material</label>
              <select onChange={e => { addMaterial(e.target.value); e.target.value = '' }} defaultValue="">
                <option value="" disabled>Selecione...</option>
                {materiais.filter(m => !matSel.find(s => s.id === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.nome} ({m.unidade})</option>
                ))}
              </select>
            </div>
            {matSel.length > 0 && (
              <table className="tabela">
                <thead>
                  <tr><th>Material</th><th>Qtd usada</th><th>Custo</th><th></th></tr>
                </thead>
                <tbody>
                  {matSel.map(ms => {
                    const mat = materiais.find(m => m.id === ms.id)
                    if (!mat) return null
                    const custo = (ms.qtdUsada * mat.precoCompra / mat.qtdEmbalagem)
                    return (
                      <tr key={ms.id}>
                        <td>{mat.nome}</td>
                        <td>
                          <div className="input-wrap">
                            <input type="number" step="0.1" value={ms.qtdUsada} onChange={e => updateQtd(ms.id, e.target.value)} style={{ width: 80 }} />
                            <span className="suffix">{mat.unidade}</span>
                          </div>
                        </td>
                        <td>{fmt(custo)}</td>
                        <td><button className="btn-danger sm" onClick={() => removeMaterial(ms.id)}>✕</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>

      {resultado && <ResultadoCotacao resultado={resultado} nome={form.nome} entrada={entrada} config={config} />}

      <div className="row-btns" style={{ marginTop: 16 }}>
        <button className="btn-primary" onClick={salvar} disabled={!resultado || !form.nome}>
          Salvar cotação
        </button>
        {salvo && <span className="badge-ok">✓ Cotação salva!</span>}
      </div>
    </div>
  )
}
