import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const params = new URLSearchParams(location.search)
if (params.get('devtoken')) {
  localStorage.setItem('token', params.get('devtoken')!)
  localStorage.setItem('user', params.get('devuser')!)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
