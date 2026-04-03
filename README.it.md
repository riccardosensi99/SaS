# IT Ops Automation

Una piattaforma SaaS multi-tenant che permette alle aziende di automatizzare le operazioni IT ripetitive tramite workflow visivi.

[Read in English](README.md)

## Cos'e IT Ops Automation?

IT Ops Automation e una piattaforma di automazione workflow pensata per PMI e aziende mid-market. I team IT possono progettare, pianificare e monitorare workflow di automazione per operazioni comuni come:

- **Onboarding/offboarding dipendenti** — automatizza la creazione account, provisioning accessi e disattivazione
- **Provisioning software** — distribuzione e configurazione software sugli endpoint
- **Manutenzione programmata** — patching, backup e health check schedulati
- **Routing ticket** — smistamento e assegnazione automatica dei ticket di supporto
- **Controlli di conformita** — applicazione policy e generazione audit trail
- **Risposta agli incidenti** — esecuzione playbook di sicurezza in caso di minacce

## Funzionalita

### Workflow Builder Visuale
Editor drag-and-drop basato su React Flow. Costruisci workflow visivamente collegando step — nessun codice richiesto.

### Connettori per Integrazioni
Connettori pre-costruiti per gli strumenti IT piu comuni:
- **Slack** — invia messaggi, crea canali, gestisci notifiche
- **Jira** — crea ticket, aggiorna issue, gestisci progetti
- **Active Directory / LDAP** — crea/disabilita utenti, gestisci gruppi, cerca nella directory

### Architettura Multi-Tenant
Ogni organizzazione ha dati isolati con sicurezza a livello di riga. Gli utenti appartengono a organizzazioni con accesso basato sui ruoli (Owner, Admin, Member).

### Esecuzione Asincrona dei Workflow
I workflow vengono eseguiti in modo asincrono tramite code BullMQ supportate da Redis. Gli step vengono eseguiti in sequenza con tracking del progresso, gestione errori e retry.

### Supporto Multi-Lingua
Internazionalizzazione completa con inglese e italiano. Selettore lingua nella sidebar. Facilmente estensibile ad altre lingue aggiungendo file JSON di traduzione.

### Pagina 404 Animata
Un divertente razzo che si schianta accoglie gli utenti che finiscono su pagine inesistenti.

## Stack Tecnologico

| Livello | Tecnologia |
|---------|-----------|
| Frontend | Next.js 14+ (App Router), React, TypeScript |
| Stile | Tailwind CSS |
| Editor Workflow | React Flow |
| State Management | Zustand |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Code | Redis + BullMQ |
| Autenticazione | JWT (access + refresh token) |
| i18n | next-intl |
| Infrastruttura | Docker, docker-compose |

## Struttura del Progetto

```
src/
├── app/
│   ├── [locale]/              # Pagine con supporto lingua
│   │   ├── layout.tsx         # Shell app con sidebar
│   │   ├── page.tsx           # Pagina principale
│   │   ├── dashboard/         # Dashboard con statistiche
│   │   ├── workflows/         # Gestione workflow
│   │   ├── connectors/        # Marketplace connettori
│   │   └── not-found.tsx      # 404 animata
│   ├── api/
│   │   ├── auth/              # Registrazione, login, refresh
│   │   ├── workflows/         # CRUD workflow + esecuzione
│   │   └── connectors/        # API configurazione connettori
│   └── not-found.tsx          # 404 root di fallback
├── components/
│   ├── workflow-builder/
│   │   └── Canvas.tsx         # Editor React Flow
│   └── LanguageSwitcher.tsx
├── lib/
│   ├── connectors/            # Sistema connettori a plugin
│   │   ├── types.ts           # Interfacce connettori
│   │   ├── registry.ts        # Registro connettori
│   │   ├── slack/             # Connettore Slack
│   │   ├── jira/              # Connettore Jira
│   │   └── ldap/              # Connettore LDAP/AD
│   ├── db/                    # Client Prisma
│   ├── i18n/                  # Configurazione i18n + file traduzioni
│   └── queue/                 # Worker BullMQ
├── middleware.ts              # Routing locale next-intl
└── i18n.ts                    # Configurazione server next-intl
prisma/
└── schema.prisma              # Modelli database
```

## Come Iniziare

### Prerequisiti

- **Node.js** 18+
- **Docker** e **docker-compose**

### 1. Clona e installa

```bash
git clone <repo-url>
cd prodotto
npm install
```

### 2. Configura l'ambiente

```bash
cp .env.example .env
```

Modifica `.env` se necessario. I valori predefiniti funzionano per lo sviluppo locale.

### 3. Avvia l'infrastruttura

```bash
docker compose up -d
```

Questo avvia PostgreSQL e Redis.

### 4. Configura il database

```bash
npx prisma generate
npx prisma db push
```

### 5. Avvia l'applicazione

```bash
# Avvia l'app web
npm run dev

# In un terminale separato, avvia il worker per i workflow
npm run worker
```

### 6. Apri nel browser

- **App:** http://localhost:3000
- **Italiano:** http://localhost:3000/it
- **Prisma Studio:** `npx prisma studio` (browser del database)

## Endpoint API

### Autenticazione
| Metodo | Percorso | Descrizione |
|--------|----------|-------------|
| POST | `/api/auth` | Registrazione (`action: "register"`), Login (`action: "login"`), Refresh (`action: "refresh"`) |

### Workflow
| Metodo | Percorso | Descrizione |
|--------|----------|-------------|
| GET | `/api/workflows` | Elenca tutti i workflow |
| GET | `/api/workflows?id=xxx` | Ottieni workflow per ID |
| POST | `/api/workflows` | Crea workflow |
| PUT | `/api/workflows` | Aggiorna workflow o esegui (`action: "execute"`) |
| DELETE | `/api/workflows?id=xxx` | Elimina workflow |

### Connettori
| Metodo | Percorso | Descrizione |
|--------|----------|-------------|
| GET | `/api/connectors` | Elenca connettori disponibili |
| POST | `/api/connectors` | Abilita/configura un connettore per un'org |
| DELETE | `/api/connectors?id=xxx` | Rimuovi configurazione connettore |

## Modelli Database

- **Organization** — tenant con utenti, workflow, configurazioni
- **User** — autenticazione email/password, ruolo (Owner/Admin/Member)
- **Workflow** — nome, stato, tipo trigger, definizione React Flow
- **WorkflowStep** — singolo step con tipo, configurazione, posizione
- **WorkflowExecution** — record esecuzione con stato e output
- **ConnectorConfig** — credenziali connettore per organizzazione
- **AuditLog** — tracciamento azioni per conformita

## Licenza

Privato — Tutti i diritti riservati.
