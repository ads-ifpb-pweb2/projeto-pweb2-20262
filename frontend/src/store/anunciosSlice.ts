import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as anunciosApi from '../api/anuncios'
import { serializarErro, type ErroSerializado } from '../api/client'
import type { AnuncioDetalhe, DadosAnuncioForm, EstadoAnuncio } from '../api/types'
import type { Status } from './authSlice'

// RF03 — estado `anuncios`: o anúncio em detalhe e o status das requisições.
// O formulário em edição e a pré-visualização das fotos ficam em estado LOCAL da página.
// A lista de resultados da busca (RF04) NÃO usa Redux.

interface AnunciosState {
  detalhe: AnuncioDetalhe | null
  status: Status
  erro: ErroSerializado | null
}

const initialState: AnunciosState = { detalhe: null, status: 'idle', erro: null }

type Rejeitado = { rejectValue: ErroSerializado }

export const buscarAnuncio = createAsyncThunk<AnuncioDetalhe, number, Rejeitado>(
  'anuncios/buscar',
  async (id, { rejectWithValue }) => {
    try {
      return await anunciosApi.buscarAnuncio(id)
    } catch (e) {
      return rejectWithValue(serializarErro(e))
    }
  },
)

export const criarAnuncio = createAsyncThunk<AnuncioDetalhe, DadosAnuncioForm, Rejeitado>(
  'anuncios/criar',
  async (dados, { rejectWithValue }) => {
    try {
      return await anunciosApi.criarAnuncio(dados)
    } catch (e) {
      return rejectWithValue(serializarErro(e))
    }
  },
)

export const editarAnuncio = createAsyncThunk<
  AnuncioDetalhe,
  { id: number; dados: DadosAnuncioForm },
  Rejeitado
>('anuncios/editar', async ({ id, dados }, { rejectWithValue }) => {
  try {
    return await anunciosApi.editarAnuncio(id, dados)
  } catch (e) {
    return rejectWithValue(serializarErro(e))
  }
})

export const alterarEstadoAnuncio = createAsyncThunk<
  AnuncioDetalhe,
  { id: number; estado: EstadoAnuncio },
  Rejeitado
>('anuncios/alterarEstado', async ({ id, estado }, { rejectWithValue }) => {
  try {
    return await anunciosApi.alterarEstado(id, estado)
  } catch (e) {
    return rejectWithValue(serializarErro(e))
  }
})

const anunciosSlice = createSlice({
  name: 'anuncios',
  initialState,
  reducers: {
    limparAnuncio(state) {
      state.detalhe = null
      state.status = 'idle'
      state.erro = null
    },
  },
  extraReducers: (builder) => {
    // Todos os thunks seguem o mesmo ciclo: loading -> (succeeded + detalhe) | failed
    for (const thunk of [buscarAnuncio, criarAnuncio, editarAnuncio, alterarEstadoAnuncio]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading'
          state.erro = null
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'succeeded'
          state.detalhe = action.payload
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed'
          state.erro = (action.payload as ErroSerializado | undefined) ?? {
            mensagem: 'Erro inesperado.',
            campos: {},
          }
        })
    }
  },
})

export const { limparAnuncio } = anunciosSlice.actions
export default anunciosSlice.reducer
