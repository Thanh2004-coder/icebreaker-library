package com.warmup.library.repository;

import com.warmup.library.dto.GameMapper;
import com.warmup.library.dto.GameSummaryDto;
import com.warmup.library.dto.PageResponse;
import com.warmup.library.util.TextUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Single round-trip list query for /api/games:
 * summary columns only + rating aggregates + total count (window), no review rows.
 */
@Repository
public class GameSummaryQuery {

    @PersistenceContext
    private EntityManager entityManager;

    public PageResponse<GameSummaryDto> search(
            String search,
            String players,
            List<String> contextSlugs,
            List<String> purposeSlugs,
            String duration,
            int page,
            int size
    ) {
        StringBuilder sql = new StringBuilder("""
                SELECT g.id,
                       g.name,
                       g.description,
                       g.duration_min,
                       g.duration_max,
                       g.min_players,
                       g.max_players,
                       g.context,
                       g.purpose,
                       g.preparation,
                       g.preparation_required,
                       g.preparation_time,
                       AVG(r.rating),
                       COUNT(r.id),
                       COUNT(*) OVER() AS total_elements
                FROM games g
                LEFT JOIN reviews r ON r.game_id = g.id
                WHERE 1=1
                """);

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("""
                     AND (LOWER(g.name) LIKE ? OR g.name_search LIKE ?)
                    """);
            String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            String unaccented = "%" + TextUtils.unaccent(search) + "%";
            params.add(like);
            params.add(unaccented);
        }

        appendPlayers(sql, params, players);
        appendDuration(sql, params, duration);

        if (contextSlugs != null && !contextSlugs.isEmpty()) {
            sql.append("""
                     AND EXISTS (
                       SELECT 1 FROM game_contexts gc
                       INNER JOIN contexts ct ON ct.id = gc.context_id
                       WHERE gc.game_id = g.id AND ct.slug IN (
                    """);
            appendInPlaceholders(sql, contextSlugs.size());
            sql.append("))");
            params.addAll(contextSlugs);
        }

        if (purposeSlugs != null && !purposeSlugs.isEmpty()) {
            sql.append("""
                     AND EXISTS (
                       SELECT 1 FROM game_purposes gp
                       INNER JOIN purposes pt ON pt.id = gp.purpose_id
                       WHERE gp.game_id = g.id AND pt.slug IN (
                    """);
            appendInPlaceholders(sql, purposeSlugs.size());
            sql.append("))");
            params.addAll(purposeSlugs);
        }

        sql.append(" GROUP BY g.id ORDER BY g.name ASC LIMIT ? OFFSET ?");
        params.add(size);
        params.add((long) page * (long) size);

        Query query = entityManager.createNativeQuery(sql.toString());
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        long totalElements = 0;
        List<GameSummaryDto> content = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            totalElements = ((Number) row[14]).longValue();
            content.add(toSummary(row));
        }
        if (rows.isEmpty() && page == 0) {
            totalElements = 0;
        } else if (rows.isEmpty() && page > 0) {
            // Rare empty trailing page: fall back to a cheap count with same filters.
            totalElements = countOnly(search, players, contextSlugs, purposeSlugs, duration);
        }

        int totalPages = size <= 0 ? 0 : (int) Math.ceil(totalElements / (double) size);
        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }

    private long countOnly(
            String search,
            String players,
            List<String> contextSlugs,
            List<String> purposeSlugs,
            String duration
    ) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM games g WHERE 1=1");
        List<Object> params = new ArrayList<>();
        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(g.name) LIKE ? OR g.name_search LIKE ?)");
            String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            params.add(like);
            params.add("%" + TextUtils.unaccent(search) + "%");
        }
        appendPlayers(sql, params, players);
        appendDuration(sql, params, duration);
        if (contextSlugs != null && !contextSlugs.isEmpty()) {
            sql.append("""
                     AND EXISTS (
                       SELECT 1 FROM game_contexts gc
                       INNER JOIN contexts ct ON ct.id = gc.context_id
                       WHERE gc.game_id = g.id AND ct.slug IN (
                    """);
            appendInPlaceholders(sql, contextSlugs.size());
            sql.append("))");
            params.addAll(contextSlugs);
        }
        if (purposeSlugs != null && !purposeSlugs.isEmpty()) {
            sql.append("""
                     AND EXISTS (
                       SELECT 1 FROM game_purposes gp
                       INNER JOIN purposes pt ON pt.id = gp.purpose_id
                       WHERE gp.game_id = g.id AND pt.slug IN (
                    """);
            appendInPlaceholders(sql, purposeSlugs.size());
            sql.append("))");
            params.addAll(purposeSlugs);
        }
        Query query = entityManager.createNativeQuery(sql.toString());
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }
        return ((Number) query.getSingleResult()).longValue();
    }

    private static GameSummaryDto toSummary(Object[] row) {
        String context = (String) row[7];
        String purpose = (String) row[8];
        Double avg = row[12] == null ? null : ((Number) row[12]).doubleValue();
        long reviewCount = row[13] == null ? 0L : ((Number) row[13]).longValue();
        return new GameSummaryDto(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                ((Number) row[3]).intValue(),
                ((Number) row[4]).intValue(),
                ((Number) row[5]).intValue(),
                row[6] == null ? null : ((Number) row[6]).intValue(),
                context,
                purpose,
                (String) row[9],
                row[10] != null && (Boolean.TRUE.equals(row[10]) || Integer.valueOf(1).equals(toInt(row[10]))),
                row[11] == null ? 0 : ((Number) row[11]).intValue(),
                GameMapper.roundRating(avg),
                reviewCount,
                splitCsv(context),
                splitCsv(purpose)
        );
    }

    private static Integer toInt(Object value) {
        if (value instanceof Boolean b) {
            return b ? 1 : 0;
        }
        if (value instanceof Number n) {
            return n.intValue();
        }
        return null;
    }

    private static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .sorted()
                .toList();
    }

    private static void appendInPlaceholders(StringBuilder sql, int count) {
        for (int i = 0; i < count; i++) {
            if (i > 0) {
                sql.append(',');
            }
            sql.append('?');
        }
    }

    private static void appendPlayers(StringBuilder sql, List<Object> params, String players) {
        if (players == null || players.isBlank()) {
            return;
        }
        switch (players.trim()) {
            case "2" -> {
                sql.append(" AND g.min_players = ?");
                params.add(2);
            }
            case "3-4" -> {
                sql.append(" AND g.min_players >= ? AND g.min_players <= ?");
                params.add(3);
                params.add(4);
            }
            case "5" -> {
                sql.append(" AND g.min_players = ?");
                params.add(5);
            }
            case "6-10" -> {
                sql.append(" AND g.min_players >= ? AND g.min_players <= ?");
                params.add(6);
                params.add(10);
            }
            case "10+", "10plus", "10" -> {
                sql.append(" AND g.min_players >= ?");
                params.add(10);
            }
            default -> {
            }
        }
    }

    private static void appendDuration(StringBuilder sql, List<Object> params, String duration) {
        if (duration == null || duration.isBlank()) {
            return;
        }
        switch (duration.trim()) {
            case "under-5", "<5" -> {
                sql.append(" AND g.duration_min < ?");
                params.add(5);
            }
            case "5-7" -> {
                sql.append(" AND g.duration_min >= ? AND g.duration_min <= ?");
                params.add(5);
                params.add(7);
            }
            case "8-10" -> {
                sql.append(" AND g.duration_min >= ? AND g.duration_min <= ?");
                params.add(8);
                params.add(10);
            }
            case "10-15" -> {
                sql.append(" AND g.duration_min >= ? AND g.duration_min <= ?");
                params.add(10);
                params.add(15);
            }
            case "over-15", ">15" -> {
                sql.append(" AND g.duration_min > ?");
                params.add(15);
            }
            default -> {
            }
        }
    }
}
