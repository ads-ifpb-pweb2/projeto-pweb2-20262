import { configureStore } from '@reduxjs/toolkit'
import { registrarAoExpirarSessao } from '../api/client'
import authReducer, { sessaoExpirada } from './authSlice'
import anunciosReducer from './anunciosSlice'

// Etapa 1: só `auth` e `anuncios` ficam no Redux (ver docs/etapa-1.md).
// Busca, perfil exibido e formulários ficam em estado local / URL.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    anuncios: anunciosReducer,
  },
})

// Se a API responder 401 em qualquer chamada autenticada, derruba a sessão.
registrarAoExpirarSessao(() => store.dispatch(sessaoExpirada()))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
