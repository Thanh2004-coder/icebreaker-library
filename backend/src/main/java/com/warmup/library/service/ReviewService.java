package com.warmup.library.service;

import com.warmup.library.domain.Game;
import com.warmup.library.domain.Review;
import com.warmup.library.dto.CreateReviewRequest;
import com.warmup.library.dto.GameMapper;
import com.warmup.library.dto.RatingStats;
import com.warmup.library.dto.ReviewDto;
import com.warmup.library.repository.GameRepository;
import com.warmup.library.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final GameRepository gameRepository;

    public ReviewService(ReviewRepository reviewRepository, GameRepository gameRepository) {
        this.reviewRepository = reviewRepository;
        this.gameRepository = gameRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listByGame(Long gameId) {
        ensureGameExists(gameId);
        return reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId).stream()
                .map(GameMapper::toReview)
                .toList();
    }

    @Transactional
    public ReviewDto create(Long gameId, CreateReviewRequest request) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tro choi"));

        Review review = new Review();
        review.setGame(game);
        review.setDisplayName(request.displayName().trim());
        review.setRating(request.rating());
        review.setComment(request.comment().trim());
        return GameMapper.toReview(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public Map<Long, RatingStats> statsFor(Collection<Long> gameIds) {
        Map<Long, RatingStats> result = new HashMap<>();
        if (gameIds == null || gameIds.isEmpty()) {
            return result;
        }
        for (Object[] row : reviewRepository.statsByGameIds(gameIds)) {
            Long id = (Long) row[0];
            Double avg = row[1] == null ? null : ((Number) row[1]).doubleValue();
            long count = row[2] == null ? 0 : ((Number) row[2]).longValue();
            result.put(id, new RatingStats(avg, count));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public RatingStats statsForOne(Long gameId) {
        return statsFor(List.of(gameId)).getOrDefault(gameId, RatingStats.empty());
    }

    private void ensureGameExists(Long gameId) {
        if (!gameRepository.existsById(gameId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay tro choi");
        }
    }
}
