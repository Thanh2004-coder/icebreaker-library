package com.warmup.library.domain;

import com.warmup.library.util.TextUtils;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "name_search", nullable = false, length = 200)
    private String nameSearch;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "how_to_play", nullable = false, columnDefinition = "TEXT")
    private String howToPlay;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "duration_max", nullable = false)
    private Integer durationMax;

    @Column(name = "min_players", nullable = false)
    private Integer minPlayers;

    @Column(name = "max_players")
    private Integer maxPlayers;

    @Column(length = 500)
    private String context;

    @Column(length = 500)
    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String preparation;

    @Column(name = "preparation_required", nullable = false)
    private Boolean preparationRequired = false;

    @Column(name = "preparation_time")
    private Integer preparationTime = 0;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToMany
    @JoinTable(
            name = "game_contexts",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "context_id")
    )
    private Set<ContextTag> contexts = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "game_purposes",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "purpose_id")
    )
    private Set<PurposeTag> purposes = new HashSet<>();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        nameSearch = TextUtils.unaccent(name);
        syncDisplayTags();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
        nameSearch = TextUtils.unaccent(name);
        syncDisplayTags();
    }

    public void syncDisplayTags() {
        this.context = contexts.stream()
                .sorted(Comparator.comparing(ContextTag::getName))
                .map(ContextTag::getName)
                .collect(Collectors.joining(", "));
        this.purpose = purposes.stream()
                .sorted(Comparator.comparing(PurposeTag::getName))
                .map(PurposeTag::getName)
                .collect(Collectors.joining(", "));
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNameSearch() {
        return nameSearch;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHowToPlay() {
        return howToPlay;
    }

    public void setHowToPlay(String howToPlay) {
        this.howToPlay = howToPlay;
    }

    public Integer getDurationMin() {
        return durationMin;
    }

    public void setDurationMin(Integer durationMin) {
        this.durationMin = durationMin;
    }

    public Integer getDurationMax() {
        return durationMax;
    }

    public void setDurationMax(Integer durationMax) {
        this.durationMax = durationMax;
    }

    public Integer getMinPlayers() {
        return minPlayers;
    }

    public void setMinPlayers(Integer minPlayers) {
        this.minPlayers = minPlayers;
    }

    public Integer getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public String getContext() {
        return context;
    }

    public String getPurpose() {
        return purpose;
    }

    public String getPreparation() {
        return preparation;
    }

    public void setPreparation(String preparation) {
        this.preparation = preparation;
    }

    public Boolean getPreparationRequired() {
        return preparationRequired;
    }

    public void setPreparationRequired(Boolean preparationRequired) {
        this.preparationRequired = preparationRequired;
    }

    public Integer getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Integer preparationTime) {
        this.preparationTime = preparationTime;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Set<ContextTag> getContexts() {
        return contexts;
    }

    public Set<PurposeTag> getPurposes() {
        return purposes;
    }
}
