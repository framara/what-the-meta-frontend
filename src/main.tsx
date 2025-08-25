import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { FilterProvider } from './components/FilterContext'
import LazyToaster from './components/LazyToaster'
import './index.css'

// Guard console debugging in production unless explicitly enabled
(() => {
  const isDev = import.meta.env?.DEV === true;
  const debugFlag = (import.meta.env?.VITE_DEBUG ?? '').toString().trim().toLowerCase();
  const isDebug = ['1', 'true', 'yes', 'on'].includes(debugFlag);
  if (!isDev && !isDebug) {
    const noop = () => { };
    // Preserve errors and warnings; silence log/debug/info/trace
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).log = noop;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).debug = noop;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).info = noop;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any).trace = noop;
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FilterProvider>
      <App />
      <LazyToaster />
    </FilterProvider>
  </React.StrictMode>,
)
