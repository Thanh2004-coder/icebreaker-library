# Import local Game Warm-up data into Neon PostgreSQL

## Why the first import looked empty / errored

Local dump `warmup_library.sql` (pg_dump 18) contained:

1. `ALTER TABLE ... OWNER TO postgres;` — Neon has **no** role named `postgres` (typical roles: `neondb_owner`, project user). That produced:
   `ERROR: role "postgres" does not exist`
2. `\restrict` / `\unrestrict` — pg_dump 18 meta-commands; can confuse some clients.
3. `SET transaction_timeout = 0;` — not available on all Neon Postgres versions.

`CREATE TABLE` / `COPY` often still ran, so tables may exist on Neon under schema **`public`**. If the Neon console showed no tables, check:

- Correct **branch** and database (`neondb` vs a custom name)
- Schema filter = **public**
- Refresh the Tables panel after import

Local DB was **not** modified by creating the Neon dump.

## Neon-ready dump

Use:

`warmup_library_neon.sql`

Built with:

```text
pg_dump -U postgres -d warmup_library --no-owner --no-acl
```

Then cleaned (no `OWNER TO`, no ACL/`GRANT`, no `\restrict`/`\unrestrict`, no `transaction_timeout`).

### Contents (schema `public`)

| Table | Expected rows (from this dump) |
| --- | --- |
| contexts | 5 |
| purposes | 8 |
| games | **20** |
| game_contexts | 20 |
| game_purposes | 87 |
| reviews | 2 |

## Import into Neon (do not put secrets in source files)

### Option A — Neon SQL Editor

1. Open Neon → SQL Editor (correct branch/database).
2. Paste the full contents of `warmup_library_neon.sql`.
3. Run.

### Option B — `psql` (recommended)

In PowerShell (replace with **your** Neon URI; do not commit it):

```powershell
$env:NEON_DATABASE_URL = "postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" "$env:NEON_DATABASE_URL" -v ON_ERROR_STOP=1 -f "C:\Users\thanh\Downloads\icebreaker-library\warmup_library_neon.sql"
```

If tables already exist from a partial import, either drop them in Neon SQL Editor first:

```sql
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.game_contexts CASCADE;
DROP TABLE IF EXISTS public.game_purposes CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.contexts CASCADE;
DROP TABLE IF EXISTS public.purposes CASCADE;
```

…or create a fresh Neon branch/database and import there.

## Verify

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" "$env:NEON_DATABASE_URL" -f "C:\Users\thanh\Downloads\icebreaker-library\database\verify_neon.sql"
```

Expect: **6** public tables, **20** games, reviews count ≥ 0 (dump has **2**).

Quick checks:

```sql
SELECT COUNT(*) FROM games;      -- 20
SELECT COUNT(*) FROM reviews;    -- 2
SELECT COUNT(*) FROM contexts;   -- 5
```

## Spring Boot → Neon

`application.properties` already uses env overrides:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Example JDBC for Neon (hosting dashboard env vars only):

```text
DB_URL=jdbc:postgresql://ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
DB_USERNAME=<neon-user>
DB_PASSWORD=<neon-password>
CORS_ORIGINS=https://your-frontend.vercel.app
```

Do **not** commit Neon credentials. Keep them in Render/Railway/etc. environment settings.
