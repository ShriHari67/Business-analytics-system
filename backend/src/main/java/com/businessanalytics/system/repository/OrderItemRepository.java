package com.businessanalytics.system.repository;

import com.businessanalytics.system.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByProductId(Long productId);

    @Query("SELECT oi.productName AS productName, SUM(oi.quantity) AS totalQty, SUM(oi.totalPrice) AS totalRevenue, SUM(oi.profit) AS totalProfit " +
           "FROM OrderItem oi GROUP BY oi.productName ORDER BY totalRevenue DESC")
    List<Map<String, Object>> getProductSalesSummary();
}
