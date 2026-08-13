package com.warmup.library.repository;

import com.warmup.library.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByGameIdOrderByCreatedAtDesc(Long gameId);

    @Query("""
            SELECT r.game.id, AVG(r.rating), COUNT(r)
            FROM Review r
            WHERE r.game.id IN :ids
            GROUP BY r.game.id
            """)
    List<Object[]> statsByGameIds(@Param("ids") Collection<Long> ids);
}
