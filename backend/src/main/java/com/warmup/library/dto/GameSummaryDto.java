package com.warmup.library.dto;

import java.util.List;

public record GameSummaryDto(
        Long id,
        String name,
        String description,
        Integer durationMin,
        Integer durationMax,
        Integer minPlayers,
        Integer maxPlayers,
        String context,
        String purpose,
        String preparation,
        Boolean preparationRequired,
        Integer preparationTime,
        Double averageRating,
        Long reviewCount,
        List<String> contexts,
        List<String> purposes
) {
}
