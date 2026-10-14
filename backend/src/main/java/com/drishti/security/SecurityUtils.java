package com.drishti.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class
    }

    /**
     * Gets the currently authenticated UserPrincipal.
     */
    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    /**
     * Gets the email / username of the currently authenticated user.
     */
    public static Optional<String> getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserPrincipal userPrincipal) {
                return Optional.ofNullable(userPrincipal.getEmail());
            } else if (principal instanceof UserDetails userDetails) {
                return Optional.ofNullable(userDetails.getUsername());
            } else if (principal instanceof String principalString && !"anonymousUser".equals(principalString)) {
                return Optional.of(principalString);
            }
            if (authentication.getName() != null && !"anonymousUser".equals(authentication.getName())) {
                return Optional.of(authentication.getName());
            }
        }
        return Optional.empty();
    }

    /**
     * Gets the user ID of the currently authenticated user.
     */
    public static Optional<String> getCurrentUserId() {
        return getCurrentUserPrincipal().map(UserPrincipal::getId);
    }
}
