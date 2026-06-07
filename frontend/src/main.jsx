import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { registerServiceWorker } from "./utils/sw-register"

// Register the service worker once during startup so the app can support offline caching.
registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter owns navigation/history for the whole app before App mounts any routes. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
