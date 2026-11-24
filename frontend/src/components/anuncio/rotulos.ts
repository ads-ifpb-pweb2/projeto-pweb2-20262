import type { EstadoAnuncio, EstadoConservacao, Modalidade } from '../../api/types'

export const ROTULO_CONSERVACAO: Record<EstadoConservacao, string> = {
  novo: 'Novo',
  seminovo: 'Seminovo',
  usado: 'Usado',
}

export const ESTADOS_POR_MODALIDADE: Record<Modalidade, EstadoAnuncio[]> = {
  venda: ['ativo', 'pausado', 'reservado', 'vendido'],
  doacao: ['ativo', 'pausado', 'reservado', 'concluido'],
}
