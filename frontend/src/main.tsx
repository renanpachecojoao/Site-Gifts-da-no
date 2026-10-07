/**
 * Ponto de entrada do frontend: monta o app React na <div id="root"> do index.html.
 * - StrictMode: avisos extras em desenvolvimento.
 * - QueryClientProvider: cache das chamadas à API (TanStack Query).
 * - BrowserRouter: navegação entre páginas.
 * - index.css: tema (cores, fontes) do site.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
