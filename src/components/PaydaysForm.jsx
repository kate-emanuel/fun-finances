import React from 'react'

function emptyFixed() {
  return { id: Date.now(), type: 'fixed', days: '1,15', amount: '' }
}

function emptyInterval() {
  return { id: Date.now(), type: 'interval', amount: '', intervalWeeks: 2, anchorDay: 1 }
}

function emptyHourly() {
  return { id: Date.now(), type: 'hourly', hoursPerWeek: '', wage: '', frequencyWeeks: 1, anchorDay: 1 }
}

export default function PaydaysForm({ paySources, setPaySources }) {
  function add(type) {
    if (type === 'fixed') setPaySources([...(paySources || []), emptyFixed()])
    if (type === 'interval') setPaySources([...(paySources || []), emptyInterval()])
    if (type === 'hourly') setPaySources([...(paySources || []), emptyHourly()])
  }

  function update(id, patch) {
    setPaySources((paySources || []).map(p => p.id === id ? { ...p, ...patch } : p))
  }

  function remove(id) {
    setPaySources((paySources || []).filter(p => p.id !== id))
  }

  return (
    <div className="card">
      <h2>Paydays / Pay sources</h2>
      <div className="row">
        <button onClick={() => add('fixed')}>Add monthly days</button>
        <button onClick={() => add('interval')}>Add interval (biweekly)</button>
        <button onClick={() => add('hourly')}>Add hourly</button>
      </div>

      {(paySources || []).map(p => (
        <div key={p.id} className="card small">
          <div className="row">
            <strong>{p.type}</strong>
            <button onClick={() => remove(p.id)}>remove</button>
          </div>

          {p.type === 'fixed' && (
            <div className="row">
              <label>Days (comma list)
                <input value={p.days} onChange={e => update(p.id, { days: e.target.value })} />
              </label>
              <label>Amount per pay
                <input type="number" value={p.amount} onChange={e => update(p.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })} />
              </label>
            </div>
          )}

          {p.type === 'interval' && (
            <div className="row">
              <label>Amount per pay
                <input type="number" value={p.amount} onChange={e => update(p.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })} />
              </label>
              <label>Weeks between pays
                <input type="number" min="1" value={p.intervalWeeks} onChange={e => update(p.id, { intervalWeeks: Number(e.target.value) || 1 })} />
              </label>
              <label>Most recent payday (day number)
                <input type="number" min="1" value={p.anchorDay} onChange={e => update(p.id, { anchorDay: Number(e.target.value) || 1 })} />
              </label>
            </div>
          )}

          {p.type === 'hourly' && (
            <div className="row">
              <label>Hours / week
                <input type="number" value={p.hoursPerWeek} onChange={e => update(p.id, { hoursPerWeek: e.target.value === '' ? '' : Number(e.target.value) })} />
              </label>
              <label>Hourly wage
                <input type="number" value={p.wage} onChange={e => update(p.id, { wage: e.target.value === '' ? '' : Number(e.target.value) })} />
              </label>
              <label>Frequency (weeks)
                <input type="number" min="1" value={p.frequencyWeeks} onChange={e => update(p.id, { frequencyWeeks: Number(e.target.value) || 1 })} />
              </label>
              <label>Anchor payday (day number)
                <input type="number" min="1" value={p.anchorDay} onChange={e => update(p.id, { anchorDay: Number(e.target.value) || 1 })} />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
