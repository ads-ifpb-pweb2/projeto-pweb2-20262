import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { Spinner } from '../components/ui/Spinner'

/** RF01.5 — sem sessão, rotas de estudante redirecionam para /login */
export function ProtectedRoute() {
  const { usuario, sessaoRestaurada } = useAppSelector((s) => s.auth)
  const local = useLocation()

  if (!sessaoRestaurada) return <Spinner tela />
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname + local.search }} />
  return <Outlet />
}

/** /login e /cadastro: quem já está logado vai para a rota de onde veio (ou /vendas) */
export function PublicOnlyRoute() {
  const { usuario, sessaoRestaurada } = useAppSelector((s) => s.auth)
  const local = useLocation()
  const destino = (local.state as { de?: string } | null)?.de ?? '/vendas'

  if (!sessaoRestaurada) return <Spinner tela />
  if (usuario) return <Navigate to={destino} replace />
  return <Outlet />
}
