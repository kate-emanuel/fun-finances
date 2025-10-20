import React, { useState, useMemo } from 'react'
import IncomeForm from './components/IncomeForm'
import DeductionsForm from './components/DeductionsForm'
import SavingsForm from './components/SavingsForm'
import Budget from './components/Budget'

export default function App() {
  const [income, setIncome] = useState(0)
  const [deductions, setDeductions] = useState([])
  const [savings, setSavings] = useState([])
  const [tickets, setTickets] = useState([])

  const netAfterDeductions = useMemo(() => {
    const totalDeductions = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0)
    const inc = Number(income) || 0
    return Math.max(0, inc - totalDeductions)
  }, [income, deductions])

  const afterSavings = useMemo(() => {
    const totalSavings = (savings || []).reduce((s, x) => s + (Number(x.amount) || 0), 0)
    return Math.max(0, netAfterDeductions - totalSavings)
  }, [netAfterDeductions, savings])

  return (
    <div className="container">
      <h1>Fun Finances</h1>

      <div className="forms">
        <IncomeForm income={income} setIncome={setIncome} />
        <DeductionsForm deductions={deductions} setDeductions={setDeductions} />
        <SavingsForm savings={savings} setSavings={setSavings} />
      </div>

      <Budget
        budgetAmount={afterSavings}
        tickets={tickets}
        setTickets={setTickets}
      />
    </div>
  )
}
