import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { CourseRegistrationsProvider } from './contexts/CourseRegistrationsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CourseRegistrationsProvider>
        <App />
      </CourseRegistrationsProvider>
    </AuthProvider>
  </StrictMode>,
)
