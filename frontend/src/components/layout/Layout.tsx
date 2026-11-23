import { NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { sair } from '../../store/authSlice'
import { Button } from '../ui/Button'
import styles from './Layout.module.css'

const classe = ({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.ativo : ''}`

/** Navbar + área de conteúdo das rotas de estudante. Novas rotas (interesses, conversas) entram nas etapas 2 e 3. */
export function Layout() {
  const dispatch = useAppDispatch()
  const usuario = useAppSelector((s) => s.auth.usuario)

  return (
    <>
      <header className={styles.cabecalho}>
        <nav className={styles.barra}>
          <NavLink to="/vendas" className={styles.marca}>Marketplace IFPB</NavLink>
          <NavLink to="/vendas" className={classe}>Vendas</NavLink>
          <NavLink to="/doacoes" className={classe}>Doações</NavLink>
          <NavLink to="/anuncios/novo" className={classe}>Anunciar</NavLink>
          <NavLink to="/perfil" className={classe}>{usuario?.nome ?? 'Perfil'}</NavLink>
          <Button variante="secundario" onClick={() => dispatch(sair())}>Sair</Button>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
