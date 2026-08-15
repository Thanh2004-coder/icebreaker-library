package com.warmup.library.repository;

import com.warmup.library.dto.GameDetailDto;
import com.warmup.library.dto.GameMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * One round-trip detail load: game columns + rating aggregates (no review rows).
 */
@Repository
public class GameDetailQuery {

    @PersistenceContext
    private EntityManager entityManager;

    public GameDetailDto findById(long id) {
        Query query = entityManager.createNativeQuery("""
                SELECT g.id,
                       g.name,
                       g.description,
                       g.how_to_play,
                       g.duration_min,
                       g.duration_max,
                       g.min_players,
                       g.max_players,
                       g.context,
                       g.purpose,
                       g.preparation,
                       g.preparation_required,
                       g.preparation_time,
                       g.rules,
                       g.created_at,
                       g.updated_at,
                       AVG(r.rating),
                       COUNT(r.id)
                FROM games g
                LEFT JOIN reviews r ON r.game_id = g.id
                WHERE g.id = ?
                GROUP BY g.id
                """);
        query.setParameter(1, id);

        Object[] row;
        try {
            row = (Object[]) query.getSingleResult();
        } catch (NoResultException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tro choi");
        }

        String context = (String) row[8];
        String purpose = (String) row[9];
        Double avg = row[16] == null ? null : ((Number) row[16]).doubleValue();
        long reviewCount = row[17] == null ? 0L : ((Number) row[17]).longValue();

        return new GameDetailDto(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                (String) row[3],
                ((Number) row[4]).intValue(),
                ((Number) row[5]).intValue(),
                ((Number) row[6]).intValue(),
                row[7] == null ? null : ((Number) row[7]).intValue(),
                context,
                purpose,
                (String) row[10],
                toBoolean(row[11]),
                row[12] == null ? 0 : ((Number) row[12]).intValue(),
                (String) row[13],
                GameMapper.roundRating(avg),
                reviewCount,
                toInstant(row[14]),
                toInstant(row[15]),
                splitCsv(context),
                splitCsv(purpose)
        );
    }

    private static boolean toBoolean(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        if (value instanceof Number n) {
            return n.intValue() != 0;
        }
        return false;
    }

    private static Instant toInstant(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant();
        }
        if (value instanceof java.time.OffsetDateTime odt) {
            return odt.toInstant();
        }
        if (value instanceof java.time.LocalDateTime ldt) {
            return ldt.atZone(java.time.ZoneOffset.UTC).toInstant();
        }
        throw new IllegalStateException("Unsupported timestamp type: " + value.getClass());
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
}
