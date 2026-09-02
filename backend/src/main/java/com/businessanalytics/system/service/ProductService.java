package com.businessanalytics.system.service;

import com.businessanalytics.system.dto.ProductDTO;
import com.businessanalytics.system.exception.BadRequestException;
import com.businessanalytics.system.exception.ResourceNotFoundException;
import com.businessanalytics.system.model.Category;
import com.businessanalytics.system.model.Product;
import com.businessanalytics.system.repository.CategoryRepository;
import com.businessanalytics.system.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    public ProductDTO createProduct(ProductDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Product name is required");
        }
        if (dto.getSku() == null || dto.getSku().trim().isEmpty()) {
            throw new BadRequestException("Product SKU is required");
        }
        if (productRepository.existsBySku(dto.getSku().trim())) {
            throw new BadRequestException("Product with this SKU already exists");
        }

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BadRequestException("Category not found with id: " + dto.getCategoryId()));
        }

        Product product = new Product(
                dto.getSku().trim(),
                dto.getName().trim(),
                category,
                dto.getUnit(),
                dto.getCostPrice() != null ? dto.getCostPrice() : BigDecimal.ZERO,
                dto.getSellingPrice() != null ? dto.getSellingPrice() : BigDecimal.ZERO,
                dto.getStockQuantity() != null ? dto.getStockQuantity() : 0,
                dto.getReorderLevel() != null ? dto.getReorderLevel() : 5
        );

        product = productRepository.save(product);
        return mapToDTO(product);
    }

    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (dto.getName() != null) product.setName(dto.getName().trim());
        if (dto.getUnit() != null) product.setUnit(dto.getUnit());
        if (dto.getCostPrice() != null) product.setCostPrice(dto.getCostPrice());
        if (dto.getSellingPrice() != null) product.setSellingPrice(dto.getSellingPrice());
        if (dto.getStockQuantity() != null) product.setStockQuantity(dto.getStockQuantity());
        if (dto.getReorderLevel() != null) product.setReorderLevel(dto.getReorderLevel());
        if (dto.getIsActive() != null) product.setIsActive(dto.getIsActive());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BadRequestException("Category not found"));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        return mapToDTO(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDTO mapToDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setSku(p.getSku());
        dto.setName(p.getName());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        }
        dto.setUnit(p.getUnit());
        dto.setCostPrice(p.getCostPrice());
        dto.setSellingPrice(p.getSellingPrice());
        dto.setStockQuantity(p.getStockQuantity());
        dto.setReorderLevel(p.getReorderLevel());
        dto.setIsLowStock(p.isLowStock());
        dto.setIsActive(p.getIsActive());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
