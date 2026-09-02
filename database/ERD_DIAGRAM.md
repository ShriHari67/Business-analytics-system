# Business Analytics System - Database Architecture & ERD

This document specifies the relational database schema design for the **Business Analytics System**, optimized for small and medium-scale businesses using MySQL 8.0+.

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar role
    }

    ACCOUNTS {
        bigint id PK
        varchar account_code UK
        varchar account_name
        enum account_type
        decimal current_balance
    }

    CUSTOMERS {
        bigint id PK
        varchar customer_code UK
        varchar name
        varchar phone
        decimal credit_limit
        decimal outstanding_balance
    }

    SUPPLIERS {
        bigint id PK
        varchar supplier_code UK
        varchar company_name
        varchar contact_person
        decimal outstanding_balance
    }

    PRODUCT_CATEGORIES {
        bigint id PK
        varchar name UK
    }

    PRODUCTS {
        bigint id PK
        varchar sku UK
        varchar name
        bigint category_id FK
        decimal cost_price
        decimal selling_price
        int stock_quantity
    }

    SALES {
        bigint id PK
        varchar invoice_number UK
        bigint customer_id FK
        date sale_date
        decimal total_amount
        decimal paid_amount
        decimal due_amount
        enum payment_status
    }

    SALE_ITEMS {
        bigint id PK
        bigint sale_id FK
        bigint product_id FK
        int quantity
        decimal unit_price
        decimal total_price
    }

    PURCHASES {
        bigint id PK
        varchar purchase_number UK
        bigint supplier_id FK
        date purchase_date
        decimal total_amount
        decimal paid_amount
        decimal due_amount
    }

    PURCHASE_ITEMS {
        bigint id PK
        bigint purchase_id FK
        bigint product_id FK
        int quantity
        decimal unit_cost
        decimal total_cost
    }

    EXPENSES {
        bigint id PK
        varchar expense_number UK
        bigint category_id FK
        date expense_date
        decimal amount
        enum payment_method
    }

    EMPLOYEES {
        bigint id PK
        varchar employee_code UK
        varchar full_name
        varchar designation
        decimal base_salary
        enum status
    }

    SALARY_PAYMENTS {
        bigint id PK
        varchar payment_number UK
        bigint employee_id FK
        varchar salary_month
        decimal net_salary
        date payment_date
    }

    CREDIT_DEBIT_LEDGER {
        bigint id PK
        date transaction_date
        bigint account_id FK
        bigint customer_id FK
        bigint supplier_id FK
        enum entry_type
        decimal amount
    }

    CUSTOMERS ||--o{ SALES : "places"
    SALES ||--|{ SALE_ITEMS : "contains"
    PRODUCTS ||--o{ SALE_ITEMS : "referenced in"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "categorizes"

    SUPPLIERS ||--o{ PURCHASES : "fulfills"
    PURCHASES ||--|{ PURCHASE_ITEMS : "contains"
    PRODUCTS ||--o{ PURCHASE_ITEMS : "stocked via"

    EMPLOYEES ||--o{ SALARY_PAYMENTS : "receives"

    ACCOUNTS ||--o{ CREDIT_DEBIT_LEDGER : "recorded against"
    CUSTOMERS ||--o{ CREDIT_DEBIT_LEDGER : "incurs"
    SUPPLIERS ||--o{ CREDIT_DEBIT_LEDGER : "settles"
```

## Relational Design Highlights

1. **Double-Entry Ledger Integrity**: The `credit_debit_ledger` and `accounts` tables maintain full auditability for every rupee/dollar flowing in or out of the business.
2. **Customer & Supplier Credit Tracking**: Receivables (customer dues) and payables (supplier dues) are tracked both in transactional documents (`sales`, `purchases`) and indexed contact balances (`customers.outstanding_balance`, `suppliers.outstanding_balance`).
3. **Flexible Inventory & Service Support**: Products support both physical inventory items with stock tracking (`reorder_level`) and billable service hours.
4. **Payroll & Operational Expenses**: Decoupled tables for routine operational overhead (`expenses`) and recurring staff compensation (`salary_payments`).
5. **Analytics Snapshots**: Pre-aggregated metrics in `monthly_analytics_snapshots` enable fast loading for long-term historical dashboards.
