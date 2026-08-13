package com.warmup.library.repository;

import com.warmup.library.domain.PurposeTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PurposeTagRepository extends JpaRepository<PurposeTag, Long> {
    Optional<PurposeTag> findBySlug(String slug);
}
