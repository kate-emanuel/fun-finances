import React from 'react'

export default function DeductionsForm({ deductions, setDeductions }) {
  function addDeduction() {
    setDeductions([...deductions, { id: Date.now(), name: '', amount: 0 }])
  }

  function updateDeduction(id, patch) {
    setDeductions(deductions.map(d => d.id === id ? { ...d, ...patch } : d))
  }

  function removeDeduction(id) {
    setDeductions(deductions.filter(d => d.id !== id))
  }

  return (
    <div className="card">
      <h2>Taxes & Repeated Expenses</h2>
      {deductions.map(d => (
        <div key={d.id} className="row">
          <input
            placeholder="name (rent, tax, sub)"
            value={d.name}
            onChange={(e) => updateDeduction(d.id, { name: e.target.value })}
          />
          <input
            type="number"
            value={d.amount}
            onChange={(e) => updateDeduction(d.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })}
            min="0"
          />
          <button onClick={() => removeDeduction(d.id)}>remove</button>
        </div>
      ))}
      <button onClick={addDeduction}>Add deduction</button>
    </div>
  )
}
