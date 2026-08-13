package com.warmup.library.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TextUtilsTest {

    @Test
    void unaccentRemovesVietnameseMarks() {
        assertEquals("doan chu nhan", TextUtils.unaccent("Đoán chủ nhân"));
        assertEquals("bingo lam quen", TextUtils.unaccent("Bingo làm quen"));
        assertTrue(TextUtils.unaccent("Truyền tin nhắn").contains("truyen tin"));
    }
}
