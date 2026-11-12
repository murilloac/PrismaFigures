import { useState } from 'react'
import { useStore } from '../store'
import { fmt, fmtPct } from '../calc'
import ResultadoCotacao from './ResultadoCotacao'

export default function Historico() {
  const { cotacoes, deletarCotacao } = useStore()
  const [aberta, setAberta] = useState(null)

  if (cotacoes.length === 0) {
    return (
      <div className="page">
        <h2>Histórico</h2>
        <p className="hint">Nenhuma cotação salva ainda.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>Histórico de Cotações</h2>

      {cotacoes.map(c => (
        <section key={c.id} className="card">
          <div className="historico-header">
            <div>
              <strong>{c.nome}</strong>
              <span className="hint" style={{ marginLeft: 12 }}>
                {new Date(c.criadaEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="acoes">
              <span className="badge-preco">{fmt(c.resultado.precoRecomendado)}</span>
              <button className="btn-ghost sm" onClick={() => setAberta(aberta === c.id ? null : c.id)}>
                {aberta === c.id ? 'Fechar' : 'Ver detalhes'}
              </button>
              <button className="btn-danger sm" onClick={() => deletarCotacao(c.id)}>Excluir</button>
            </div>
          </div>

          {aberta === c.id && (
            <div style={{ marginTop: 16 }}>
              <div className="grid-resumo">
                <div><span>Custo total</span><strong>{fmt(c.resultado.custoTotal)}</strong></div>
                <div><span>Lucro estimado</span><strong>{fmt(c.resultado.lucroEstimado)}</strong></div>
                <div><span>Margem efetiva</span><strong>{fmtPct(c.resultado.margemEfetiva)}</strong></div>
                <div><span>Peso</span><strong>{c.entrada.pesoGramas}g</strong></div>
                <div><span>Impressão</span><strong>{c.entrada.horasImpressao}h</strong></div>
                <div><span>Falhas</span><strong>{c.entrada.percentualFalhas}%</strong></div>
              </div>
              <ResultadoCotacao
                resultado={c.resultado}
                nome={c.nome}
                entrada={c.entrada}
                config={c.configSnapshot}
              />
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
