package com.warmup.library.seed;

import java.util.List;

public record GameSeed(
        String name,
        String description,
        String howToPlay,
        int durationMin,
        int durationMax,
        int minPlayers,
        Integer maxPlayers,
        boolean preparationRequired,
        int preparationTime,
        String preparation,
        String extraRules,
        List<String> contextSlugs,
        List<String> purposeSlugs
) {
}
