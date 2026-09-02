# Python Analytics Engine Module

The **Analytics Module** provides quantitative, statistical, and forecasting intelligence for the Business Analytics System using **Python**, **Pandas**, and **NumPy**.

## Features

- **Profit & Loss (P&L)**: Calculates total revenue, cost of purchases (COGS), operating expenses, staff payroll, gross/net margins.
- **Cash Flow Velocity**: Analyzes inflow vs outflow by payment mode (Cash, Bank, UPI) and cash surplus/deficit.
- **Sales Forecasting**: Uses NumPy moving average and linear trend analysis to predict sales performance.
- **Expense Pareto Breakdown**: Aggregates overhead categories and identifies key cost drivers.
- **REST Microservice**: Optional Flask API that can be consumed by the Spring Boot backend or React frontend directly.

## Installation & Setup

### 1. Prerequisites
- Python 3.10+ (Python 3.12 recommended)

### 2. Create Virtual Environment
```bash
cd analytics
python -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **Linux/macOS**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Offline Analytics Test
```bash
python analytics_engine.py
```

### 5. Run Analytics REST Microservice
```bash
python app.py
```
Microservice will be available at: `http://localhost:5000`

### API Endpoints
- `GET /health` - Health check
- `GET /analytics/summary` - Combined dashboard analytics (P&L, Cash Flow, Trends, Expenses)
- `GET /analytics/pnl` - Profit & Loss statement
- `GET /analytics/cashflow` - Cash Flow metrics
- `GET /analytics/forecast` - Sales forecasting and trend statistics
- `GET /analytics/expenses` - Expense distribution by category
