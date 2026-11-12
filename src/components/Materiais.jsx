import { useState } from 'react'
import { useStore } from '../store'

const EMPTY = { nome: '', categoria: 'Primer', precoCompra: '', qtdEmbalagem: '', unidade: 'ml', qtdUsada: '' }
const CATEGORIAS = ['Primer', 'Tinta', 'Verniz', 'Lixa', 'Massa de acabamento', 'Outro']
const UNIDADES = ['ml', 'g', 'un', 'm²']

export default function Materiais() {
  const { materiais, setMateriais } = useStore()
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  function handle(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function salvar() {
    if (!form.nome || !form.precoCompra || !form.qtdEmbalagem) return
    const item = {
      ...form,
      id: editId ?? crypto.randomUUID(),
      precoCompra: parseFloat(form.precoCompra),
      qtdEmbalagem: parseFloat(form.qtdEmbalagem),
      qtdUsada: parseFloat(form.qtdUsada) || 0,
    }
    if (editId) {
      setMateriais(prev => prev.map(m => m.id === editId ? item : m))
      setEditId(null)
    } else {
      setMateriais(prev => [...prev, item])
    }
    setForm(EMPTY)
  }

  function editar(m) {
    setForm(m)
    setEditId(m.id)
  }

  function deletar(id) {
    setMateriais(prev => prev.filter(m => m.id !== id))
  }

  const custoUnitario = (m) => m.precoCompra / m.qtdEmbalagem

  return (
    <div className="page">
      <h2>Materiais de Acabamento</h2>

      <section className="card">
        <h3>{editId ? 'Editar material' : 'Novo material'}</h3>
        <div className="grid-2">
          <div className="campo">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handle} placeholder="Ex: Primer cinza 400ml" />
          </div>
          <div className="campo">
            <label>Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handle}>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Preço de compra (R$)</label>
            <input name="precoCompra" type="number" step="0.01" value={form.precoCompra} onChange={handle} />
          </div>
          <div className="campo">
            <label>Quantidade da embalagem</label>
            <div className="input-wrap">
              <input name="qtdEmbalagem" type="number" step="0.01" value={form.qtdEmbalagem} onChange={handle} />
              <select name="unidade" value={form.unidade} onChange={handle} style={{ width: 'auto' }}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="row-btns">
          <button className="btn-primary" onClick={salvar}>{editId ? 'Salvar alterações' : 'Adicionar'}</button>
          {editId && <button className="btn-ghost" onClick={() => { setForm(EMPTY); setEditId(null) }}>Cancelar</button>}
        </div>
      </section>

      {materiais.length > 0 && (
        <section className="card">
          <h3>Materiais cadastrados</h3>
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Embalagem</th>
                <th>Preço</th>
                <th>Custo unitário</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materiais.map(m => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.categoria}</td>
                  <td>{m.qtdEmbalagem} {m.unidade}</td>
                  <td>R$ {m.precoCompra.toFixed(2)}</td>
                  <td>R$ {custoUnitario(m).toFixed(4)}/{m.unidade}</td>
                  <td className="acoes">
                    <button className="btn-ghost sm" onClick={() => editar(m)}>Editar</button>
                    <button className="btn-danger sm" onClick={() => deletar(m.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
