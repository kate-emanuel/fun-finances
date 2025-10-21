import React, { useMemo, useState, useEffect } from 'react'

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate()
}

function buildDays(month, year) {
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate padding days from previous month
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevMonthDays = getDaysInMonth(prevMonth, prevYear)
  
  const paddingDaysBefore = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const day = prevMonthDays - firstDayOfWeek + i + 1
    const date = new Date(prevYear, prevMonth, day)
    return {
      day,
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isPadding: true,
      isToday: date.toDateString() === new Date().toDateString()
    }
  })

  // Current month days
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1)
    return {
      day: i + 1,
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isPadding: false,
      isToday: date.toDateString() === new Date().toDateString()
    }
  })

  // Calculate padding days for next month
  const totalDaysSoFar = paddingDaysBefore.length + daysInMonth
  const paddingDaysAfterLength = Math.ceil(totalDaysSoFar / 7) * 7 - totalDaysSoFar
  
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  
  const paddingDaysAfter = Array.from({ length: paddingDaysAfterLength }, (_, i) => {
    const date = new Date(nextYear, nextMonth, i + 1)
    return {
      day: i + 1,
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isPadding: true,
      isToday: date.toDateString() === new Date().toDateString()
    }
  })

  return [...paddingDaysBefore, ...currentDays, ...paddingDaysAfter]
}

export default function Budget({ budgetAmount, tickets, setTickets, paySources = [], effectiveIncome = 0 }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthLength, setMonthLength] = useState(getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear()))

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (now.getMonth() !== currentDate.getMonth() || now.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(now)
        setMonthLength(getDaysInMonth(now.getMonth(), now.getFullYear()))
      }
    }, 3600000) // Check every hour
    return () => clearInterval(interval)
  }, [currentDate])

  const days = useMemo(() => buildDays(currentDate.getMonth(), currentDate.getFullYear()), 
    [currentDate])

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
        <div className="month-header">
          <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div>{monthLength} days</div>
        </div>
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

      <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
      <div className="calendar">
        <div className="week-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        <div className="weeks">
          {days.reduce((weeks, day, i) => {
            const weekIndex = Math.floor(i / 7)
            if (!weeks[weekIndex]) {
              weeks[weekIndex] = []
            }
            weeks[weekIndex].push(day)
            return weeks
          }, []).map((week, wi) => (
            <div key={wi} className="week-row">
              {week.map((d, i) => {
                const idx = wi * 7 + i
                return (
                  <div key={`${d.date.getMonth()}-${d.day}`} className={`day ${d.isToday ? 'today' : ''} ${d.isPadding ? 'padding' : ''}`}>
                    <div className="day-header">
                      <span className="day-number">{d.day}</span>
                    </div>
                    {!d.isPadding && (
                      <>
                        {paydaysMap[idx] ? <div className="payday">Pay: ${paydaysMap[idx].toFixed(2)}</div> : null}
                        <div>Assigned: ${assignedTotalsByDay[idx].toFixed(2)}</div>
                        <div>Daily avg remaining: ${averagePerDay.toFixed(2)}</div>
                        <div>
                          {tickets.filter(t => t.day === d.day).map(a => (
                            <div key={a.id} className="ticket-small">{a.name}: ${Number(a.amount || 0).toFixed(2)}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
