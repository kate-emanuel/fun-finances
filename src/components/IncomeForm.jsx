import React from 'react'

export default function IncomeForm({ income, setIncome }) {
  return (
    <div className="card">
      <h2>Income</h2>
      <label>
        Monthly income
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
          min="0"
        />
      </label>
    </div>
  )
}
