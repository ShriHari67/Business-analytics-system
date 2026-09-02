package com.businessanalytics.system.repository;

import com.businessanalytics.system.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByIsActiveTrue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= p.reorderLevel AND p.isActive = true")
    Long countLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.reorderLevel AND p.isActive = true")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProducts(@Param("query") String query);
}
