package com.warmup.library.dto;

public record RatingStats(Double averageRating, long reviewCount) {

    public static RatingStats empty() {
        return new RatingStats(null, 0);
    }
}
