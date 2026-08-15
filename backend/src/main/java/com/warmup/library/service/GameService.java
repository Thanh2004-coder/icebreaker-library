package com.warmup.library.service;

import com.warmup.library.domain.Game;
import com.warmup.library.dto.FilterCatalogDto;
import com.warmup.library.dto.FilterOptionDto;
import com.warmup.library.dto.GameDetailDto;
import com.warmup.library.dto.GameMapper;
import com.warmup.library.dto.GameSummaryDto;
import com.warmup.library.dto.PageResponse;
import com.warmup.library.repository.ContextTagRepository;
import com.warmup.library.repository.GameRepository;
import com.warmup.library.repository.GameSummaryQuery;
import com.warmup.library.repository.PurposeTagRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GameService {

    private static final Map<String, String> PURPOSE_ALIASES = Map.of(
            "warmup", "kickoff",
            "lam-quen", "meet",
            "pha-bang", "icebreak",
            "tieng-cuoi", "laugh",
            "tuong-tac", "interact",
            "diem-chung", "common",
            "thoai-mai", "comfort",
            "giao-tiep", "communicate",
            "khoi-dong", "kickoff"
    );

    private static final java.util.Set<String> ALLOWED_CONTEXT_SLUGS = java.util.Set.of(
            "classroom", "indoor", "outdoor", "campus", "small-group"
    );

    private static final Map<String, String> CONTEXT_ALIASES = Map.ofEntries(
            Map.entry("classroom", "classroom"),
            Map.entry("class", "classroom"),
            Map.entry("gio-hoc", "classroom"),
            Map.entry("trong-lop-hoc", "classroom"),
            Map.entry("indoor", "indoor"),
            Map.entry("trong-phong", "indoor"),
            Map.entry("outdoor", "outdoor"),
            Map.entry("ngoai-troi", "outdoor"),
            Map.entry("campus", "campus"),
            Map.entry("small-group", "small-group"),
            Map.entry("nhom-nho", "small-group")
    );

    private final GameRepository gameRepository;
    private final GameSummaryQuery gameSummaryQuery;
    private final ContextTagRepository contextTagRepository;
    private final PurposeTagRepository purposeTagRepository;
    private final ReviewService reviewService;

    public GameService(
            GameRepository gameRepository,
            GameSummaryQuery gameSummaryQuery,
            ContextTagRepository contextTagRepository,
            PurposeTagRepository purposeTagRepository,
            ReviewService reviewService
    ) {
        this.gameRepository = gameRepository;
        this.gameSummaryQuery = gameSummaryQuery;
        this.contextTagRepository = contextTagRepository;
        this.purposeTagRepository = purposeTagRepository;
        this.reviewService = reviewService;
    }

    @Transactional(readOnly = true)
    public PageResponse<GameSummaryDto> search(
            String search,
            String players,
            String context,
            String purpose,
            String duration,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);

        return gameSummaryQuery.search(
                search,
                players,
                normalizeList(context, CONTEXT_ALIASES),
                normalizeList(purpose, PURPOSE_ALIASES),
                duration,
                safePage,
                safeSize
        );
    }

    @Transactional(readOnly = true)
    public GameDetailDto getById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tro choi"));
        return GameMapper.toDetail(game, reviewService.statsForOne(id));
    }

    @Transactional(readOnly = true)
    public FilterCatalogDto filters() {
        List<FilterOptionDto> contexts = contextTagRepository.findAll().stream()
                .filter(item -> ALLOWED_CONTEXT_SLUGS.contains(item.getSlug()))
                .map(item -> new FilterOptionDto(item.getSlug(), item.getName()))
                .toList();
        List<FilterOptionDto> purposes = purposeTagRepository.findAll().stream()
                .map(item -> new FilterOptionDto(item.getSlug(), item.getName()))
                .toList();

        return new FilterCatalogDto(
                List.of(
                        new FilterOptionDto("2", "2 người"),
                        new FilterOptionDto("3-4", "3–4 người"),
                        new FilterOptionDto("5", "5 người"),
                        new FilterOptionDto("6-10", "6–10 người"),
                        new FilterOptionDto("10+", "10+ người")
                ),
                contexts,
                purposes,
                List.of(
                        new FilterOptionDto("under-5", "Dưới 5 phút"),
                        new FilterOptionDto("5-7", "5–7 phút"),
                        new FilterOptionDto("8-10", "8–10 phút"),
                        new FilterOptionDto("10-15", "10–15 phút"),
                        new FilterOptionDto("over-15", "Trên 15 phút")
                )
        );
    }

    private List<String> normalizeList(String raw, Map<String, String> aliases) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .map(s -> aliases.getOrDefault(s, s))
                .forEach(values::add);
        return values;
    }
}
