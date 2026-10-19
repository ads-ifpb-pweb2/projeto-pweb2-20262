# Marketplace IFPB Cajazeiras — Requisitos

## Visão geral

Aplicação web (somente frontend, em React) para estudantes do Campus Cajazeiras do IFPB anunciarem itens para venda ou doação e negociarem por chat interno. O backend é fornecido pelo professor e está disponível desde a primeira etapa.

- **Público:** exclusivamente estudantes do Campus Cajazeiras, com e-mail `@academico.ifpb.edu.br`.
- **Modalidades:** venda e doação. Não há trocas nem pagamento pela plataforma; a negociação acontece no chat e a entrega, presencialmente.
- **Categorias:** decididas pelos alunos. Cada equipe define uma ou mais categorias editando os scripts SQL de carga da API, o que diferencia os projetos entre si. Por exemplo, uma equipe pode fazer um marketplace de produtos artesanais e outra, um de equipamentos.
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
| Ver os anúncios mais desejados | Não | Não | Sim |

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
| `/conversas` | Lista de conversas | Estudante | RF07 |
| `/conversas/:usuarioId` | Conversa com um estudante | Estudante | RF07 |
| `/admin/login` | Login do administrador | Visitante | RF06 |
| `/admin` | Redireciona para `/admin/anuncios` | Administrador | RF06 |
| `/admin/anuncios` | Listagem geral de anúncios, com filtros e remoção | Administrador | RF06 |
| `/admin/anuncios/:id` | Detalhe do anúncio, com remoção | Administrador | RF06 |
| `/admin/mais-desejados` | Ranking dos anúncios com mais interessados (microfrontend) | Administrador | RF08 |
| `*` | Página não encontrada | Todos | — |

## Requisitos funcionais

Os requisitos funcionais estão nos arquivos de cada etapa, junto com tudo o que a etapa entrega:

- [Etapa 1](etapa-1.md): RF01 Autenticação e cadastro, RF02 Perfil, RF03 Anúncios, RF04 Busca e listagem
- [Etapa 2](etapa-2.md): RF05 Lista de interesse, RF06 Administração
- [Etapa 3](etapa-3.md): RF07 Chat, RF08 Mais desejados

## Requisitos técnicos e pedagógicos

A stack e os requisitos técnicos obrigatórios estão no arquivo de cada etapa, separados pelo que cada uma exige. Resumo:

| Etapa | Acrescenta |
| --- | --- |
| [1](etapa-1.md) | React com TypeScript, React Router, Redux com thunks, UI própria e Storybook |
| [2](etapa-2.md) | Service worker (cache e push) e testes unitários e e2e |
| [3](etapa-3.md) | Module Federation, Socket.io e novos testes |

Vale para todas as etapas:

- **Backend:** API REST e servidor Socket.io fornecidos pelo professor desde a primeira etapa. Cada equipe roda a API na própria máquina e pode alterar o script SQL de carga, por exemplo para cadastrar categorias. O script e a documentação da API serão disponibilizados junto com o backend.

## Etapas

O projeto tem 3 etapas. Cada uma introduz um tema da disciplina e entrega um bloco de requisitos funcionais que usa esse tema. O detalhe de cada etapa está no seu arquivo.

| Etapa | Temas | Requisitos funcionais |
| --- | --- | --- |
| [1](etapa-1.md) | React básico com hooks, React Router e Redux com thunks | RF01 a RF04 |
| [2](etapa-2.md) | Service Workers (cache e notificações) | RF05 e RF06 |
| [3](etapa-3.md) | Microfrontends com Module Federation e WebSockets com Socket.io | RF07 e RF08 |

Cada etapa acumula as anteriores: os requisitos já entregues devem continuar funcionando.

- [ ] Definir as datas de entrega de cada etapa.
- [ ] Disponibilizar o backend, o script SQL de carga e a documentação da API.

## Entrega e avaliação

- Ao fim de cada etapa, a equipe apresenta em sala a aplicação e o Storybook funcionando com os requisitos da etapa.
- A nota da etapa é única para o grupo.
- As três etapas têm o mesmo peso: cada uma vale 1/3 da nota final.
