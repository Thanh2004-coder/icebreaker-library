package com.warmup.library.controller;

import com.warmup.library.dto.FilterCatalogDto;
import com.warmup.library.dto.GameDetailDto;
import com.warmup.library.dto.GameSummaryDto;
import com.warmup.library.dto.PageResponse;
import com.warmup.library.service.GameService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/games")
    public PageResponse<GameSummaryDto> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String players,
            @RequestParam(required = false) String context,
            @RequestParam(required = false) String purpose,
            @RequestParam(required = false) String duration,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return gameService.search(search, players, context, purpose, duration, page, size);
    }

    @GetMapping("/games/{id}")
    public GameDetailDto detail(@PathVariable Long id) {
        return gameService.getById(id);
    }

    @GetMapping("/filters")
    public FilterCatalogDto filters() {
        return gameService.filters();
    }

    @GetMapping("/health")
    public java.util.Map<String, String> health() {
        return java.util.Map.of("status", "ok");
    }
}
