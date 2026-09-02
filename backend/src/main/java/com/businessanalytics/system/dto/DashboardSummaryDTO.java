package com.businessanalytics.system.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Executive dashboard summary DTO containing key business health metrics.
 */
public class DashboardSummaryDTO {

    private BigDecimal totalSales;
    private BigDecimal totalPurchases;
    private BigDecimal totalExpenses;
    private BigDecimal totalSalaries;
    private BigDecimal grossProfit;
    private BigDecimal netProfit;
    private BigDecimal netCashFlow;
    private BigDecimal accountsReceivable; // Credit given to customers
    private BigDecimal accountsPayable;    // Due to suppliers
    private BigDecimal cashInHand;
    private Long totalCustomers;
    private Long totalSuppliers;
    private Long activeEmployees;

    private List<Map<String, Object>> recentTransactions;
    private List<Map<String, Object>> monthlyPerformance;

    public DashboardSummaryDTO() {}

    // Getters and Setters
    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public BigDecimal getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(BigDecimal totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getTotalSalaries() {
        return totalSalaries;
    }

    public void setTotalSalaries(BigDecimal totalSalaries) {
        this.totalSalaries = totalSalaries;
    }

    public BigDecimal getGrossProfit() {
        return grossProfit;
    }

    public void setGrossProfit(BigDecimal grossProfit) {
        this.grossProfit = grossProfit;
    }

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit;
    }

    public BigDecimal getNetCashFlow() {
        return netCashFlow;
    }

    public void setNetCashFlow(BigDecimal netCashFlow) {
        this.netCashFlow = netCashFlow;
    }

    public BigDecimal getAccountsReceivable() {
        return accountsReceivable;
    }

    public void setAccountsReceivable(BigDecimal accountsReceivable) {
        this.accountsReceivable = accountsReceivable;
    }

    public BigDecimal getAccountsPayable() {
        return accountsPayable;
    }

    public void setAccountsPayable(BigDecimal accountsPayable) {
        this.accountsPayable = accountsPayable;
    }

    public BigDecimal getCashInHand() {
        return cashInHand;
    }

    public void setCashInHand(BigDecimal cashInHand) {
        this.cashInHand = cashInHand;
    }

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(Long totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public Long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(Long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public List<Map<String, Object>> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<Map<String, Object>> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }

    public List<Map<String, Object>> getMonthlyPerformance() {
        return monthlyPerformance;
    }

    public void setMonthlyPerformance(List<Map<String, Object>> monthlyPerformance) {
        this.monthlyPerformance = monthlyPerformance;
    }
}
