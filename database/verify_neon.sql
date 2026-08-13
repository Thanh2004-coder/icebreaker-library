-- Verify Game Warm-up schema + data after importing warmup_library_neon.sql into Neon.
-- Usage (PowerShell):
--   $env:PGPASSWORD = "<neon-password>"
--   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" "$env:NEON_DATABASE_URL" -f database\verify_neon.sql
-- Or paste into Neon SQL Editor.

SELECT current_database() AS database,
       current_user AS connected_as,
       current_schema() AS schema;

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT 'contexts' AS table_name, COUNT(*) AS row_count FROM public.contexts
UNION ALL
SELECT 'purposes', COUNT(*) FROM public.purposes
UNION ALL
SELECT 'games', COUNT(*) FROM public.games
UNION ALL
SELECT 'game_contexts', COUNT(*) FROM public.game_contexts
UNION ALL
SELECT 'game_purposes', COUNT(*) FROM public.game_purposes
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.reviews
ORDER BY table_name;

SELECT id, name, min_players, duration_min, context
FROM public.games
ORDER BY id;

SELECT id, game_id, display_name, rating, LEFT(comment, 60) AS comment_preview
FROM public.reviews
ORDER BY id;
