# Backend — decisões

Decisões para a API fornecida pelo professor. Os requisitos do frontend estão em [requisitos.md](requisitos.md) e nos arquivos de cada etapa.

## Base

| Decisão | Escolha |
| --- | --- |
| Linguagem e framework | Java com Spring Boot |
| Banco de dados | SQLite, num arquivo dentro de um volume do Docker |
| Como as equipes rodam a API | `docker compose up --build` (instruções no [README](../README.md)) |
| Documentação da API | Swagger (OpenAPI), em `/swagger-ui.html` |
| Token | JWT com expiração (24 horas por padrão), enviado no header `Authorization: Bearer <token>` |
| Administrador | Mesma tabela de usuários dos estudantes, com um campo de papel (`estudante` ou `administrador`) |

## Docker Compose

O [`docker-compose.yml`](../docker-compose.yml) da raiz sobe dois serviços:

| Serviço | O que faz | Porta |
| --- | --- | --- |
| `api` | API Spring Boot, construída a partir de `backend/` | 8080 |
| `armazenamento` | Armazenamento das fotos, com [RustFS](https://rustfs.com) (compatível com S3) | 9000 (API S3) e 9001 (console, em `/rustfs/console/`) |

- O banco SQLite fica em `/app/data/marketplace.db`, no volume `dados`. As fotos ficam no volume `fotos`.
- A pasta `backend/db` é montada em `/app/db`. A API aplica `schema.sql` e `carga.sql` dessa pasta quando o banco está vazio e envia para o armazenamento as fotos de exemplo de `backend/db/fotos/`.
- Ao iniciar, a API cria o bucket `marketplace` se ele ainda não existir.
- Variáveis de ambiente: `.env` (copiado de [`.env.example`](../.env.example)) com as credenciais do armazenamento (`S3_ACCESS_KEY` e `S3_SECRET_KEY`), segredo e expiração do JWT; o compose acrescenta `DB_URL`, `CARGA_DIR`, `S3_ENDPOINT`, `S3_PUBLIC_URL` e `S3_BUCKET`.
- A API fala com o armazenamento por `S3_ENDPOINT` (`http://armazenamento:9000`), mas assina as URLs das fotos com `S3_PUBLIC_URL` (`http://localhost:9000`). A assinatura depende do host, e é esse endereço que o navegador acessa.

## Dados

- **Estado de conservação:** lista fixa de valores, guardada como enum: `novo`, `seminovo` e `usado`.
- **Contato:** telefone/WhatsApp, opcional no cadastro.
- **Categorias:** nome e `slug`. O `slug` é o identificador usado na URL e no filtro da busca (`?categoria=eletronicos`): minúsculas, sem acentos e com hífen no lugar de espaços. O script de carga traz a categoria de exemplo "Eletrônicos" (`eletronicos`); cada equipe troca ou acrescenta as suas.
- **Cursos:** carregados pelo script de carga:
    - Análise e Desenvolvimento de Sistemas
    - Engenharia de Controle e Automação
    - Engenharia Civil
    - Licenciatura em Matemática
    - Técnico Integrado em Edificações
    - Técnico Integrado em Eletromecânica
    - Técnico Integrado em Informática
    - Técnico Subsequente em Edificações
    - Técnico Subsequente em Eletromecânica
    - Técnico em Meio Ambiente

## Fotos

- Fotos de anúncios e de perfil ficam no serviço `armazenamento` (RustFS, compatível com S3), que sobe junto com a API.
- As respostas da API trazem URLs assinadas para as fotos, prontas para usar em `<img>`.
- O frontend envia as fotos para a própria API (multipart), que as grava no armazenamento. As URLs assinadas expiram em 1 hora.

## Paginação

- Toda listagem aceita `pagina` (a partir de 1) e `tamanho`.
- Valores aceitos para `tamanho`: 5, 10, 25 e 50. Padrão: 10.
- Formato da resposta: `{ itens, pagina, tamanho, total, totalPaginas }`.

## Lista de interesse

- Ao adicionar um anúncio à lista, a API guarda o estado que o anúncio tinha naquele momento.
- A listagem devolve, para cada anúncio, o estado ao adicionar, o estado atual e se foi removido. Com isso o frontend mostra que o anúncio mudou de estado desde que foi adicionado (RF05.2).

## Mais desejados (RF08)

- Endpoint público, sem token.
- Considera só anúncios ativos e conta os interesses adicionados nos últimos 30 dias.
- Aceita filtros por modalidade e categoria e a paginação padrão.

## Chat

- Tempo real com o WebSocket nativo do Spring e STOMP (`spring-boot-starter-websocket`), na mesma porta da API. No frontend, o cliente é o `@stomp/stompjs`.
- O cliente conecta em `/ws` e envia o JWT no cabeçalho `Authorization` do frame `CONNECT`; a API associa a conexão ao usuário.
- O envio de mensagens é feito pela API REST. A API grava a mensagem e a entrega aos dois participantes com `convertAndSendToUser`, no destino `/user/queue/mensagens`.
- A mensagem do botão "Negociar" (RF07.2) é um tipo especial de mensagem, ligado ao anúncio, e não texto.
- Há dois tipos de mensagem, `texto` e `negociacao`. A de negociação guarda o id do anúncio e uma cópia do título, da foto de capa e do preço no momento do envio, para continuar legível se o anúncio mudar ou for removido.

## Push Notification

- Web Push padrão, com um único par de chaves VAPID gerado pelo professor e colocado no `.env` de exemplo da API. Como cada equipe roda tudo localmente, todas podem usar o mesmo par.
- A API expõe a chave pública VAPID num endpoint, e o frontend a usa ao criar a inscrição de push.
- Toda notificação tem o mesmo formato: `{ titulo, corpo, url }`. O service worker mostra `titulo` e `corpo` e, no clique, abre `url`.
- Navegadores aceitam Push em `http://localhost`, então não é preciso HTTPS no desenvolvimento.

## O que a API precisa oferecer

| Área | Necessidade | Requisito |
| --- | --- | --- |
| Autenticação | Cadastro com validação do domínio `@academico.ifpb.edu.br`, login de estudante, login de administrador, lista de cursos | RF01, RF06 |
| Perfil | Ver perfil próprio e de outros, editar dados, enviar foto | RF02 |
| Anúncios | Criar e editar com 1 a 10 fotos e foto de capa, alterar estado, detalhe | RF03 |
| Busca | Filtros por modalidade, categoria e faixa de preço; `ordem` (`data` ou `preco`) e `direcao` (`asc` ou `desc`); paginação | RF04 |
| Lista de interesse | Adicionar, remover, listar com estado ao adicionar e estado atual | RF05 |
| Administração | Listagem geral com filtros, detalhe, remoção com motivo; o dono continua vendo o anúncio removido e o motivo | RF06, RF02.4 |
| Mais desejados | Ranking público, sem token | RF08 |
| Chat | WebSocket com STOMP, conversas, histórico, não lidas, mensagem de negociação | RF07 |
| Push | Guardar a inscrição; notificar interesse em anúncio, remoção pelo administrador e mensagem nova | RF05.3, RF06.7, RF07.6 |
| Carga | Script SQL com cursos e categoria de exemplo | — |
