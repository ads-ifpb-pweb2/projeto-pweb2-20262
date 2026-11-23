import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicOnlyRoute, ProtectedRoute } from './ProtectedRoute'
import { Layout } from '../components/layout/Layout'
import { Login } from '../pages/Login'
import { Cadastro } from '../pages/Cadastro'
import { Vendas } from '../pages/Vendas'
import { Doacoes } from '../pages/Doacoes'
import { AnuncioNovo } from '../pages/AnuncioNovo'
import { AnuncioDetalhePage } from '../pages/AnuncioDetalhe'
import { AnuncioEditar } from '../pages/AnuncioEditar'
import { Perfil } from '../pages/Perfil'
import { PerfilEditar } from '../pages/PerfilEditar'
import { Usuario } from '../pages/Usuario'
import { NaoEncontrada } from '../pages/NaoEncontrada'

// Rotas da Etapa 1 (ver docs/requisitos.md). As rotas de /interesses, /conversas e /admin
// entram nas etapas 2 e 3.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/vendas" replace />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/doacoes" element={<Doacoes />} />
          <Route path="/anuncios/novo" element={<AnuncioNovo />} />
          <Route path="/anuncios/:id" element={<AnuncioDetalhePage />} />
          <Route path="/anuncios/:id/editar" element={<AnuncioEditar />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/editar" element={<PerfilEditar />} />
          <Route path="/usuarios/:id" element={<Usuario />} />
        </Route>
      </Route>

      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}
