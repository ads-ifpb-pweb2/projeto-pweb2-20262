import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { useAppDispatch } from './store/hooks'
import { restaurarSessao } from './store/authSlice'

export default function App() {
  const dispatch = useAppDispatch()

  // RF01.4 — ao carregar a página, tenta restaurar a sessão a partir do token guardado
  useEffect(() => {
    dispatch(restaurarSessao())
  }, [dispatch])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
