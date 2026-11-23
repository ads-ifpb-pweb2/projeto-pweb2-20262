import { request } from './client'
import type { Categoria, Curso, OpcaoEstadoConservacao } from './types'

// Listas públicas, sem token. Servem para popular selects de formulários e filtros.
export const listarCursos = () => request<Curso[]>('/cursos', { publica: true })
export const listarCategorias = () => request<Categoria[]>('/categorias', { publica: true })
export const listarEstadosConservacao = () =>
  request<OpcaoEstadoConservacao[]>('/estados-conservacao', { publica: true })
