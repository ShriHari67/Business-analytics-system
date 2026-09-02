package com.businessanalytics.system.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private BigDecimal totalSales;       // Total gross sales before tax/discount
    private BigDecimal totalRevenue;     // Net revenue
    private Long totalOrders;            // Order count
    private Long totalCustomers;         // Customer count
    private BigDecimal totalProfit;      // Revenue - Cost
    private Double growthPercentage;     // Month-over-month or period growth %
    private Double profitMarginPercent;  // Profit / Revenue * 100

    private List<Map<String, Object>> salesTrend;       // [{date, revenue, orders, profit}]
    private List<Map<String, Object>> categoryPerformance; // [{name, revenue, ordersCount, percentage}]
    private List<Map<String, Object>> topProducts;      // [{name, unitsSold, revenue, profit}]
    private List<Map<String, Object>> recentOrders;     // Top 5 latest orders
    private Long lowStockCount;

    public DashboardStatsDTO() {}

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Long totalCustomers) { this.totalCustomers = totalCustomers; }

    public BigDecimal getTotalProfit() { return totalProfit; }
    public void setTotalProfit(BigDecimal totalProfit) { this.totalProfit = totalProfit; }

    public Double getGrowthPercentage() { return growthPercentage; }
    public void setGrowthPercentage(Double growthPercentage) { this.growthPercentage = growthPercentage; }

    public Double getProfitMarginPercent() { return profitMarginPercent; }
    public void setProfitMarginPercent(Double profitMarginPercent) { this.profitMarginPercent = profitMarginPercent; }

    public List<Map<String, Object>> getSalesTrend() { return salesTrend; }
    public void setSalesTrend(List<Map<String, Object>> salesTrend) { this.salesTrend = salesTrend; }

    public List<Map<String, Object>> getCategoryPerformance() { return categoryPerformance; }
    public void setCategoryPerformance(List<Map<String, Object>> categoryPerformance) { this.categoryPerformance = categoryPerformance; }

    public List<Map<String, Object>> getTopProducts() { return topProducts; }
    public void setTopProducts(List<Map<String, Object>> topProducts) { this.topProducts = topProducts; }

    public List<Map<String, Object>> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<Map<String, Object>> recentOrders) { this.recentOrders = recentOrders; }

    public Long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(Long lowStockCount) { this.lowStockCount = lowStockCount; }
}
