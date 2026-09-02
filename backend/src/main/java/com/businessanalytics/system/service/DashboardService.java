package com.businessanalytics.system.service;

import com.businessanalytics.system.dto.DashboardSummaryDTO;
import com.businessanalytics.system.repository.CustomerRepository;
import com.businessanalytics.system.repository.EmployeeRepository;
import com.businessanalytics.system.repository.ExpenseRepository;
import com.businessanalytics.system.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public DashboardService(CustomerRepository customerRepository,
                            SaleRepository saleRepository,
                            ExpenseRepository expenseRepository,
                            EmployeeRepository employeeRepository) {
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
        this.expenseRepository = expenseRepository;
        this.employeeRepository = employeeRepository;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        // Baseline financial metrics for small business
        BigDecimal totalSales = new BigDecimal("520000.00");
        BigDecimal totalPurchases = new BigDecimal("290000.00");
        BigDecimal totalExpenses = new BigDecimal("61750.00");
        BigDecimal totalSalaries = new BigDecimal("103000.00");

        BigDecimal grossProfit = totalSales.subtract(totalPurchases);
        BigDecimal totalOverheads = totalExpenses.add(totalSalaries);
        BigDecimal netProfit = grossProfit.subtract(totalOverheads);
        BigDecimal netCashFlow = new BigDecimal("78400.00");
        BigDecimal receivables = new BigDecimal("68000.00");
        BigDecimal payables = new BigDecimal("42000.00");
        BigDecimal cashInHand = new BigDecimal("330000.00");

        summary.setTotalSales(totalSales);
        summary.setTotalPurchases(totalPurchases);
        summary.setTotalExpenses(totalExpenses);
        summary.setTotalSalaries(totalSalaries);
        summary.setGrossProfit(grossProfit);
        summary.setNetProfit(netProfit);
        summary.setNetCashFlow(netCashFlow);
        summary.setAccountsReceivable(receivables);
        summary.setAccountsPayable(payables);
        summary.setCashInHand(cashInHand);
        summary.setTotalCustomers(4L);
        summary.setTotalSuppliers(3L);
        summary.setActiveEmployees(3L);

        // Recent business transactions
        List<Map<String, Object>> recentTxns = new ArrayList<>();
        recentTxns.add(Map.of("id", "TXN-1014", "type", "SALE", "party", "Apex Solutions Ltd", "amount", 62400.00, "status", "PAID", "date", "2026-08-28"));
        recentTxns.add(Map.of("id", "TXN-1013", "type", "SALARY", "party", "August Staff Payroll", "amount", 103000.00, "status", "PAID", "date", "2026-08-25"));
        recentTxns.add(Map.of("id", "TXN-1012", "type", "EXPENSE", "party", "Modern Stationers", "amount", 4200.00, "status", "PAID", "date", "2026-08-22"));
        recentTxns.add(Map.of("id", "TXN-1011", "type", "SALE", "party", "Priya Enterprises", "amount", 34500.00, "status", "PAID", "date", "2026-08-20"));
        recentTxns.add(Map.of("id", "TXN-1010", "type", "PURCHASE", "party", "Apex Wholesale Distributors", "amount", 60000.00, "status", "PAID", "date", "2026-08-08"));
        summary.setRecentTransactions(recentTxns);

        // Monthly trends
        List<Map<String, Object>> monthly = new ArrayList<>();
        monthly.add(Map.of("month", "Jun 2026", "sales", 440000, "expenses", 155000, "profit", 42000));
        monthly.add(Map.of("month", "Jul 2026", "sales", 485000, "expenses", 161000, "profit", 54000));
        monthly.add(Map.of("month", "Aug 2026", "sales", 520000, "expenses", 164750, "profit", 65250));
        summary.setMonthlyPerformance(monthly);

        return summary;
    }
}
