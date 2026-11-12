export function calcular(entrada, config) {
  const {
    pesoGramas,
    horasImpressao,
    percentualFalhas = config.percentualFalhas,
    horasPreparacao = 0,
    horasAcabamento = 0,
    materiaisUsados = [],
    margemLucro = config.margemLucro,
    taxasVenda = config.taxasVenda,
  } = entrada

  // A. Resina
  const custoResinaBase = pesoGramas * config.precoResinaGrama
  const custoResinaComFalhas = custoResinaBase * (1 + percentualFalhas / 100)
  const custoFalhas = custoResinaComFalhas - custoResinaBase

  // B. Energia
  const custoEnergia = (config.potenciaImpressora / 1000) * horasImpressao * config.custoKwh

  // C. Depreciação
  const custoDepreciacao = config.depreciacaoPorHora * horasImpressao

  // D. Manutenção
  const custoManutencao = config.manutencaoPorHora * horasImpressao

  // E. Materiais de acabamento
  const custoMateriais = materiaisUsados.reduce((acc, item) => {
    const custoUnitario = item.precoCompra / item.qtdEmbalagem
    return acc + item.qtdUsada * custoUnitario
  }, 0)

  // F. Mão de obra (sem tempo de impressão automática)
  const totalHorasMaoDeObra = horasPreparacao + horasAcabamento
  const custoMaoDeObra = totalHorasMaoDeObra * config.valorHoraTrabalho

  // Total
  const custoTotal = custoResinaComFalhas + custoEnergia + custoDepreciacao + custoManutencao + custoMateriais + custoMaoDeObra

  // Preço de venda
  const divisor = 1 - margemLucro / 100 - taxasVenda / 100
  const precoRecomendado = custoTotal / divisor

  // Preço mínimo (sem margem, só cobre taxas)
  const precoMinimo = custoTotal / (1 - taxasVenda / 100)

  // Preço premium (+20% sobre recomendado)
  const precoPremium = precoRecomendado * 1.2

  const valorTaxas = precoRecomendado * (taxasVenda / 100)
  const lucroEstimado = precoRecomendado - custoTotal - valorTaxas
  const margemEfetiva = (lucroEstimado / precoRecomendado) * 100

  return {
    custoResinaBase,
    custoFalhas,
    custoResinaComFalhas,
    custoEnergia,
    custoDepreciacao,
    custoManutencao,
    custoMateriais,
    custoMaoDeObra,
    custoTotal,
    precoMinimo,
    precoRecomendado,
    precoPremium,
    lucroEstimado,
    margemEfetiva,
  }
}

export function fmt(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function fmtPct(valor) {
  return valor.toFixed(2).replace('.', ',') + '%'
}
