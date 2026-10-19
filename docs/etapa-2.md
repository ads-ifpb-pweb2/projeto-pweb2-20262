# Etapa 2 — Service Workers

Visão geral, perfis, rotas e regras gerais do projeto: [requisitos.md](requisitos.md).

**Temas:** Service Workers (cache e notificações).

Os requisitos da etapa 1 continuam valendo e devem seguir funcionando.

## O que entregar

- RF05 Lista de interesse e RF06 Administração.
- RF02.4: em `/perfil`, o anúncio removido pelo administrador continua visível só para o dono, marcado como "Removido pelo administrador" e com o motivo.
- Service worker com cache e Push Notification (detalhes abaixo).
- No mínimo 10 testes unitários e 5 testes end-to-end (e2e).

## Stack e requisitos técnicos

Tudo o que a [etapa 1](etapa-1.md) exige continua valendo. Esta etapa acrescenta:

- **Service worker:** cache da casca da aplicação e Push Notification, conforme a seção abaixo.
- **Testes automatizados:** no mínimo 10 testes unitários e 5 testes end-to-end (e2e).

## Service worker

1. O service worker guarda em cache só a casca da aplicação (HTML, CSS, JavaScript e ícones). Sem conexão, a aplicação abre e mostra uma tela de "sem conexão"; dados da API não ficam em cache.
2. O frontend pede ao estudante a permissão de notificação, registra o service worker e envia a inscrição de push para a API. Essa inscrição é usada pelo RF05.3 e pelo RF06.7, e depois pelo chat na etapa 3.

## RF05 – Lista de interesse

Rota: `/interesses`.

**Redux:** estado `interesses` com os anúncios da lista de interesse e o status das requisições; thunks para carregar, adicionar e remover. O botão "Tenho interesse" do detalhe do anúncio lê este estado para saber se o anúncio já está na lista.

1. O estudante adiciona e remove anúncios da sua lista de interesse.
2. A lista indica quando um anúncio mudou de estado (pausado, reservado, vendido ou concluído) ou foi removido.
3. Quando outro estudante adiciona um anúncio à lista de interesse, o anunciante recebe uma Push Notification enviada pela API.

## RF06 – Administração

Rotas: `/admin/login`, `/admin`, `/admin/anuncios`, `/admin/anuncios/:id`.

**Redux:** estado `admin` só com a sessão do administrador (separada de `auth`) e o status do login; thunks de login e logout. A listagem, o detalhe e a remoção ficam fora do Redux, no estado local de cada página, e os filtros ficam só na URL.

1. O administrador entra por `/admin/login` e usa um painel próprio, separado das telas dos estudantes. A rota `/admin` redireciona para `/admin/anuncios`.
2. `/admin/anuncios` lista os anúncios de todos os estudantes, em qualquer estado (ativo, pausado, reservado, vendido ou concluído), com paginação tradicional. Anúncios removidos não aparecem.
3. Cada linha mostra foto de capa, título, anunciante, modalidade, estado e data de publicação, com link para o detalhe e um botão "Remover".
4. A listagem tem filtros por modalidade, categoria e estado, busca por título e ordenação por mais recentes. Filtros, ordenação e página ficam na query string. Exemplo: `/admin/anuncios?modalidade=venda&estado=ativo&busca=notebook&pagina=2`.
5. `/admin/anuncios/:id` mostra o anúncio completo (galeria de fotos, dados e anunciante) e o botão "Remover".
6. Remover, na listagem ou no detalhe, abre uma confirmação com o campo de motivo, obrigatório. Depois de confirmada, o anúncio sai da listagem, e quem estava no detalhe volta para `/admin/anuncios`.
7. O anunciante recebe uma Push Notification, enviada pela API, avisando que o anúncio foi removido e com o motivo da remoção.
