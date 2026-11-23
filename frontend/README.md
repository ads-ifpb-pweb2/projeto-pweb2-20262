# Frontend — Marketplace IFPB Cajazeiras

React + TypeScript + Vite, React Router, Redux Toolkit (thunks), UI própria e Storybook.
Requisitos da Etapa 1: [`../docs/etapa-1.md`](../docs/etapa-1.md).

## Rodar

```bash
# 1) Backend (na raiz do repositório) — antes de subir, a equipe fecha as categorias no V2__carga.sql
cp .env.example .env
docker compose up --build        # API em http://localhost:8080 (Swagger em /swagger-ui.html)

# 2) Frontend
cd frontend
npm install
npm run dev                      # http://localhost:5173
npm run storybook                # http://localhost:6006
```

Login de teste (carga do professor): `estudante@academico.ifpb.edu.br` / `senha123`.
Para apontar para outra API: copie `.env.example` para `.env.local` e ajuste `VITE_API_URL`.

## Estrutura

```
src/
  api/          client.ts (fetch + token + erros), types.ts (espelha os DTOs), um arquivo por domínio
  store/        index.ts, hooks.ts, authSlice.ts (RF01), anunciosSlice.ts (RF03)
  routes/       index.tsx (todas as rotas da etapa 1), ProtectedRoute.tsx
  pages/        uma página por rota
  components/   ui/ (kit com .stories.tsx), layout/
  utils/        formatar.ts (preço, data, validação do e-mail institucional)
```

## Regras de ouro (o que vai no Redux)

- **Redux só tem `auth` e `anuncios`.** Chamadas que mexem nesses estados partem de **thunks**.
- **Busca (RF04), perfil exibido (RF02) e formulários**: estado local da página (`useState` / hook como `usePerfil(id)`).
- **Filtros, ordenação e página da busca ficam só na URL** (`useSearchParams`).
- **Componentes de UI sem biblioteca pronta**, cada um com `*.stories.tsx` ao lado.
- Chamadas HTTP só pelos arquivos de `src/api/`; nunca `fetch` direto em página.

## Divisão da Etapa 1

| Quem | O que | Arquivos principais |
| --- | --- | --- |
| A | Base + RF01 (já esqueleto pronto: ajustar/testar fluxo, sessão, 401) | `store/authSlice.ts`, `routes/`, `pages/Login`, `pages/Cadastro` |
| B | Kit de UI + Storybook (Card, Pagination, Modal, Galeria, Upload de fotos, Badge…) | `components/ui/` |
| C | RF03 — anúncios (criar, editar, detalhe, estado, fotos) | `store/anunciosSlice.ts`, `pages/Anuncio*` |
| D | RF04 busca + RF02 perfil | `pages/Vendas`, `pages/Doacoes`, `pages/Perfil*`, `pages/Usuario` |

Cada página stub tem, no topo, um comentário com o que implementar e qual função da API usar.

## Gotchas da API

- Preço chega em **reais** (`number`) e é enviado como string com ponto (`"80.00"`). Doação não envia preço.
- Criar/editar anúncio e enviar foto de perfil são **multipart/form-data** (já tratado em `api/anuncios.ts` e `api/usuarios.ts`).
- URLs de fotos são **assinadas e expiram em 1 hora**.
- Erros vêm como `{ mensagem, campos }`; `ApiError` e `serializarErro` já fazem isso.
- Qualquer 401 em rota autenticada derruba a sessão automaticamente (ver `store/index.ts`).
