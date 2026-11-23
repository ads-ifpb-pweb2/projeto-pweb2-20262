import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import * as authApi from '../api/auth'
import { serializarErro, tokenStorage, type ErroSerializado } from '../api/client'
import type { CadastroRequest, LoginRequest, UsuarioLogado } from '../api/types'

// RF01 — estado `auth`: usuário logado, token e status das requisições (carregando/erro).
// A lista de cursos e os valores dos formulários NÃO ficam aqui (estado local da página).

export type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

interface AuthState {
  usuario: UsuarioLogado | null
  token: string | null
  status: Status
  erro: ErroSerializado | null
  /** false até a tentativa de restaurar a sessão terminar (evita "piscar" para /login no F5) */
  sessaoRestaurada: boolean
}

const initialState: AuthState = {
  usuario: null,
  token: tokenStorage.get(),
  status: 'idle',
  erro: null,
  sessaoRestaurada: false,
}

type Rejeitado = { rejectValue: ErroSerializado }

export const cadastrar = createAsyncThunk<{ token: string; usuario: UsuarioLogado }, CadastroRequest, Rejeitado>(
  'auth/cadastrar',
  async (dados, { rejectWithValue }) => {
    try {
      const { token, usuario } = await authApi.cadastrar(dados)
      tokenStorage.set(token)
      return { token, usuario }
    } catch (e) {
      return rejectWithValue(serializarErro(e))
    }
  },
)

export const entrar = createAsyncThunk<{ token: string; usuario: UsuarioLogado }, LoginRequest, Rejeitado>(
  'auth/entrar',
  async (dados, { rejectWithValue }) => {
    try {
      const { token, usuario } = await authApi.entrar(dados)
      tokenStorage.set(token)
      return { token, usuario }
    } catch (e) {
      return rejectWithValue(serializarErro(e))
    }
  },
)

/** Chamada na inicialização do app: se há token guardado, busca o usuário em GET /usuarios/eu */
export const restaurarSessao = createAsyncThunk<UsuarioLogado | null, void, Rejeitado>(
  'auth/restaurarSessao',
  async (_, { rejectWithValue }) => {
    if (!tokenStorage.get()) return null
    try {
      return await authApi.buscarUsuarioLogado()
    } catch (e) {
      tokenStorage.clear()
      return rejectWithValue(serializarErro(e))
    }
  },
)

/** O logout é só local: a API é stateless (JWT), não há endpoint de logout. */
export const sair = createAsyncThunk('auth/sair', async () => {
  tokenStorage.clear()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Usado pelo RF02: ao salvar dados/foto do perfil, atualiza o usuário logado */
    usuarioAtualizado(state, action: PayloadAction<UsuarioLogado>) {
      state.usuario = action.payload
    },
    /** Disparado pelo cliente HTTP quando a API responde 401 */
    sessaoExpirada(state) {
      tokenStorage.clear()
      state.usuario = null
      state.token = null
    },
    limparErro(state) {
      state.erro = null
      state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    const iniciar = (state: AuthState) => {
      state.status = 'loading'
      state.erro = null
    }
    const sessaoIniciada = (state: AuthState, action: PayloadAction<{ token: string; usuario: UsuarioLogado }>) => {
      state.status = 'succeeded'
      state.token = action.payload.token
      state.usuario = action.payload.usuario
    }
    const falhou = (state: AuthState, action: { payload?: ErroSerializado }) => {
      state.status = 'failed'
      state.erro = action.payload ?? { mensagem: 'Erro inesperado.', campos: {} }
    }

    builder
      .addCase(cadastrar.pending, iniciar)
      .addCase(cadastrar.fulfilled, sessaoIniciada)
      .addCase(cadastrar.rejected, falhou)
      .addCase(entrar.pending, iniciar)
      .addCase(entrar.fulfilled, sessaoIniciada)
      .addCase(entrar.rejected, falhou)
      .addCase(restaurarSessao.fulfilled, (state, action) => {
        state.usuario = action.payload
        if (!action.payload) state.token = null
        state.sessaoRestaurada = true
      })
      .addCase(restaurarSessao.rejected, (state) => {
        state.usuario = null
        state.token = null
        state.sessaoRestaurada = true
      })
      .addCase(sair.fulfilled, (state) => {
        state.usuario = null
        state.token = null
        state.status = 'idle'
        state.erro = null
      })
  },
})

export const { usuarioAtualizado, sessaoExpirada, limparErro } = authSlice.actions
export default authSlice.reducer
