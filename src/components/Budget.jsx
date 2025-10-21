import React, { useState, useMemo, useEffect } from 'react'

const CalendarDay = React.memo(({ day, payAmount, assignedAmount, confirmedSpending, remainingBudget, tickets, onConfirmSpending }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [spendingAmount, setSpendingAmount] = useState(confirmedSpending || '')
  
  const handleConfirm = () => {
    if (spendingAmount === '') return
    onConfirmSpending(day.day, Number(spendingAmount))
    setIsEditing(false)
  }

  return (
    <div className={`day ${day.isToday ? 'today' : ''} ${day.isPadding ? 'padding' : ''}`}>
      <div className="day-header">
        <span className="day-number">{day.day}</span>
      </div>
      {!day.isPadding && (
        <div className="day-content">
          {Number(payAmount) > 0 && <div className="payday">Pay: ${(Number(payAmount) || 0).toFixed(2)}</div>}
          <div className="budget-row">
            <span className="budget-label">Assigned:</span>
            <span className="budget-value">${(Number(assignedAmount) || 0).toFixed(2)}</span>
          </div>
          <div className="budget-row">
            <span className="budget-label">Remaining:</span>
            <span className="budget-value">${(Number(remainingBudget) || 0).toFixed(2)}</span>
          </div>
          <div className="spending-section">
            {!isEditing ? (
              <div onClick={() => setIsEditing(true)} className="spending-display">
                {confirmedSpending !== null ? (
                  <div className="confirmed-spending">
                    Spent: ${(Number(confirmedSpending) || 0).toFixed(2)}
                  </div>
                ) : (
                  <button className="add-spending-btn">Add spending</button>
                )}
              </div>
            ) : (
              <div className="spending-input">
                <input
                  type="number"
                  value={spendingAmount}
                  onChange={(e) => setSpendingAmount(e.target.value)}
                  placeholder="Enter amount"
                  autoFocus
                />
                <button onClick={handleConfirm}>✓</button>
                <button onClick={() => {
                  setIsEditing(false)
                  setSpendingAmount(confirmedSpending || '')
                }}>✕</button>
              </div>
            )}
          </div>
          {/* Tickets are now only reflected in 'Assigned' value, not listed below */}
        </div>
      )}
    </div>
  )
})

const WeekRow = React.memo(({ week, weekIndex, paySourcesByDay, assignedTotalsByDay, confirmedSpendingByDay, remainingBudgetByDay, tickets, onConfirmSpending }) => {
  return (
    <div className="week-row">
  {(Array.isArray(week) ? week : []).map((day, dayIndex) => {
        const idx = day.isPadding ? -1 : weekIndex * 7 + dayIndex;
        const payAmount = idx >= 0 ? (paySourcesByDay[idx] || 0) : 0;
        const assignedAmount = idx >= 0 ? (assignedTotalsByDay[idx] || 0) : 0;
        const confirmedSpending = idx >= 0 ? confirmedSpendingByDay[idx] : null;
        const remainingBudget = idx >= 0 ? remainingBudgetByDay[idx] : 0;

        // Find the index in the filtered days array for non-padding days
        const nonPaddingDays = week.filter(d => !d.isPadding);
        const nonPaddingIdx = !day.isPadding ? nonPaddingDays.findIndex(d => d.day === day.day) + weekIndex * 7 : -1;

        return (
          <CalendarDay
            key={`${day.date.getMonth()}-${day.day}`}
            day={day}
            payAmount={payAmount}
            assignedAmount={assignedAmount}
            confirmedSpending={confirmedSpending}
            remainingBudget={remainingBudget}
            tickets={tickets}
            onConfirmSpending={(actualDay, amount) => {
              if (!day.isPadding) {
                onConfirmSpending(day.day, amount);
              }
            }}
          />
        );
      })}
    </div>
  )
})

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
  const [confirmedSpending, setConfirmedSpending] = useState({})

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

  function updateTicket(id, changes) {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...changes } : t))
  }

  function assignTicketToDay(id, day) {
    updateTicket(id, { day })
  }

  function addTicket() {
    const t = { id: Date.now(), name: 'New Ticket', amount: '', day: null }
    setTickets([...tickets, t])
  }

  const paySourcesByDay = useMemo(() => {
    const map = Array.from({ length: monthLength }, () => 0)

    paySources.forEach(p => {
      if (p.type === 'fixed' && Number(p.amount) && Number(p.anchorDay)) {
        const d = Number(p.anchorDay)
        if (d >= 1 && d <= monthLength) map[d - 1] += Number(p.amount)
      }
      if (p.type === 'interval' && Number(p.amount) && Number(p.intervalWeeks) && Number(p.anchorDay)) {
        let day = Number(p.anchorDay)
        const step = Number(p.intervalWeeks) * 7
        while (day <= monthLength) {
          if (day >= 1 && day <= monthLength) map[day - 1] += Number(p.amount)
          day += step
        }
      }
      if (p.type === 'hourly' && Number(p.wage) && Number(p.hoursPerWeek)) {
        const annual = Number(p.wage) * Number(p.hoursPerWeek) * 52
        const monthly = annual / 12
        const d = Number(p.anchorDay) || 1
        if (d >= 1 && d <= monthLength) map[d - 1] += monthly
      }
    })
    return map
  }, [paySources, monthLength])

  // Map tickets to the correct calendar index, including padding days
  const assignedTotalsByDay = useMemo(() => {
    const map = Array.from({ length: days.length }, () => null);
    tickets.forEach(t => {
      if (t.day && Number(t.amount)) {
        // Find the index in days array for the ticket's day
        const idx = days.findIndex(d => !d.isPadding && d.day === t.day);
        if (idx >= 0) map[idx] = Number(t.amount);
      }
    });
    return map;
  }, [tickets, days]);

  // Map confirmed spending to the correct calendar index, including padding days
  const confirmedSpendingByDay = useMemo(() => {
    const map = Array.from({ length: days.length }, () => null);
    Object.entries(confirmedSpending).forEach(([day, amount]) => {
      const idx = days.findIndex(d => !d.isPadding && d.day === Number(day));
      if (idx >= 0) {
        map[idx] = Number(amount);
      }
    });
    return map;
  }, [confirmedSpending, days]);

  // Calculate total confirmed spending
  const totalConfirmedSpending = useMemo(() => {
    return Object.values(confirmedSpending).reduce((sum, amount) => sum + Number(amount), 0)
  }, [confirmedSpending])

  // Disperse the original budget evenly among all days of the month
  // Subtract assigned tickets and confirmed spending from each day's budget
  // Divide the budget evenly among all actual days of the month
  // Calculate daily budget for each day (including padding)
  const nonPaddingCount = days.filter(d => !d.isPadding).length;
  const originalDailyBudget = nonPaddingCount > 0 ? (Number(budgetAmount) || 0) / nonPaddingCount : 0;
  const remainingBudgetByDay = useMemo(() => {
    return days.map((d, i) => {
      if (d.isPadding) return null;
      let value = originalDailyBudget;
      value -= assignedTotalsByDay[i] || 0;
      if (confirmedSpendingByDay[i] != null) {
        value -= confirmedSpendingByDay[i];
      }
      return Math.max(0, value);
    });
  }, [budgetAmount, assignedTotalsByDay, confirmedSpendingByDay, days]);

  const handleConfirmSpending = (day, amount) => {
    setConfirmedSpending(prev => ({
      ...prev,
      [day]: amount
    }))
  }

  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [days])

  return (
    <div className="card">
      <h2>Budget</h2>
      <div className="row">
        <div className="month-header">
          <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div>{monthLength} days</div>
        </div>
        <div>Budget after savings & deductions: ${(Number(budgetAmount) || 0).toFixed(2)}</div>
        <div>Total spent: ${totalConfirmedSpending.toFixed(2)}</div>
        <div>Remaining: ${Math.max(0, (Number(budgetAmount) || 0) - totalConfirmedSpending).toFixed(2)}</div>
      </div>

      <div className="row">
        <button onClick={addTicket}>Add ticket</button>
      </div>

      <div className="tickets">
        {(Array.isArray(tickets) ? tickets : []).map(t => (
          <div key={t.id} className="ticket">
            <input value={t.name} onChange={e => updateTicket(t.id, { name: e.target.value })} />
            <input type="number" value={t.amount} onChange={e => updateTicket(t.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })} min="0" />
            <label>
              Assign to day
              <select value={t.day || ''} onChange={e => assignTicketToDay(t.id, e.target.value === '' ? null : Number(e.target.value))}>
                <option value="">(none)</option>
                {(Array.isArray(days) ? days : []).filter(d => !d.isPadding).map(d => (
                  <option key={d.day} value={d.day}>{d.day}</option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      <div className="calendar">
        <div className="week-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        <div className="weeks">
          {weeks.map((week, index) => (
            <WeekRow
              key={index}
              week={week}
              weekIndex={index}
              paySourcesByDay={paySourcesByDay}
              assignedTotalsByDay={assignedTotalsByDay}
              confirmedSpendingByDay={confirmedSpendingByDay}
              remainingBudgetByDay={remainingBudgetByDay}
              tickets={tickets}
              onConfirmSpending={handleConfirmSpending}
            />
          ))}
        </div>
      </div>
    </div>
  )
}