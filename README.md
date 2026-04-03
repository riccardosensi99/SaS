# IT Ops Automation

A multi-tenant SaaS platform that enables companies to automate repetitive IT operations through visual workflows.

[Leggi in Italiano](README.it.md)

## What is IT Ops Automation?

IT Ops Automation is a workflow automation platform designed for SMBs and mid-market companies. IT teams can design, schedule, and monitor automation workflows for common operations like:

- **User onboarding/offboarding** — automate account creation, access provisioning, and decommissioning
- **Software provisioning** — deploy and configure software across endpoints
- **Scheduled maintenance** — run patching, backups, and health checks on a schedule
- **Ticket routing** — automatically triage and assign support tickets
- **Compliance checks** — enforce policies and generate audit trails
- **Incident response** — execute security playbooks when threats are detected

## Features

### Visual Workflow Builder
Drag-and-drop editor powered by React Flow. Build workflows visually by connecting steps — no code required.

### Integration Connectors
Pre-built connectors for common IT tools:
- **Slack** — send messages, create channels, manage notifications
- **Jira** — create issues, update tickets, manage projects
- **Active Directory / LDAP** — create/disable users, manage groups, search directory

### Multi-Tenant Architecture
Each organization has isolated data with row-level security. Users belong to organizations with role-based access (Owner, Admin, Member).

### Async Workflow Execution
Workflows run asynchronously via BullMQ job queues backed by Redis. Steps execute sequentially with progress tracking, error handling, and retries.

### Multi-Language Support
Full internationalization with English and Italian. Language switcher in the sidebar. Easily extensible to more languages by adding locale JSON files.

### Animated 404 Page
A fun rocket-crash animation greets users who land on non-existent pages.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Workflow Editor | React Flow |
| State Management | Zustand |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Queue | Redis + BullMQ |
| Auth | JWT (access + refresh tokens) |
| i18n | next-intl |
| Infrastructure | Docker, docker-compose |

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-aware pages
│   │   ├── layout.tsx         # App shell with sidebar
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard with stats
│   │   ├── workflows/         # Workflow management
│   │   ├── connectors/        # Connector marketplace
│   │   └── not-found.tsx      # Animated 404
│   ├── api/
│   │   ├── auth/              # Register, login, refresh
│   │   ├── workflows/         # Workflow CRUD + execution
│   │   └── connectors/        # Connector config API
│   └── not-found.tsx          # Root 404 fallback
├── components/
│   ├── workflow-builder/
│   │   └── Canvas.tsx         # React Flow editor
│   └── LanguageSwitcher.tsx
├── lib/
│   ├── connectors/            # Plugin connector system
│   │   ├── types.ts           # Connector interfaces
│   │   ├── registry.ts        # Connector registry
│   │   ├── slack/             # Slack connector
│   │   ├── jira/              # Jira connector
│   │   └── ldap/              # LDAP/AD connector
│   ├── db/                    # Prisma client
│   ├── i18n/                  # i18n config + locale files
│   └── queue/                 # BullMQ worker
├── middleware.ts              # next-intl locale routing
└── i18n.ts                    # next-intl server config
prisma/
└── schema.prisma              # Database models
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Docker** and **docker-compose**

### 1. Clone and install

```bash
git clone <repo-url>
cd prodotto
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` if needed. Defaults work for local development.

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis.

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the application

```bash
# Start the web app
npm run dev

# In a separate terminal, start the workflow worker
npm run worker
```

### 6. Open in browser

- **App:** http://localhost:3000
- **Italian:** http://localhost:3000/it
- **Prisma Studio:** `npx prisma studio` (database browser)

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth` | Register (`action: "register"`), Login (`action: "login"`), Refresh (`action: "refresh"`) |

### Workflows
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workflows` | List all workflows |
| GET | `/api/workflows?id=xxx` | Get workflow by ID |
| POST | `/api/workflows` | Create workflow |
| PUT | `/api/workflows` | Update workflow or execute (`action: "execute"`) |
| DELETE | `/api/workflows?id=xxx` | Delete workflow |

### Connectors
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/connectors` | List available connectors |
| POST | `/api/connectors` | Enable/configure a connector for an org |
| DELETE | `/api/connectors?id=xxx` | Remove connector config |

## Database Models

- **Organization** — tenant with users, workflows, configs
- **User** — email/password auth, role (Owner/Admin/Member)
- **Workflow** — name, status, trigger type, React Flow definition
- **WorkflowStep** — individual step with type, config, position
- **WorkflowExecution** — execution record with status and output
- **ConnectorConfig** — per-org connector credentials
- **AuditLog** — action tracking for compliance

## License

Private — All rights reserved.
