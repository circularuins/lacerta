# Lacerta

AI-powered reverse-planning task manager.

Set a goal with a deadline, and Lacerta's AI breaks it down into daily actionable tasks. Log your progress each day, and the plan automatically recalibrates to your pace.

## Named after

The **Lacerta signal** from Greg Egan's *Diaspora* — a distant astronomical event that drove an entire civilization to reverse-engineer a path toward it. Lacerta does the same for your goals.

Part of the [yatima](https://github.com/circularuins) project family.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Flutter 3.x (Dart) |
| Backend | TypeScript + Hono |
| Database | PostgreSQL 16 + Drizzle ORM |
| API | GraphQL (yoga + pothos) |
| Auth | JWT (email + password) |
| AI | Claude API (Sonnet) |
| Hosting | Cloudflare Pages + Railway |

## Quick Start

```bash
# Initial setup (PostgreSQL + dependencies + DB schema)
./scripts/dev-setup.sh

# Start backend dev server (Terminal 1)
./scripts/dev-start.sh

# Start frontend (Terminal 2)
cd frontend && flutter run -d chrome
```

## License

[GNU AGPL v3.0](LICENSE)
