package com.warmup.library.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
        @NotBlank(message = "Ten hien thi khong duoc rong")
        @Size(max = 80, message = "Ten hien thi toi da 80 ky tu")
        String displayName,

        @NotNull(message = "Rating la bat buoc")
        @Min(value = 1, message = "Rating toi thieu la 1")
        @Max(value = 5, message = "Rating toi da la 5")
        Integer rating,

        @NotBlank(message = "Noi dung danh gia khong duoc rong")
        @Size(max = 1000, message = "Noi dung toi da 1000 ky tu")
        String comment
) {
}
