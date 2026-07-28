# Announce Board

Full-stack announcement board monorepo

## Stack

| Layer    | Tech                                    |
| -------- | --------------------------------------- |
| Runtime  | Node 24, pnpm 10.15                     |
| Backend  | NestJS 11, Express                      |
| ORM      | Drizzle ORM, postgres.js                |
| Database | PostgreSQL 17 Alpine (Docker)           |
| Auth     | JWT (bcryptjs + @nestjs/jwt)            |
| Docs     | Swagger (@nestjs/swagger)               |
| Security | Helmet, CORS, rate limiting, validation |
| Monorepo | pnpm workspaces + Turborepo             |

## Prerequisites

- Node >= 20
- pnpm 10.15 (`npm install -g pnpm@10.15.0`)
- Docker Desktop

## Quick start

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm dev
```

Server starts at `http://localhost:4000`. Swagger docs at `http://localhost:4000/api/docs`.

## Project structure

```
announce-board/
├── apps/
│   └── backend/          # NestJS API server
│       ├── src/
│       │   ├── auth/         # Auth module (signup, signin, guards, user mgmt)
│       │   ├── categories/   # Categories CRUD
│       │   ├── posts/        # Posts CRUD
│       │   ├── repositories/ # Data access layer (base + entity repos)
│       │   ├── drizzle/      # DrizzleModule (global DB provider)
│       │   ├── seed.ts       # Database seeder
│       │   └── main.ts       # Entry point (Swagger, helmet, CORS, validation)
│       └── test/             # E2E tests
├── packages/
│   └── db/               # Shared Drizzle schema & client
│       ├── src/index.ts      # Tables, relations, types, db client
│       └── drizzle.config.ts # Drizzle Kit config
├── .env                  # Environment variables (source of truth)
├── docker-compose.yml    # PostgreSQL service
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml   # Workspace definition
```

## Environment variables

| Variable         | Default                                                  | Description           |
| ---------------- | -------------------------------------------------------- | --------------------- |
| `DATABASE_URL`   | `postgres://user:password@localhost:5432/announce_board` | PostgreSQL connection |
| `JWT_SECRET`     | `change-this-to-a-random-secret`                         | JWT signing secret    |
| `JWT_EXPIRATION` | `7d`                                                     | Token lifetime        |
| `CORS_ORIGIN`    | `http://localhost:3000`                                  | Allowed CORS origins  |
| `PORT`           | `4000`                                                   | API server port       |

## Scripts

### Root

| Command       | Description          |
| ------------- | -------------------- |
| `pnpm dev`    | Run all apps in dev  |
| `pnpm build`  | Build all apps       |
| `pnpm lint`   | Lint all apps        |
| `pnpm format` | Format with Prettier |

### Backend (`apps/backend`)

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Start in watch mode             |
| `pnpm seed`       | Seed default admin + categories |
| `pnpm test`       | Run unit tests                  |
| `pnpm test:watch` | Unit tests in watch mode        |
| `pnpm test:cov`   | Unit tests with coverage        |
| `pnpm test:e2e`   | Run E2E tests                   |

### DB (`packages/db`)

| Command         | Description                 |
| --------------- | --------------------------- |
| `pnpm generate` | Generate Drizzle migrations |
| `pnpm migrate`  | Run migrations              |
| `pnpm push`     | Push schema to DB           |
| `pnpm studio`   | Open Drizzle Studio         |

All DB scripts load `.env` from the monorepo root via `dotenv-cli`.

## API overview

All endpoints are prefixed with `/v1/`. Auth is required for most routes.

### Auth

| Method | Path                 | Auth  | Description                   |
| ------ | -------------------- | ----- | ----------------------------- |
| POST   | `/v1/auth/signup`    | No    | Register (first user = admin) |
| POST   | `/v1/auth/signin`    | No    | Login, returns JWT            |
| GET    | `/v1/auth/users`     | Admin | List users (paginated)        |
| PATCH  | `/v1/auth/users/:id` | Admin | Update user role              |

### Categories

| Method | Path                                   | Auth  | Description                      |
| ------ | -------------------------------------- | ----- | -------------------------------- |
| POST   | `/v1/categories`                       | Admin | Create category                  |
| GET    | `/v1/categories`                       | No    | List categories (paginated)      |
| GET    | `/v1/categories/:id`                   | No    | Get category by ID               |
| PATCH  | `/v1/categories/:id`                   | Admin | Update category                  |
| DELETE | `/v1/categories/:id`                   | Admin | Delete (move posts if has posts) |
| DELETE | `/v1/categories/:id?targetCategoryId=` | Admin | Delete and move posts to target  |

### Posts

| Method | Path            | Auth  | Description                                        |
| ------ | --------------- | ----- | -------------------------------------------------- |
| POST   | `/v1/posts`     | Admin | Create post                                        |
| GET    | `/v1/posts`     | No    | List posts (paginated, filterable by `categoryId`) |
| GET    | `/v1/posts/:id` | No    | Get post by ID                                     |
| PATCH  | `/v1/posts/:id` | Admin | Update post                                        |
| DELETE | `/v1/posts/:id` | Admin | Delete post                                        |

All GET endpoints support `?page=1&limit=10` pagination.

## Rate limiting

- 10 requests per second
- 100 requests per minute
- Applied globally via `@nestjs/throttler`

## Seeding

```bash
pnpm --filter @announce-board/backend seed
```

Creates:

- Admin user (`admin@announceboard.com` / `admin123`)
- 4 default categories: General, Announcements, Events, News

Idempotent — safe to run multiple times.

## Testing

```bash
# Unit tests
pnpm --filter @announce-board/backend test

# E2E tests (requires running PostgreSQL)
pnpm --filter @announce-board/backend test:e2e
```

42 unit tests, 28 E2E tests.
