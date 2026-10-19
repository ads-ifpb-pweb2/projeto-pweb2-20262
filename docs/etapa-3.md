# Etapa 3 — Microfrontends e WebSockets

Visão geral, perfis, rotas e regras gerais do projeto: [requisitos.md](requisitos.md).

**Temas:** microfrontends com Module Federation e WebSockets com Socket.io.

Os requisitos das etapas 1 e 2 continuam valendo e devem seguir funcionando.

## O que entregar

- RF07 Chat em tempo real.
- RF08 Mais desejados: nova seção do painel de administração, construída como microfrontend com Module Federation.
- Novos testes unitários e e2e para o chat e para o microfrontend.

## Stack e requisitos técnicos

Tudo o que as etapas [1](etapa-1.md) e [2](etapa-2.md) exigem continua valendo. Esta etapa acrescenta:

- **Module Federation:** a seção Mais desejados (RF08) é um microfrontend separado, carregado pela aplicação principal.
- **Socket.io:** cliente Socket.io para as mensagens em tempo real do chat.
- **Testes automatizados:** novos testes unitários e e2e para o chat e para o microfrontend, além dos testes da etapa 2.

## RF07 – Chat

Rotas: `/conversas`, `/conversas/:usuarioId`.

**Redux:** estado `chat` com a lista de conversas (última mensagem e quantidade de não lidas), as mensagens da conversa aberta e o status das requisições; thunks para carregar as conversas, carregar o histórico e enviar mensagens. Cada mensagem recebida pelo Socket.io é despachada como ação para a store. A conexão do Socket.io fica fora do Redux, por não ser um valor serializável.

1. Cada par de estudantes tem uma única conversa contínua, independente de anúncio.
2. O botão "Negociar" no anúncio abre a conversa com o anunciante e insere uma mensagem padronizada que identifica o anúncio (título, foto de capa e preço ou "Doação"), marcando o início de uma nova negociação.
3. Mensagens em tempo real via WebSockets, com Socket.io.
4. Lista de conversas com a última mensagem e indicação de não lidas.
5. Histórico da conversa carregado ao abri-la.
6. Notificação de novas mensagens por Push Notification, enviada pela API. O frontend reaproveita o service worker e a inscrição de push feitos na etapa 2 (RF05.3).

## RF08 – Mais desejados

Rota: `/admin/mais-desejados`.

**Redux:** não usa. O ranking fica no estado local da página.

1. Nova seção do painel de administração, acessível por um item "Mais desejados" no menu do painel.
2. A seção lista os anúncios ordenados pela quantidade de estudantes que os têm na lista de interesse, do maior para o menor, com paginação tradicional.
3. Cada linha mostra a posição no ranking, a foto de capa, o título, o anunciante, a modalidade, o estado e a quantidade de interessados, com link para `/admin/anuncios/:id`.
4. Filtros por modalidade e categoria. Filtros e página ficam na query string. Exemplo: `/admin/mais-desejados?modalidade=doacao&pagina=2`.
5. A seção é um microfrontend separado, integrado com Module Federation: a aplicação principal o carrega na rota `/admin/mais-desejados`. O restante do painel (RF06) continua na aplicação principal.
6. O microfrontend consulta um endpoint público da API, sem token, e não depende da sessão da aplicação principal. Quem protege a rota é a aplicação principal: sem sessão de administrador, `/admin/mais-desejados` redireciona para `/admin/login`, como as demais rotas `/admin`.
