package com.drishti.util;

import java.util.Locale;

public final class EmailNormalizer {

    private EmailNormalizer() {
        // Utility class
    }

    /**
     * Normalizes an email address by trimming whitespace and converting to lowercase.
     *
     * @param email The raw email address
     * @return Normalized email or null if input is null
     */
    public static String normalize(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
