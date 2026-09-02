package com.businessanalytics.system.service;

import com.businessanalytics.system.dto.CategoryDTO;
import com.businessanalytics.system.exception.BadRequestException;
import com.businessanalytics.system.exception.ResourceNotFoundException;
import com.businessanalytics.system.model.Category;
import com.businessanalytics.system.repository.CategoryRepository;
import com.businessanalytics.system.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDTO(category);
    }

    public CategoryDTO createCategory(CategoryDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Category name is required");
        }
        if (categoryRepository.existsByName(dto.getName().trim())) {
            throw new BadRequestException("Category with this name already exists");
        }

        Category category = new Category(dto.getName().trim(), dto.getDescription());
        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            category.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription());
        }

        category = categoryRepository.save(category);
        return mapToDTO(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDTO mapToDTO(Category cat) {
        int count = productRepository.findByCategoryId(cat.getId()).size();
        return new CategoryDTO(cat.getId(), cat.getName(), cat.getDescription(), count, cat.getCreatedAt());
    }
}
