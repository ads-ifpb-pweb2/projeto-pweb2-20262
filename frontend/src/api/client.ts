// Cliente HTTP único do projeto. Todas as chamadas à API passam por `request`.

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const TOKEN_KEY = 'marketplace.token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/** Corpo de toda resposta de erro da API: { mensagem, campos } */
export class ApiError extends Error {
  status: number
  campos: Record<string, string>

  constructor(status: number, mensagem: string, campos: Record<string, string> = {}) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos
  }
}

/** Versão serializável do erro, para o Redux (rejectWithValue) */
export interface ErroSerializado {
  mensagem: string
  campos: Record<string, string>
  status?: number
}

export function serializarErro(e: unknown): ErroSerializado {
  if (e instanceof ApiError) return { mensagem: e.message, campos: e.campos, status: e.status }
  return { mensagem: 'Não foi possível falar com o servidor. Verifique se a API está no ar.', campos: {} }
}

// O store registra aqui o que fazer quando a API responde 401 (token expirado/inválido),
// sem o cliente precisar importar o store (evita import circular).
let aoExpirarSessao: (() => void) | null = null
export function registrarAoExpirarSessao(fn: () => void) {
  aoExpirarSessao = fn
}

type Query = Record<string, string | number | undefined | null>

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Query
  /** Objeto vira JSON; FormData é enviado como multipart (o navegador define o boundary) */
  body?: unknown
  /** Rotas públicas (login/cadastro/listas) não enviam token nem derrubam a sessão em 401 */
  publica?: boolean
}

function montarUrl(path: string, query?: Query) {
  const url = new URL(path, API_URL)
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(chave, String(valor))
    }
  }
  return url.toString()
}

export async function request<T>(path: string, { method = 'GET', query, body, publica }: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = tokenStorage.get()
  if (token && !publica) headers.Authorization = `Bearer ${token}`

  let corpo: BodyInit | undefined
  if (body instanceof FormData) {
    corpo = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    corpo = JSON.stringify(body)
  }

  let resposta: Response
  try {
    resposta = await fetch(montarUrl(path, query), { method, headers, body: corpo })
  } catch {
    throw new ApiError(0, 'Não foi possível falar com o servidor. Verifique se a API está no ar.')
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && !publica) aoExpirarSessao?.()
    let mensagem = 'Algo deu errado. Tente novamente.'
    let campos: Record<string, string> = {}
    try {
      const erro = await resposta.json()
      mensagem = erro.mensagem ?? mensagem
      campos = erro.campos ?? {}
    } catch {
      if (resposta.status === 413) mensagem = 'Arquivo grande demais (máximo de 5 MB por foto).'
    }
    throw new ApiError(resposta.status, mensagem, campos)
  }

  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}
