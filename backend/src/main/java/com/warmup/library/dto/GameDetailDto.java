package com.warmup.library.dto;

import java.time.Instant;
import java.util.List;

public record GameDetailDto(
        Long id,
        String name,
        String description,
        String howToPlay,
        Integer durationMin,
        Integer durationMax,
        Integer minPlayers,
        Integer maxPlayers,
        String context,
        String purpose,
        String preparation,
        Boolean preparationRequired,
        Integer preparationTime,
        String rules,
        Double averageRating,
        Long reviewCount,
        Instant createdAt,
        Instant updatedAt,
        List<String> contexts,
        List<String> purposes
) {
}
