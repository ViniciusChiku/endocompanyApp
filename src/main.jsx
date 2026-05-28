import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { UIProvider } from './context/UIContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UIProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </UIProvider>
    </AuthProvider>
  </StrictMode>,
)