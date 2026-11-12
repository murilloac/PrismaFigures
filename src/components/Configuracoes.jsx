import { useStore } from '../store'

function Campo({ label, name, value, onChange, suffix = '', step = '0.01' }) {
  return (
    <div className="campo">
      <label>{label}</label>
      <div className="input-wrap">
        <input
          type="number"
          step={step}
          value={value}
          onChange={e => onChange(name, parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const { config, setConfig } = useStore()

  function handle(name, value) {
    setConfig(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'precoResinaKg') next.precoResinaGrama = +(value / 1000).toFixed(6)
      if (name === 'precoResinaGrama') next.precoResinaKg = +(value * 1000).toFixed(2)
      if (name === 'valorImpressora' || name === 'vidaUtilHoras')
        next.depreciacaoPorHora = +(next.valorImpressora / next.vidaUtilHoras).toFixed(4)
      if (name === 'remuneracaoMensal' || name === 'horasProdutivas')
        next.valorHoraTrabalho = +(next.remuneracaoMensal / next.horasProdutivas).toFixed(2)
      return next
    })
  }

  return (
    <div className="page">
      <h2>Configurações</h2>

      <section className="card">
        <h3>Resina</h3>
        <Campo label="Preço por kg" name="precoResinaKg" value={config.precoResinaKg} onChange={handle} suffix="R$/kg" />
        <Campo label="Preço por grama" name="precoResinaGrama" value={config.precoResinaGrama} onChange={handle} suffix="R$/g" step="0.001" />
        <Campo label="Reserva para falhas" name="percentualFalhas" value={config.percentualFalhas} onChange={handle} suffix="%" step="1" />
      </section>

      <section className="card">
        <h3>Energia</h3>
        <Campo label="Custo do kWh" name="custoKwh" value={config.custoKwh} onChange={handle} suffix="R$/kWh" />
        <Campo label="Potência da impressora" name="potenciaImpressora" value={config.potenciaImpressora} onChange={handle} suffix="W" step="1" />
      </section>

      <section className="card">
        <h3>Impressora — Creality HALOT-MAGE 8K</h3>
        <Campo label="Valor de compra" name="valorImpressora" value={config.valorImpressora} onChange={handle} suffix="R$" step="1" />
        <Campo label="Vida útil estimada" name="vidaUtilHoras" value={config.vidaUtilHoras} onChange={handle} suffix="horas" step="1" />
        <Campo label="Depreciação por hora" name="depreciacaoPorHora" value={config.depreciacaoPorHora} onChange={handle} suffix="R$/h" />
        <Campo label="Manutenção por hora" name="manutencaoPorHora" value={config.manutencaoPorHora} onChange={handle} suffix="R$/h" />
      </section>

      <section className="card">
        <h3>Mão de obra</h3>
        <Campo label="Remuneração mensal desejada" name="remuneracaoMensal" value={config.remuneracaoMensal} onChange={handle} suffix="R$" step="1" />
        <Campo label="Horas produtivas mensais" name="horasProdutivas" value={config.horasProdutivas} onChange={handle} suffix="horas" step="1" />
        <Campo label="Valor da hora de trabalho" name="valorHoraTrabalho" value={config.valorHoraTrabalho} onChange={handle} suffix="R$/h" />
      </section>

      <section className="card">
        <h3>Precificação</h3>
        <Campo label="Margem de lucro desejada" name="margemLucro" value={config.margemLucro} onChange={handle} suffix="%" step="1" />
        <Campo label="Taxas de venda" name="taxasVenda" value={config.taxasVenda} onChange={handle} suffix="%" step="1" />
      </section>
    </div>
  )
}
