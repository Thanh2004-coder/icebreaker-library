package com.warmup.library.controller;

import com.warmup.library.dto.FilterCatalogDto;
import com.warmup.library.dto.GameDetailDto;
import com.warmup.library.dto.GameSummaryDto;
import com.warmup.library.dto.PageResponse;
import com.warmup.library.service.GameService;
import jakarta.servlet.http.HttpServletResponse;
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
            @RequestParam(defaultValue = "10") int size,
            HttpServletResponse response
    ) {
        long started = System.nanoTime();
        PageResponse<GameSummaryDto> body = gameService.search(search, players, context, purpose, duration, page, size);
        long appMs = (System.nanoTime() - started) / 1_000_000L;
        response.setHeader("Server-Timing", "app;desc=\"/api/games\";dur=" + appMs);
        response.setHeader("Access-Control-Expose-Headers", "Server-Timing");
        return body;
    }

    @GetMapping("/games/{id}")
    public GameDetailDto detail(@PathVariable Long id, HttpServletResponse response) {
        long started = System.nanoTime();
        GameDetailDto body = gameService.getById(id);
        long appMs = (System.nanoTime() - started) / 1_000_000L;
        response.setHeader("Server-Timing", "app;desc=\"/api/games/{id}\";dur=" + appMs);
        response.setHeader("Access-Control-Expose-Headers", "Server-Timing");
        return body;
    }

    @GetMapping("/filters")
    public FilterCatalogDto filters(HttpServletResponse response) {
        long started = System.nanoTime();
        FilterCatalogDto body = gameService.filters();
        long appMs = (System.nanoTime() - started) / 1_000_000L;
        response.setHeader("Server-Timing", "app;desc=\"/api/filters\";dur=" + appMs);
        response.setHeader("Access-Control-Expose-Headers", "Server-Timing");
        return body;
    }

    @GetMapping("/health")
    public java.util.Map<String, String> health() {
        return java.util.Map.of("status", "ok");
    }
}
