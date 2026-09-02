package com.businessanalytics.system.security;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

/**
 * Token generation and validation utility for session authentication.
 */
@Component
public class JwtUtil {

    private static final String SECRET_KEY = "business-analytics-secure-signing-key-2026";
    private static final long EXPIRATION_SECONDS = 86400 * 7; // 7 days

    public String generateToken(Long userId, String username, String role) {
        long expiry = Instant.now().getEpochSecond() + EXPIRATION_SECONDS;
        String payload = userId + ":" + username + ":" + role + ":" + expiry + ":" + UUID.randomUUID().toString();
        String signature = sign(payload);
        String tokenData = payload + "." + signature;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenData.getBytes(StandardCharsets.UTF_8));
    }

    public TokenPayload validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }

        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            int lastDot = decoded.lastIndexOf('.');
            if (lastDot == -1) return null;

            String payload = decoded.substring(0, lastDot);
            String signature = decoded.substring(lastDot + 1);

            if (!sign(payload).equals(signature)) {
                return null;
            }

            String[] parts = payload.split(":");
            if (parts.length < 4) return null;

            Long userId = Long.parseLong(parts[0]);
            String username = parts[1];
            String role = parts[2];
            long expiry = Long.parseLong(parts[3]);

            if (Instant.now().getEpochSecond() > expiry) {
                return null; // Expired
            }

            return new TokenPayload(userId, username, role, true);
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((data + SECRET_KEY).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error signing token", e);
        }
    }

    public static class TokenPayload {
        private final Long userId;
        private final String username;
        private final String role;
        private final boolean valid;

        public TokenPayload(Long userId, String username, String role, boolean valid) {
            this.userId = userId;
            this.username = username;
            this.role = role;
            this.valid = valid;
        }

        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getRole() { return role; }
        public boolean isValid() { return valid; }
        public boolean isAdmin() { return "ADMIN".equalsIgnoreCase(role); }
    }
}
