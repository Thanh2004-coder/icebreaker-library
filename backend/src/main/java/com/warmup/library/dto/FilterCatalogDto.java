package com.warmup.library.dto;

import java.util.List;

public record FilterCatalogDto(
        List<FilterOptionDto> players,
        List<FilterOptionDto> contexts,
        List<FilterOptionDto> purposes,
        List<FilterOptionDto> durations
) {
}
