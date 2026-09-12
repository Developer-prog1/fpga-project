# Hamalsaran

University platform monorepo — **Next.js** (web) + **NestJS** (api) + **Prisma / Neon PostgreSQL**.

## Structure

```text
.env                 # single project env (gitignored)
apps/web             # Next.js — :3000
apps/api             # NestJS  — :4000
apps/api/prisma      # schema + seed
```

## Domain

- **Users** — միայն `ADMIN` (գրանցում/enrollment չկա)
- **Faculties** — ինֆորմատիկա, տնտեսագիտություն, իրավագիտություն
- **Courses** — դասընթացներ ֆակուլտետով

## Setup

```bash
pnpm install
cp .env.example .env   # fill Neon credentials once
pnpm db:push
pnpm db:seed
pnpm run dev
```

- Web: http://localhost:3000  
- API overview: http://localhost:4000/overview  
- Health: http://localhost:4000/health  

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | API + web together |
| `pnpm db:push` | Sync Prisma schema to Neon |
| `pnpm db:seed` | Load demo university data |
| `pnpm db:generate` | Regenerate Prisma Client |

**Security:** keep secrets only in root `.env`. Rotate Neon password if it was ever shared.
