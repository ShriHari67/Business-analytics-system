-- ====================================================================
-- BUSINESS ANALYTICS SYSTEM - INITIAL PRODUCTION SEED DATA
-- Description: System admin credentials only. ZERO hardcoded business data.
-- ====================================================================

USE business_analytics_db;

-- 1. SYSTEM USERS (admin / admin123, user1 / user123)
-- BCrypt password hashes
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
('admin', 'admin@analytics.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'System Administrator', 'ADMIN', TRUE),
('user1', 'user1@analytics.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Sales Associate', 'USER', TRUE);

-- NOTE: All business transaction data (orders, revenue, products, customers)
-- must be created by the user via the web interface or CSV/Excel file upload.
