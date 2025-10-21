import React, { useState, useMemo } from 'react'
import IncomeForm from './components/IncomeForm'
import DeductionsForm from './components/DeductionsForm'
import SavingsForm from './components/SavingsForm'
import Budget from './components/Budget'
import PaydaysForm from './components/PaydaysForm'

export default function App() {
  const [income, setIncome] = useState(0)
  const [deductions, setDeductions] = useState([])
  const [savings, setSavings] = useState([])
  const [tickets, setTickets] = useState([])
  const [paySources, setPaySources] = useState([])

  const netAfterDeductions = useMemo(() => {
    const totalDeductions = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0)
    const inc = Number(income) || 0
    return Math.max(0, inc - totalDeductions)
  }, [income, deductions])

  const afterSavings = useMemo(() => {
    const totalSavings = (savings || []).reduce((s, x) => s + (Number(x.amount) || 0), 0)
    return Math.max(0, netAfterDeductions - totalSavings)
  }, [netAfterDeductions, savings])

  // compute income from paySources (monthly equivalent)
  const paySourcesMonthly = useMemo(() => {
    // fixed: days comma list with amount per pay -> monthly sum
    // interval: amount per pay with intervalWeeks -> monthly equiv = amount * (52 / (intervalWeeks * 12)) approx -> better: amount * (52 / intervalWeeks) / 12
    // hourly: hoursPerWeek * wage * (52 / 12) / frequencyWeeks
    let total = 0;
    (paySources || []).forEach(p => {
      if (p.type === 'fixed' && Number(p.amount)) {
        total += Number(p.amount) * (p.days ? p.days.toString().split(',').filter(Boolean).length : 0)
      }
      if (p.type === 'interval' && Number(p.amount) && Number(p.intervalWeeks)) {
        const paysPerYear = 52 / Number(p.intervalWeeks)
        total += Number(p.amount) * (paysPerYear / 12)
      }
      if (p.type === 'hourly' && Number(p.hoursPerWeek) && Number(p.wage) && Number(p.frequencyWeeks)) {
        const weeksPerPay = Number(p.frequencyWeeks)
        const paysPerYear = 52 / weeksPerPay
        const annual = Number(p.hoursPerWeek) * Number(p.wage) * 52
        total += annual / 12
      }
    })
    return total
  }, [paySources])

  const effectiveIncome = useMemo(() => {
    return (Number(income) || 0) + paySourcesMonthly
  }, [income, paySourcesMonthly])

  return (
    <div className="container">
      <h1>Fun Finances</h1>

      <div className="forms">
        <IncomeForm income={income} setIncome={setIncome} />
        <DeductionsForm deductions={deductions} setDeductions={setDeductions} />
        <SavingsForm savings={savings} setSavings={setSavings} />
        <PaydaysForm paySources={paySources} setPaySources={setPaySources} />
      </div>

      <Budget
        budgetAmount={afterSavings}
        tickets={tickets}
        setTickets={setTickets}
        paySources={paySources}
        effectiveIncome={effectiveIncome}
      />
    </div>
  )
}
