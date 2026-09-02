-- ====================================================================
-- BUSINESS ANALYTICS SYSTEM - PRODUCTION DATABASE SCHEMA (MySQL 8.0+)
-- Description: Complete relational schema for live-use business operations.
-- Tables: Users, Roles, Categories, Products, Customers, Orders,
--         Order Items, Business Records, and Audit Logs.
-- ====================================================================

CREATE DATABASE IF NOT EXISTS business_analytics_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE business_analytics_db;

-- --------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION (RBAC: ADMIN, USER)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    reset_token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 2. PRODUCT CATEGORIES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 3. PRODUCTS & INVENTORY
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT,
    unit VARCHAR(20) DEFAULT 'pcs',
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_product_sku (sku),
    INDEX idx_product_category (category_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. CUSTOMERS & CREDIT LEDGERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(25),
    email VARCHAR(100),
    address TEXT,
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    total_orders_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_code (customer_code),
    INDEX idx_customer_phone (phone)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 5. ORDERS & SALES TRANSACTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    profit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CREDIT') DEFAULT 'UPI',
    status ENUM('COMPLETED', 'PENDING', 'CANCELLED') DEFAULT 'COMPLETED',
    notes TEXT,
    created_by_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_date (order_date),
    INDEX idx_order_status (status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 6. ORDER ITEMS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    profit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_item_product (product_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 7. BUSINESS TRANSACTIONS & ANALYTICS RECORDS (User-Entered Data)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_date DATE NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    quantity INT NOT NULL DEFAULT 1,
    sales DECIMAL(12, 2) NOT NULL DEFAULT 1.00,
    revenue DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    profit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    customer_name VARCHAR(150) NOT NULL DEFAULT 'Direct Client',
    region VARCHAR(100) NOT NULL DEFAULT 'North',
    salesperson VARCHAR(100) NOT NULL DEFAULT 'Direct',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_record_date (record_date),
    INDEX idx_record_product (product_name),
    INDEX idx_record_category (category),
    INDEX idx_record_region (region)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 8. EMPLOYEE SALARY & PAYROLL
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_salaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_name VARCHAR(150) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL DEFAULT 'General',
    salary_month VARCHAR(20) NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    bonus DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    deduction DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('PAID', 'PENDING') NOT NULL DEFAULT 'PAID',
    payment_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_salary_emp_id (employee_id),
    INDEX idx_salary_month (salary_month),
    INDEX idx_salary_status (payment_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 9. BUSINESS CREDIT & ACCOUNTS RECEIVABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_credits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    credit_date DATE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    description TEXT,
    credit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NULL,
    payment_status ENUM('PAID', 'PENDING') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_credit_date (credit_date),
    INDEX idx_credit_status (payment_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 10. BUSINESS DEBIT & ACCOUNTS PAYABLE / EXPENSES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_debits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    debit_date DATE NOT NULL,
    vendor_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Operations',
    debit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('PAID', 'PENDING') NOT NULL DEFAULT 'PAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_debit_date (debit_date),
    INDEX idx_debit_category (category),
    INDEX idx_debit_status (payment_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 11. AUDIT LOGS / SYSTEM ACTIVITY
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

