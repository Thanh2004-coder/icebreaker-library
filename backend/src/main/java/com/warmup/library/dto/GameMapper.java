package com.warmup.library.dto;

import com.warmup.library.domain.ContextTag;
import com.warmup.library.domain.Game;
import com.warmup.library.domain.PurposeTag;
import com.warmup.library.domain.Review;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public final class GameMapper {

    private GameMapper() {
    }

    /**
     * List view: use denormalized context/purpose strings to avoid N+1 lazy loads
     * (findAll + Specification has no EntityGraph).
     */
    public static GameSummaryDto toSummary(Game game, RatingStats stats) {
        RatingStats safe = stats == null ? RatingStats.empty() : stats;
        return new GameSummaryDto(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getDurationMin(),
                game.getDurationMax(),
                game.getMinPlayers(),
                game.getMaxPlayers(),
                game.getContext(),
                game.getPurpose(),
                game.getPreparation(),
                game.getPreparationRequired(),
                game.getPreparationTime(),
                roundRating(safe.averageRating()),
                safe.reviewCount(),
                splitCsv(game.getContext()),
                splitCsv(game.getPurpose())
        );
    }

    public static GameDetailDto toDetail(Game game, RatingStats stats) {
        RatingStats safe = stats == null ? RatingStats.empty() : stats;
        return new GameDetailDto(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getHowToPlay(),
                game.getDurationMin(),
                game.getDurationMax(),
                game.getMinPlayers(),
                game.getMaxPlayers(),
                game.getContext(),
                game.getPurpose(),
                game.getPreparation(),
                game.getPreparationRequired(),
                game.getPreparationTime(),
                game.getRules(),
                roundRating(safe.averageRating()),
                safe.reviewCount(),
                game.getCreatedAt(),
                game.getUpdatedAt(),
                contextNames(game),
                purposeNames(game)
        );
    }

    public static ReviewDto toReview(Review review) {
        return new ReviewDto(
                review.getId(),
                review.getGame().getId(),
                review.getDisplayName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }

    public static Double roundRating(Double value) {
        if (value == null) {
            return null;
        }
        return Math.round(value * 10.0) / 10.0;
    }

    private static List<String> contextNames(Game game) {
        return game.getContexts().stream()
                .sorted(Comparator.comparing(ContextTag::getName))
                .map(ContextTag::getName)
                .toList();
    }

    private static List<String> purposeNames(Game game) {
        return game.getPurposes().stream()
                .sorted(Comparator.comparing(PurposeTag::getName))
                .map(PurposeTag::getName)
                .toList();
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
