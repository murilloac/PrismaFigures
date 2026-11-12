import { fmt, fmtPct } from '../calc'

function Linha({ label, valor, destaque }) {
  return (
    <div className={`linha-resultado ${destaque ? 'destaque' : ''}`}>
      <span>{label}</span>
      <strong>{fmt(valor)}</strong>
    </div>
  )
}

export default function ResultadoCotacao({ resultado, nome, entrada, config }) {
  const {
    custoResinaBase, custoFalhas, custoResinaComFalhas,
    custoEnergia, custoDepreciacao, custoManutencao,
    custoMateriais, custoMaoDeObra, custoTotal,
    precoMinimo, precoRecomendado, precoPremium,
    lucroEstimado, margemEfetiva,
  } = resultado

  function exportarPDF() {
    const conteudo = `
PRISMA FIGURES — ORÇAMENTO
===========================
Peça: ${nome || '—'}
Data: ${new Date().toLocaleDateString('pt-BR')}

CUSTOS DE PRODUÇÃO
------------------
Resina (${entrada.pesoGramas}g):       ${fmt(custoResinaBase)}
Reserva para falhas:        ${fmt(custoFalhas)}
Energia elétrica:           ${fmt(custoEnergia)}
Depreciação da máquina:     ${fmt(custoDepreciacao)}
Manutenção:                 ${fmt(custoManutencao)}
Materiais de acabamento:    ${fmt(custoMateriais)}
Mão de obra:                ${fmt(custoMaoDeObra)}
                            ──────────────
CUSTO TOTAL:                ${fmt(custoTotal)}

PREÇOS DE VENDA
---------------
Preço mínimo:               ${fmt(precoMinimo)}
Preço recomendado:          ${fmt(precoRecomendado)}
Preço premium:              ${fmt(precoPremium)}

Lucro estimado:             ${fmt(lucroEstimado)}
Margem efetiva:             ${fmtPct(margemEfetiva)}

Parâmetros utilizados
---------------------
Resina: R$ ${config.precoResinaGrama}/g | Falhas: ${entrada.percentualFalhas}%
Margem: ${entrada.margemLucro}% | Taxas: ${entrada.taxasVenda}%
    `.trim()

    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orcamento-${(nome || 'peca').replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card resultado">
      <h3>Resultado da Cotação{nome ? ` — ${nome}` : ''}</h3>

      <div className="bloco-resultado">
        <h4>Custos de produção</h4>
        <Linha label={`Resina (${entrada.pesoGramas}g)`} valor={custoResinaBase} />
        <Linha label="Reserva para falhas" valor={custoFalhas} />
        <Linha label="Energia elétrica" valor={custoEnergia} />
        <Linha label="Depreciação da máquina" valor={custoDepreciacao} />
        <Linha label="Manutenção" valor={custoManutencao} />
        <Linha label="Materiais de acabamento" valor={custoMateriais} />
        <Linha label="Mão de obra" valor={custoMaoDeObra} />
        <Linha label="Custo total" valor={custoTotal} destaque />
      </div>

      <div className="bloco-resultado">
        <h4>Preços de venda</h4>
        <Linha label="Preço mínimo" valor={precoMinimo} />
        <Linha label="Preço recomendado" valor={precoRecomendado} destaque />
        <Linha label="Preço premium (+20%)" valor={precoPremium} />
      </div>

      <div className="bloco-resultado">
        <h4>Rentabilidade</h4>
        <Linha label="Lucro estimado" valor={lucroEstimado} />
        <div className="linha-resultado">
          <span>Margem efetiva</span>
          <strong>{fmtPct(margemEfetiva)}</strong>
        </div>
      </div>

      <button className="btn-ghost" onClick={exportarPDF} style={{ marginTop: 12 }}>
        ⬇ Exportar orçamento (.txt)
      </button>
    </section>
  )
}
