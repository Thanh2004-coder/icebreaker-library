package com.warmup.library.seed;

import com.warmup.library.domain.ContextTag;
import com.warmup.library.domain.Game;
import com.warmup.library.domain.PurposeTag;
import com.warmup.library.repository.ContextTagRepository;
import com.warmup.library.repository.GameRepository;
import com.warmup.library.repository.PurposeTagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final Set<String> ALLOWED_CONTEXT_SLUGS = Set.of(
            "classroom", "indoor", "outdoor", "campus", "small-group"
    );

    private final GameRepository gameRepository;
    private final ContextTagRepository contextTagRepository;
    private final PurposeTagRepository purposeTagRepository;

    public DataSeeder(
            GameRepository gameRepository,
            ContextTagRepository contextTagRepository,
            PurposeTagRepository purposeTagRepository
    ) {
        this.gameRepository = gameRepository;
        this.contextTagRepository = contextTagRepository;
        this.purposeTagRepository = purposeTagRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Map<String, ContextTag> contexts = seedContexts();
        Map<String, PurposeTag> purposes = seedPurposes();

        int updated = 0;
        int created = 0;
        for (GameSeed seed : GamesCatalog.all()) {
            Game game = gameRepository.findByName(seed.name()).orElseGet(Game::new);
            boolean isNew = game.getId() == null;
            applySeed(game, seed, contexts, purposes);
            gameRepository.save(game);
            if (isNew) {
                created++;
            } else {
                updated++;
            }
        }

        gameRepository.flush();
        removeObsoleteContexts();
        log.info("Games upsert complete. created={}, updated={}, total={}", created, updated, gameRepository.count());
    }

    private void applySeed(
            Game game,
            GameSeed seed,
            Map<String, ContextTag> contexts,
            Map<String, PurposeTag> purposes
    ) {
        game.setName(seed.name());
        game.setDescription(seed.description());
        game.setHowToPlay(seed.howToPlay().strip());
        game.setDurationMin(seed.durationMin());
        game.setDurationMax(seed.durationMax());
        game.setMinPlayers(seed.minPlayers());
        game.setMaxPlayers(seed.maxPlayers());
        game.setPreparationRequired(seed.preparationRequired());
        game.setPreparationTime(seed.preparationTime());
        game.setPreparation(seed.preparation());
        game.setRules((seed.extraRules() + "\n\n" + GamesCatalog.COMMON_RULES).strip());

        game.getContexts().clear();
        seed.contextSlugs().forEach(slug -> game.getContexts().add(contexts.get(slug)));
        game.getPurposes().clear();
        seed.purposeSlugs().forEach(slug -> game.getPurposes().add(purposes.get(slug)));
        game.syncDisplayTags();
    }

    private Map<String, ContextTag> seedContexts() {
        Map<String, String> items = new LinkedHashMap<>();
        items.put("classroom", "Trong lớp học");
        items.put("indoor", "Trong phòng");
        items.put("outdoor", "Ngoài trời");
        items.put("campus", "Campus");
        items.put("small-group", "Nhóm nhỏ");

        Map<String, ContextTag> result = new LinkedHashMap<>();
        items.forEach((slug, name) -> {
            ContextTag tag = contextTagRepository.findBySlug(slug).orElseGet(ContextTag::new);
            tag.setSlug(slug);
            tag.setName(name);
            result.put(slug, contextTagRepository.save(tag));
        });
        return result;
    }

    private Map<String, PurposeTag> seedPurposes() {
        Map<String, String> items = new LinkedHashMap<>();
        items.put("meet", "Làm quen");
        items.put("icebreak", "Phá băng");
        items.put("laugh", "Tạo tiếng cười");
        items.put("interact", "Tăng tương tác");
        items.put("common", "Tìm điểm chung");
        items.put("comfort", "Tạo sự thoải mái");
        items.put("communicate", "Giao tiếp");
        items.put("kickoff", "Khởi động trước khi họp nhóm");

        Map<String, PurposeTag> result = new LinkedHashMap<>();
        items.forEach((slug, name) -> result.put(slug, purposeTagRepository.findBySlug(slug)
                .orElseGet(() -> purposeTagRepository.save(new PurposeTag(slug, name)))));
        return result;
    }

    private void removeObsoleteContexts() {
        for (ContextTag tag : new HashSet<>(contextTagRepository.findAll())) {
            if (!ALLOWED_CONTEXT_SLUGS.contains(tag.getSlug())) {
                contextTagRepository.delete(tag);
            }
        }
    }
}
