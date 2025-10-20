import React, { useMemo, useState } from 'react'

function buildDays(monthLength = 30) {
  return Array.from({ length: monthLength }, (_, i) => ({ day: i + 1 }))
}

export default function Budget({ budgetAmount, tickets, setTickets, paySources = [], effectiveIncome = 0 }) {
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

  // compute paydays for the month from paySources
  const paydaysMap = useMemo(() => {
    const map = Array.from({ length: monthLength }, () => 0)
    paySources.forEach(p => {
      if (p.type === 'fixed' && Number(p.amount)) {
        const daysList = (p.days || '').toString().split(',').map(s => Number(s.trim())).filter(Boolean)
        daysList.forEach(d => { if (d >= 1 && d <= monthLength) map[d - 1] += Number(p.amount) })
      }
      if (p.type === 'interval' && Number(p.amount) && Number(p.intervalWeeks) && Number(p.anchorDay)) {
        // place pays starting from anchorDay every intervalWeeks until month end (approx)
        let day = Number(p.anchorDay)
        const step = Number(p.intervalWeeks) * 7
        while (day <= monthLength) {
          if (day >= 1 && day <= monthLength) map[day - 1] += Number(p.amount)
          day += step
        }
      }
      if (p.type === 'hourly' && Number(p.wage) && Number(p.hoursPerWeek)) {
        // compute monthly amount and place on anchorDay
        const annual = Number(p.wage) * Number(p.hoursPerWeek) * 52
        const monthly = annual / 12
        const d = Number(p.anchorDay) || 1
        if (d >= 1 && d <= monthLength) map[d - 1] += monthly
      }
    })
    return map
  }, [paySources, monthLength])

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

      <h3>Calendar</h3>
      <div className="calendar">
        {(() => {
          const weeks = []
          for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7))
          }
          return weeks.map((week, wi) => (
            <div key={wi} className="week-row">
              {week.map((d, i) => {
                const idx = wi * 7 + i
                return (
                  <div key={d.day} className="day">
                    <div className="day-header">Day {d.day}</div>
                    {paydaysMap[idx] ? <div className="payday">Pay: ${paydaysMap[idx].toFixed(2)}</div> : null}
                    <div>Assigned: ${assignedTotalsByDay[idx].toFixed(2)}</div>
                    <div>Daily avg remaining: ${averagePerDay.toFixed(2)}</div>
                    <div>
                      {tickets.filter(t => t.day === d.day).map(a => (
                        <div key={a.id} className="ticket-small">{a.name}: ${Number(a.amount || 0).toFixed(2)}</div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        })()}
      </div>
    </div>
  )
}
