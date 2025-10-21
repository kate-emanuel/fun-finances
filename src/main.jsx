import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const rootEl = document.getElementById('root')
const statusEl = document.getElementById('status')
if (statusEl) statusEl.style.display = 'block'

function MountWatcher({ children }) {
  // remove the fallback status once React has mounted
  useEffect(() => {
    if (!statusEl) return
    try {
      statusEl.remove()
    } catch (e) {
      statusEl.style.display = 'none'
    }
  }, [])

  return children
}

createRoot(rootEl).render(
  <React.StrictMode>
    <MountWatcher>
      <App />
    </MountWatcher>
  </React.StrictMode>
)
