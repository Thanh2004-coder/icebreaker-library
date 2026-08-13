package com.warmup.library.repository;

import com.warmup.library.domain.Game;
import com.warmup.library.util.TextUtils;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class GameSpecifications {

    private GameSpecifications() {
    }

    public static Specification<Game> withFilters(
            String search,
            String players,
            List<String> contextSlugs,
            List<String> purposeSlugs,
            String duration
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                String unaccented = "%" + TextUtils.unaccent(search) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(root.get("nameSearch"), unaccented)
                ));
            }

            if (players != null && !players.isBlank()) {
                predicates.add(playersPredicate(root, cb, players.trim()));
            }

            if (contextSlugs != null && !contextSlugs.isEmpty() && query != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Game> subRoot = subquery.from(Game.class);
                subquery.select(subRoot.get("id"))
                        .where(subRoot.join("contexts").get("slug").in(contextSlugs));
                predicates.add(root.get("id").in(subquery));
            }

            if (purposeSlugs != null && !purposeSlugs.isEmpty() && query != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Game> subRoot = subquery.from(Game.class);
                subquery.select(subRoot.get("id"))
                        .where(subRoot.join("purposes").get("slug").in(purposeSlugs));
                predicates.add(root.get("id").in(subquery));
            }

            if (duration != null && !duration.isBlank()) {
                predicates.add(durationPredicate(root, cb, duration.trim()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate playersPredicate(Root<Game> root, CriteriaBuilder cb, String players) {
        Path<Integer> count = root.get("minPlayers");
        return switch (players) {
            case "2" -> cb.equal(count, 2);
            case "3-4" -> cb.and(cb.greaterThanOrEqualTo(count, 3), cb.lessThanOrEqualTo(count, 4));
            case "5" -> cb.equal(count, 5);
            case "6-10" -> cb.and(cb.greaterThanOrEqualTo(count, 6), cb.lessThanOrEqualTo(count, 10));
            case "10+", "10plus", "10" -> cb.greaterThanOrEqualTo(count, 10);
            default -> cb.conjunction();
        };
    }

    private static Predicate durationPredicate(Root<Game> root, CriteriaBuilder cb, String duration) {
        Path<Integer> minutes = root.get("durationMin");
        return switch (duration) {
            case "under-5", "<5" -> cb.lessThan(minutes, 5);
            case "5-7" -> cb.and(cb.greaterThanOrEqualTo(minutes, 5), cb.lessThanOrEqualTo(minutes, 7));
            case "8-10" -> cb.and(cb.greaterThanOrEqualTo(minutes, 8), cb.lessThanOrEqualTo(minutes, 10));
            case "10-15" -> cb.and(cb.greaterThanOrEqualTo(minutes, 10), cb.lessThanOrEqualTo(minutes, 15));
            case "over-15", ">15" -> cb.greaterThan(minutes, 15);
            default -> cb.conjunction();
        };
    }
}
