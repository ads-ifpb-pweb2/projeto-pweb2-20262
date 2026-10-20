# projeto-pweb2-20262

Código base para o Projeto da disciplina de PWEB2 (2026.2).

A descrição do projeto, com requisitos e etapas, está em [docs/requisitos.md](docs/requisitos.md).

Cada etapa tem o seu arquivo: [etapa 1](docs/etapa-1.md), [etapa 2](docs/etapa-2.md) e [etapa 3](docs/etapa-3.md).

As decisões do backend estão em [docs/backend.md](docs/backend.md).

## Como rodar o backend

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) com o Docker Compose.

1. Copie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Suba a API, o banco e o armazenamento de fotos:

   ```bash
   docker compose up --build
   ```

3. Acesse:

   | Serviço | Endereço |
   | --- | --- |
   | API | http://localhost:8080 |
   | Documentação da API (Swagger) | http://localhost:8080/swagger-ui.html |
   | Console do armazenamento (fotos) | http://localhost:9001/rustfs/console/ (`S3_ACCESS_KEY` e `S3_SECRET_KEY` do `.env`) |

### Estudantes de exemplo

A carga traz três estudantes, todos com a senha `senha123`, e anúncios de exemplo para testar a busca:

| Nome | E-mail |
| --- | --- |
| Ana Silva | `ana.silva@academico.ifpb.edu.br` |
| Bruno Costa | `bruno.costa@academico.ifpb.edu.br` |
| Carla Souza | `carla.souza@academico.ifpb.edu.br` |

No Swagger, faça login em `POST /auth/login`, copie o `token` da resposta e clique em **Authorize**.

### Postman

A coleção [`backend/postman/marketplace.postman_collection.json`](backend/postman/marketplace.postman_collection.json) tem requisições de exemplo para todos os endpoints. Importe no Postman e rode primeiro **Autenticação → Login**: o token fica guardado na coleção. As requisições com foto usam os arquivos de `backend/db/fotos/`. Para o Postman encontrá-los, defina a raiz do repositório em *Settings → General → Working directory*.

Para rodar a coleção inteira pelo terminal, com a API no ar:

```bash
npx newman run backend/postman/marketplace.postman_collection.json --working-dir .
```

### Categorias e dados de carga

As categorias da equipe ficam no script `backend/db/carga.sql`. A API aplica o script quando o banco está vazio, então, depois de editá-lo, apague os dados e suba de novo:

```bash
docker compose down -v
docker compose up --build
```

O `down -v` apaga o banco e as fotos enviadas.

### Atualizar o backend para uma nova etapa

Cada etapa acrescenta tabelas ao banco, e a API só aplica o `schema.sql` quando o banco está vazio. Ao atualizar o backend, apague os dados e suba de novo com os mesmos comandos acima (`docker compose down -v` e `docker compose up --build`).

## Testes da API

Os testes de integração ficam em `backend/src/test`. Cada classe sobe a API com um banco novo (aplicando `schema.sql` e `carga.sql`) e um armazenamento RustFS real, criado pelo [Testcontainers](https://testcontainers.com). É preciso ter o Docker rodando.

Com Java 25 instalado:

```bash
cd backend
./mvnw test
```

Sem Java 25, pelo Docker:

```bash
cd backend
docker run --rm -v "$PWD":/build -v marketplace-m2:/root/.m2 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal \
  -w /build maven:3.9-eclipse-temurin-25 mvn -B test
```
