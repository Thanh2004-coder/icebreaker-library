package com.warmup.library.repository;

import com.warmup.library.domain.ContextTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContextTagRepository extends JpaRepository<ContextTag, Long> {
    Optional<ContextTag> findBySlug(String slug);
}
