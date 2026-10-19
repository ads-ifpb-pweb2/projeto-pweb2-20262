# Marketplace IFPB Cajazeiras — Requisitos

## Visão geral

Aplicação web (somente frontend, em React) para estudantes do Campus Cajazeiras do IFPB anunciarem itens para venda ou doação e negociarem por chat interno. O backend é fornecido pelo professor e está disponível desde a primeira etapa.

- **Público:** exclusivamente estudantes do Campus Cajazeiras, com e-mail `@academico.ifpb.edu.br`.
- **Modalidades:** venda e doação. Não há trocas nem pagamento pela plataforma; a negociação acontece no chat e a entrega, presencialmente.
- **Categorias iniciais:** livros e eletrônicos. Cada equipe pode acrescentar ou trocar categorias editando os scripts SQL de carga da API, o que diferencia os projetos entre si.
- **Formato:** grupos de até 4 alunos, projeto dividido em 3 etapas.

## Perfis e permissões

Há três perfis. O visitante é quem ainda não está autenticado: ele só pode se cadastrar e fazer login, e nenhuma outra tela é acessível sem autenticação.

| Ação | Visitante | Estudante | Administrador |
| --- | --- | --- | --- |
| Cadastrar-se pelo sistema | Sim | — | Não |
| Fazer login | Sim | — | — |
| Ver anúncios, buscar e filtrar | Não | Sim | Sim |
| Criar e editar os próprios anúncios | Não | Sim | Não |
| Alterar o estado dos próprios anúncios | Não | Sim | Não |
| Manter lista de interesse | Não | Sim | Não |
| Conversar pelo chat | Não | Sim | Não |
| Remover anúncio de qualquer usuário | Não | Não | Sim |

O administrador é um servidor do campus, com e-mail de qualquer domínio, cadastrado diretamente no banco de dados. Ele não anuncia nem conversa; seu papel é apenas moderar. Ele entra pela rota `/admin`, que tem login próprio, separado do login dos estudantes.

## Rotas

As rotas de estudante e as de administrador são separadas: um estudante que acessa `/admin` volta para `/vendas`, e um administrador só usa as rotas que começam com `/admin`.

| Rota | Tela | Perfil | Requisito |
| --- | --- | --- | --- |
| `/login` | Login do estudante | Visitante | RF01 |
| `/cadastro` | Cadastro | Visitante | RF01 |
| `/` | Redireciona para `/vendas` | Estudante | RF04 |
| `/vendas` | Busca de itens à venda | Estudante | RF04 |
| `/doacoes` | Busca de itens em doação | Estudante | RF04 |
| `/anuncios/novo` | Criação de anúncio | Estudante | RF03 |
| `/anuncios/:id` | Detalhe do anúncio | Estudante | RF03 |
| `/anuncios/:id/editar` | Edição do anúncio (só o dono) | Estudante | RF03 |
| `/perfil` | Próprio perfil, com todos os seus anúncios | Estudante | RF02 |
| `/perfil/editar` | Edição dos próprios dados e da foto | Estudante | RF02 |
| `/usuarios/:id` | Perfil de outro estudante | Estudante | RF02 |
| `/interesses` | Lista de interesse | Estudante | RF05 |
| `/conversas` | Lista de conversas | Estudante | RF06 |
| `/conversas/:usuarioId` | Conversa com um estudante | Estudante | RF06 |
| `/admin/login` | Login do administrador | Visitante | RF07 |
| `/admin` | Painel com a listagem geral de anúncios | Administrador | RF07 |
| `*` | Página não encontrada | Todos | — |

## Requisitos funcionais

### RF01 – Autenticação e cadastro

Rotas: `/login`, `/cadastro`.

1. Cadastro com nome, e-mail, senha, curso e contato (opcional).
2. O formulário rejeita e-mails fora do domínio `@academico.ifpb.edu.br`, com mensagem de erro clara (a API também valida).
3. O curso é escolhido em uma lista com os cursos do campus, fornecida pela API.
4. Login, logout e manutenção da sessão (token) entre recarregamentos da página.
5. Todas as rotas, exceto `/login`, `/cadastro` e `/admin/login`, são protegidas. Sem sessão, as rotas de estudante redirecionam para `/login`, e as rotas `/admin` redirecionam para `/admin/login`.

### RF02 – Perfil

Rotas: `/perfil`, `/perfil/editar`, `/usuarios/:id`.

1. O perfil exibe foto, nome, curso, contato e os anúncios do usuário. Os demais estudantes veem apenas os anúncios ativos; pausados, reservados, vendidos e concluídos ficam visíveis só para o dono.
2. O usuário edita os próprios dados e envia ou troca a foto de perfil.
3. Qualquer estudante pode ver o perfil de outro estudante a partir de um anúncio.

### RF03 – Anúncios

Rotas: `/anuncios/novo`, `/anuncios/:id`, `/anuncios/:id/editar`.

1. Campos: título, descrição, modalidade (venda ou doação), preço, estado de conservação, categoria, local de entrega (texto livre) e fotos.
2. Preço é obrigatório em vendas e oculto em doações.
3. Upload de 1 a 10 fotos, com pré-visualização, remoção e escolha da foto de capa.
4. Estados: ativo, pausado, reservado e vendido. Em doações, o estado final se chama "concluído". Apenas o anunciante altera o estado e edita o anúncio.
5. A publicação é imediata, sem moderação prévia.
6. Página de detalhe com galeria de fotos, dados do anúncio, link para o perfil do anunciante e botões "Tenho interesse" e "Negociar".

### RF04 – Busca e listagem

Rotas: `/vendas`, `/doacoes` (e `/`, que redireciona para `/vendas`).

1. Duas telas de busca separadas: uma para itens à venda e outra para itens em doação.
2. As duas listam apenas anúncios ativos, com paginação tradicional.
3. Vendas: filtros por categoria e faixa de preço; ordenação por mais recentes e por menor preço.
4. Doações: filtro por categoria; ordenação por mais recentes.
5. Filtros, ordenação e página ficam na URL (query string), para que a busca possa ser compartilhada e restaurada. Exemplo: `/vendas?categoria=livros&precoMin=10&precoMax=50&ordem=preco&pagina=2`.

### RF05 – Lista de interesse

Rota: `/interesses`.

1. O estudante adiciona e remove anúncios da sua lista de interesse.
2. A lista indica quando um anúncio mudou de estado (pausado, reservado, vendido ou concluído) ou foi removido.
3. Quando outro estudante adiciona um anúncio à lista de interesse, o anunciante recebe uma Push Notification enviada pela API.

### RF06 – Chat

Rotas: `/conversas`, `/conversas/:usuarioId`.

1. Cada par de estudantes tem uma única conversa contínua, independente de anúncio.
2. O botão "Negociar" no anúncio abre a conversa com o anunciante e insere uma mensagem padronizada que identifica o anúncio (título, foto de capa e preço ou "Doação"), marcando o início de uma nova negociação.
3. Mensagens em tempo real via WebSockets, com Socket.io.
4. Lista de conversas com a última mensagem e indicação de não lidas.
5. Histórico da conversa carregado ao abri-la.
6. Notificação de novas mensagens por Push Notification, enviada pela API. O frontend pede a permissão ao usuário, registra o service worker e envia a inscrição para a API.

### RF07 – Administração

Rotas: `/admin/login`, `/admin`.

1. O administrador entra por `/admin/login` e usa um painel próprio em `/admin`, separado das telas dos estudantes, com a listagem geral de anúncios.
2. Pelo painel, ele remove qualquer anúncio, informando obrigatoriamente o motivo.
3. O anunciante recebe um e-mail com o motivo da remoção (enviado pela API).

## Requisitos técnicos e pedagógicos

- **Stack obrigatória:** React com TypeScript, React Router, Redux (com thunks), Module Federation para os microfrontends e Socket.io para os WebSockets.
- **UI própria:** os grupos criam os próprios componentes, sem biblioteca de componentes pronta.
- **Storybook:** todos os componentes de UI documentados em um Storybook, que só precisa rodar localmente.
- **Backend:** API REST e servidor Socket.io fornecidos pelo professor desde a primeira etapa. Cada equipe roda a API na própria máquina e pode alterar o script SQL de carga, por exemplo para cadastrar categorias. O script e a documentação da API serão disponibilizados junto com o backend.
- **Fora do escopo por enquanto:** responsividade, acessibilidade, deploy e regras de Git não são cobrados.

## Etapas

O projeto tem 3 etapas. Cada uma introduz um tema da disciplina e entrega um bloco de requisitos funcionais que usa esse tema.

| Etapa | Temas | Entregas |
| --- | --- | --- |
| 1 | React básico com hooks, React Router e Redux | RF01 Autenticação e cadastro, RF02 Perfil, RF03 Anúncios e RF04 Busca e listagem; sessão e dados compartilhados em Redux; componentes de UI documentados no Storybook |
| 2 | Thunks (ações assíncronas no Redux) e Service Workers (cache e notificações) | Chamadas à API feitas por thunks; RF05 Lista de interesse; cache de recursos e anúncios pelo service worker; Push Notification ao anunciante quando alguém demonstra interesse no anúncio dele (RF05.3) |
| 3 | Microfrontends com Module Federation e WebSockets com Socket.io | RF06 Chat em tempo real; RF07 Administração como microfrontend separado das telas dos estudantes, carregado nas rotas `/admin` |

- [ ] Definir as datas de entrega de cada etapa.
- [ ] Disponibilizar o backend, o script SQL de carga e a documentação da API.
