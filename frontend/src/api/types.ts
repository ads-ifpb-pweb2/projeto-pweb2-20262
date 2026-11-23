// Tipos que espelham os DTOs da API do professor (backend/src/main/java/.../*.java).
// Fonte da verdade: Swagger em http://localhost:8080/swagger-ui.html

export type Modalidade = 'venda' | 'doacao'
export type EstadoAnuncio = 'ativo' | 'pausado' | 'reservado' | 'vendido' | 'concluido'
export type EstadoConservacao = 'novo' | 'seminovo' | 'usado'
export type Papel = 'estudante' | 'administrador'
export type Ordem = 'data' | 'preco'
export type Direcao = 'asc' | 'desc'

export interface Curso {
  id: number
  nome: string
}

export interface Categoria {
  id: number
  nome: string
  /** Valor do filtro `categoria` da busca (?categoria=eletronicos) */
  slug: string
}

export interface OpcaoEstadoConservacao {
  valor: EstadoConservacao
  rotulo: string
}

export interface UsuarioLogado {
  id: number
  nome: string
  email: string
  curso: Curso
  telefone: string | null
  /** URL assinada, válida por 1 hora */
  fotoUrl: string | null
  papel: Papel
}

export interface Perfil {
  id: number
  nome: string
  curso: Curso
  telefone: string | null
  fotoUrl: string | null
}

export interface SessaoResposta {
  token: string
  expiraEm: string
  usuario: UsuarioLogado
}

export interface CadastroRequest {
  nome: string
  email: string
  senha: string
  cursoId: number
  telefone?: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface AtualizarUsuarioRequest {
  nome: string
  cursoId: number
  /** Vazio ou nulo remove o telefone */
  telefone?: string | null
}

export interface AnuncianteResumo {
  id: number
  nome: string
}

export interface AnuncioResumo {
  id: number
  titulo: string
  modalidade: Modalidade
  /** Em reais; null em doações */
  preco: number | null
  estado: EstadoAnuncio
  estadoConservacao: EstadoConservacao
  categoria: Categoria
  capaUrl: string
  anunciante: AnuncianteResumo
  publicadoEm: string
}

export interface FotoAnuncio {
  id: number
  url: string
  capa: boolean
}

export interface AnuncioDetalhe {
  id: number
  titulo: string
  descricao: string
  modalidade: Modalidade
  preco: number | null
  estado: EstadoAnuncio
  estadoConservacao: EstadoConservacao
  categoria: Categoria
  localEntrega: string
  capaUrl: string
  fotos: FotoAnuncio[]
  anunciante: Perfil
  publicadoEm: string
  atualizadoEm: string
}

/** Formato de resposta de toda listagem paginada */
export interface Pagina<T> {
  itens: T[]
  pagina: number
  tamanho: number
  total: number
  totalPaginas: number
}

export const TAMANHOS_PAGINA = [5, 10, 25, 50] as const

/** Parâmetros da busca em /vendas e /doacoes (a mesma forma vai na query string da URL) */
export interface FiltrosBusca {
  categoria?: string
  precoMin?: string
  precoMax?: string
  ordem?: Ordem
  direcao?: Direcao
  pagina?: number
  tamanho?: number
}

/** Campos do formulário de anúncio (criação e edição) */
export interface DadosAnuncioForm {
  titulo: string
  descricao: string
  modalidade: Modalidade
  /** Em reais, com ponto decimal ("80.00"). Obrigatório em vendas; omitido em doações */
  preco?: string
  estadoConservacao: EstadoConservacao
  categoriaId: number
  localEntrega: string
  /** Arquivos novos (1 a 10 no total) */
  fotos: File[]
  /** Posição, em `fotos`, da foto nova que será a capa */
  capaIndice?: number
  // só na edição:
  /** Ids das fotos atuais que continuam, na ordem de exibição */
  fotosMantidas?: number[]
  /** Id de uma foto mantida para ser a capa (alternativa a capaIndice) */
  capaId?: number
}
