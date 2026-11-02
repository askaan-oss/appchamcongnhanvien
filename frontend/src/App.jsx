import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SignalRProvider } from './context/SignalRContext'
import AppRoutes from './routes/AppRoutes'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignalRProvider>
          <AppRoutes />
        </SignalRProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

