import React, { useState } from 'react';

const CATEGORIES = [
  'fixed',
  'variable',
  'debt',
  'savings',
  'taxes',
  'extra',
];
function GoalBudget({ lineItems, setLineItems }) {
  const handleEditDelete = (cat, idx) => {
    const itemIdx = lineItems.findIndex((item, i) => item.category === cat && i === idx);
    if (itemIdx !== -1) {
      const updated = [...lineItems];
      updated.splice(itemIdx, 1);
      setLineItems(updated);
    }
    setEditingIdx(null);
  };
  const [editingIdx, setEditingIdx] = useState(null);
  const [editItem, setEditItem] = useState({ name: '', amount: '' });
  const [newItem, setNewItem] = useState({ name: '', amount: '', category: CATEGORIES[0] });
  const [goalIncome, setGoalIncome] = useState('');

  // Calculate total of all line items except 'extra'
  const totalLineItems = lineItems
    .filter(item => item.category !== 'extra')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Calculate remainder for 'extra'
  const remainder = goalIncome ? Number(goalIncome) - totalLineItems : 0;

  const addLineItem = () => {
    if (!newItem.name || !newItem.amount || !newItem.category) return;
    setLineItems([...lineItems, { ...newItem, amount: Number(newItem.amount) }]);
    setNewItem({ name: '', amount: '', category: CATEGORIES[0] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    items: lineItems.filter(item => item.category === cat)
  }));

  const handleEditClick = (item, idx) => {
    setEditingIdx(idx);
    setEditItem({ name: item.name, amount: item.amount });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  const handleEditSave = (cat, idx) => {
    const updated = [...lineItems];
    const itemIdx = lineItems.findIndex((item, i) => item.category === cat && i === idx);
    if (itemIdx !== -1) {
      updated[itemIdx] = { ...updated[itemIdx], name: editItem.name, amount: Number(editItem.amount) };
      setLineItems(updated);
    }
    setEditingIdx(null);
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
  };

  return (
    <div className="goal-budget-card">
      <h2>Goal Budget</h2>
      <div className="goal-income-field" style={{ marginBottom: 16 }}>
        <label>
          Monthly Income:
          <input
            type="number"
            value={goalIncome}
            onChange={e => setGoalIncome(e.target.value)}
            placeholder="Enter expected income"
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>
      <div className="add-line-item">
        <input
          name="name"
          value={newItem.name}
          onChange={handleChange}
          placeholder="Line item name"
        />
        <input
          name="amount"
          type="number"
          value={newItem.amount}
          onChange={handleChange}
          placeholder="Amount"
        />
        <select name="category" value={newItem.category} onChange={handleChange}>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <button onClick={addLineItem}>Add</button>
      </div>
      <div className="goal-budget-list">
        {grouped.map(group => (
          <div key={group.category} className="goal-budget-category">
            <h3>{group.category.charAt(0).toUpperCase() + group.category.slice(1)}</h3>
            <ul>
              {group.items.map((item, idx) => (
                <li key={idx}>
                  {editingIdx === `${group.category}-${idx}` ? (
                    <>
                      <input
                        name="name"
                        value={editItem.name}
                        onChange={handleEditChange}
                        style={{ width: 100 }}
                      />
                      <input
                        name="amount"
                        type="number"
                        value={editItem.amount}
                        onChange={handleEditChange}
                        style={{ width: 80, marginLeft: 8 }}
                      />
                      <button onClick={() => handleEditSave(group.category, idx)} style={{ marginLeft: 8 }}>Save</button>
                      <button onClick={handleEditCancel} style={{ marginLeft: 4 }}>Cancel</button>
                      <button onClick={() => handleEditDelete(group.category, idx)} style={{ marginLeft: 4, color: 'red' }}>Delete</button>
                    </>
                  ) : (
                    <span onClick={() => handleEditClick(item, `${group.category}-${idx}`)} style={{ cursor: 'pointer' }}>
                      {item.name}: ${item.amount.toFixed(2)}
                      {goalIncome && (
                        <span style={{ marginLeft: 8, color: '#888' }}>
                          ({((item.amount / goalIncome) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  )}
                </li>
              ))}
              {/* For 'extra', show the remainder */}
              {group.category === 'extra' && (
                <li style={{ fontWeight: 'bold', color: '#4f46e5' }}>
                  Remainder: ${remainder.toFixed(2)}
                  {goalIncome && (
                    <span style={{ marginLeft: 8, color: '#888' }}>
                      ({((remainder / goalIncome) * 100).toFixed(1)}%)
                    </span>
                  )}
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoalBudget;
