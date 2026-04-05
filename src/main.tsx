import '@khmyznikov/pwa-install'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App'
import { LandingPage } from './components/landing/LandingPage'
import { initLogger } from './lib/logger'
import './styles/index.css'

// Initialize error logger
initLogger()

// Remove splash screen after animations finish (~2.5s)
setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.style.opacity = '0'
    setTimeout(() => splash.remove(), 400)
  }
}, 2500)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
