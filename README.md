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
   | Console do MinIO (fotos) | http://localhost:9001 (usuário e senha do `.env`) |

### Categorias e dados de carga

As categorias da equipe ficam no script `backend/db/carga.sql`. A API aplica o script quando o banco está vazio, então, depois de editá-lo, apague os dados e suba de novo:

```bash
docker compose down -v
docker compose up --build
```

O `down -v` apaga o banco e as fotos enviadas.
