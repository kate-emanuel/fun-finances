import React from 'react'

export default function SavingsForm({ savings, setSavings }) {
  function addBucket() {
    setSavings([...(savings || []), { id: Date.now(), name: 'Goal', amount: '' }])
  }

  function updateBucket(id, patch) {
    setSavings((savings || []).map(s => s.id === id ? { ...s, ...patch } : s))
  }

  function removeBucket(id) {
    setSavings((savings || []).filter(s => s.id !== id))
  }

  return (
    <div className="card">
      <h2>Savings</h2>
      {(savings || []).map(s => (
        <div key={s.id} className="row">
          <input value={s.name} onChange={e => updateBucket(s.id, { name: e.target.value })} />
          <input type="number" value={s.amount} onChange={e => updateBucket(s.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })} min="0" />
          <button onClick={() => removeBucket(s.id)}>remove</button>
        </div>
      ))}
      <button onClick={addBucket}>Add savings bucket</button>
    </div>
  )
}
