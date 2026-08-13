package com.warmup.library.util;

import java.text.Normalizer;

public final class TextUtils {

    private TextUtils() {
    }

    public static String unaccent(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        return normalized
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'd')
                .toLowerCase();
    }
}
