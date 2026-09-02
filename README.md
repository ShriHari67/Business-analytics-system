# Business Analytics System (Dynamic SaaS Application)

A fully functional, real-world, responsive **Business Analytics System** built for small-to-medium enterprises.

> ⚡ **Strict Zero-Hardcoded Data Policy**: All dashboard KPI cards, interactive charts, statistical aggregations, business insights, reports, payroll metrics, credit receivables, and debit expenses are dynamically computed **strictly from user-entered or spreadsheet-uploaded business data**. When no data exists, the system presents an empty state with zero fake numbers.

---

## 🚀 Business Modules & Capabilities

### 1. 💼 Employee Salary Module
- **Manual Payroll Entry & CRUD**:
  - Fields: `Employee Name`, `Employee ID`, `Department`, `Salary Month`, `Basic Salary`, `Bonus`, `Deduction`, `Net Salary`, `Payment Status`, `Payment Date`.
  - **Automatic Calculation**: $\text{Net Salary} = \text{Basic Salary} + \text{Bonus} - \text{Deduction}$.
  - Search employees by Name/ID, filter by Salary Month, filter by Department, toggle payment status (`PAID` / `PENDING`).
- **KPI Metrics Display**:
  - **Total Employees**: Count of active staff
  - **Total Salary Paid**: Disbursed payroll amount
  - **Pending Salary**: Awaiting disbursement
  - **Total Bonus**: Incentives & perks allocated
  - **Total Deductions**: TDS, PF & statutory deductions
- **Payroll Analytics**: Interactive Department Payroll Distribution chart.

### 2. 📥 Business Credit Module (Accounts Receivable)
- **Tracking Inflow Receivables**:
  - Fields: `Date`, `Customer / Business Name`, `Description`, `Credit Amount`, `Due Date`, `Payment Status` (`PAID` / `PENDING`).
  - Add, Edit, Delete, Search, and Status toggle.
- **KPI Metrics Display**:
  - **Total Credit**: Sum of all receivables
  - **Paid Credit**: Amount collected / recovered
  - **Pending Credit**: Outstanding customer dues
  - **Number of Transactions**: Invoices count
- **Credit Analytics**: Monthly Credit trend chart & Paid vs. Pending recovery ratio bars.

### 3. 📤 Business Debit Module (Accounts Payable & Expenses)
- **Tracking Outflow Expenses**:
  - Fields: `Date`, `Vendor / Business Name`, `Description`, `Category` *(Inventory, Rent, Utilities, Marketing, Cloud, Logistics, Operations, Other)*, `Debit Amount`, `Payment Status` (`PAID` / `PENDING`).
  - Add, Edit, Delete, Search, and Filter by Category/Status.
- **KPI Metrics Display**:
  - **Total Debit**: Sum of all business outflows
  - **Paid Debit**: Settled supplier bills
  - **Pending Debit**: Payables due
  - **Number of Transactions**: Total expense entries
- **Debit Analytics**: Debit Outflows by Category distribution & Monthly Debit trend.

### 4. ⚖️ Integrated Business Balance & Working Capital
- Integrated seamlessly on the executive dashboard:
  - **Total Salary**: $\sum \text{Net Salary}$
  - **Total Credit**: $\sum \text{Credit Amount}$
  - **Total Debit**: $\sum \text{Debit Amount}$
  - **Net Business Balance**: $\text{Total Credit} - \text{Total Debit}$
  - Real-time reactivity: Adding, editing, or deleting transactions in any module immediately updates the working capital balance.

### 5. 📊 Core Sales Analytics & Dynamic Dashboard
- **8 Dynamic KPI Cards**: Total Revenue, Total Sales (Units), Total Cost, Total Profit, Unique Products, Unique Customers, Average Order Value (AOV), and Profit Margin %.
- **8 Interactive SVG/Canvas Charts**: Monthly Revenue, Monthly Profit, Sales by Product, Category Breakdown, Revenue by Region, Top 5 Products Leaderboard, Profit vs. Cost Ratio, Customer Lifetime Spend.

### 6. 🤖 AI-Powered Business Analytics Assistant
- Floating assistant widget (`🤖`) at bottom-right corner.
- Answers natural language questions on sales, payroll, credit receivables, and debit expenses with full context memory.

### 7. 📑 Reports & Multi-Format Exports
- 5 Statement Views with CSV, Excel (.xls), and PDF / Print View exports.

---

## 🏃 Running the Application

### 1. Frontend Web Client (React + Vite)
```bash
cd frontend
npm.cmd run dev
```
> Open [**`http://localhost:5173/`**](http://localhost:5173/) in your web browser.

### 2. Python Analytics Microservice (Optional Background Service)
```bash
cd analytics
python app.py
```
> Running on **`http://localhost:5000`**
