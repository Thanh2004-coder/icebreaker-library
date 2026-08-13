package com.warmup.library.dto;

import java.time.Instant;

public record ReviewDto(
        Long id,
        Long gameId,
        String displayName,
        Integer rating,
        String comment,
        Instant createdAt
) {
}
