import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { FilterProvider } from './components/FilterContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FilterProvider>
      <App />
      <Toaster 
        position="bottom-right"
        toastOptions={{ 
          duration: 4500,
          style: {
            background: '#111827', // gray-900
            color: '#E5E7EB',      // gray-200
            border: '1px solid #1F2937', // gray-800
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)',
            borderRadius: '10px',
            padding: '12px 14px'
          },
          iconTheme: {
            primary: '#60A5FA',    // blue-400
            secondary: '#111827'
          },
          success: {
            style: { borderColor: '#059669' } // green-600
          },
          error: {
            style: { borderColor: '#DC2626' } // red-600
          }
        }} 
      />
    </FilterProvider>
  </React.StrictMode>,
)
