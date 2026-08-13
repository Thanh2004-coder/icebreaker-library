package com.warmup.library.repository;

import com.warmup.library.domain.Game;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long>, JpaSpecificationExecutor<Game> {

    @Override
    @EntityGraph(attributePaths = {"contexts", "purposes"})
    Optional<Game> findById(Long id);

    @EntityGraph(attributePaths = {"contexts", "purposes"})
    Optional<Game> findByName(String name);
}
