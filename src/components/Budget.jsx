import React, { useMemo, useState } from 'react'

function buildDays(monthLength = 30) {
  return Array.from({ length: monthLength }, (_, i) => ({ day: i + 1 }))
}

export default function Budget({ budgetAmount, tickets, setTickets }) {
  const [monthLength, setMonthLength] = useState(30)

  const days = useMemo(() => buildDays(monthLength), [monthLength])

  // compute per-day assigned totals from tickets only (single source of truth)
  const assignedTotalsByDay = useMemo(() => {
    const map = Array.from({ length: monthLength }, () => 0)
    tickets.forEach(t => {
      if (t.day && Number(t.amount)) {
        const idx = Number(t.day) - 1
        if (idx >= 0 && idx < monthLength) map[idx] += Number(t.amount)
      }
    })
    return map
  }, [tickets, monthLength])

  const totalAssigned = assignedTotalsByDay.reduce((s, x) => s + x, 0)
  const averagePerDay = (Math.max(0, budgetAmount - totalAssigned) / monthLength) || 0

  function addTicket() {
    const t = { id: Date.now(), name: 'Ticket', amount: '', day: null }
    setTickets([...tickets, t])
  }

  function updateTicket(id, patch) {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  function assignTicketToDay(ticketId, dayNumber) {
    // simply update the ticket's day field; assigned totals are derived from tickets
    updateTicket(ticketId, { day: dayNumber })
  }

  function setMonthDays(n) {
    setMonthLength(n)
  }

  return (
    <div className="card">
      <h2>Budget</h2>
      <div className="row">
        <label>Month days
          <input type="number" value={monthLength} onChange={e => setMonthDays(Number(e.target.value) || 30)} min="28" max="31" />
        </label>
        <div>Budget after savings & deductions: ${budgetAmount.toFixed(2)}</div>
      </div>

      <div className="row">
        <button onClick={addTicket}>Add ticket</button>
      </div>

      <div className="tickets">
        {tickets.map(t => (
          <div key={t.id} className="ticket">
            <input value={t.name} onChange={e => updateTicket(t.id, { name: e.target.value })} />
            <input type="number" value={t.amount} onChange={e => updateTicket(t.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })} min="0" />
            <label>Assign to day
              <select value={t.day || ''} onChange={e => assignTicketToDay(t.id, e.target.value === '' ? null : Number(e.target.value))}>
                <option value="">(none)</option>
                {days.map(d => <option key={d.day} value={d.day}>{d.day}</option>)}
              </select>
            </label>
          </div>
        ))}
      </div>

      <h3>Per-day view</h3>
      <div className="days">
        {days.map((d, i) => (
          <div key={d.day} className="day">
            <div className="day-header">Day {d.day}</div>
            <div>Assigned: ${assignedTotalsByDay[i].toFixed(2)}</div>
            <div>Daily avg remaining: ${averagePerDay.toFixed(2)}</div>
            <div>
              {tickets.filter(t => t.day === d.day).map(a => (
                <div key={a.id} className="ticket-small">{a.name}: ${Number(a.amount || 0).toFixed(2)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
