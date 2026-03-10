import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'


// AuthProvider must wrap the app due to the Firebase Auth states.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> 
    <App />
    </AuthProvider>
  </StrictMode>,
)
