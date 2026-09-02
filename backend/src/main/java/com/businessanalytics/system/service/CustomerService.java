package com.businessanalytics.system.service;

import com.businessanalytics.system.dto.CustomerDTO;
import com.businessanalytics.system.exception.BadRequestException;
import com.businessanalytics.system.exception.ResourceNotFoundException;
import com.businessanalytics.system.model.Customer;
import com.businessanalytics.system.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToDTO(customer);
    }

    public CustomerDTO createCustomer(CustomerDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Customer name is required");
        }

        String code = dto.getCustomerCode();
        if (code == null || code.trim().isEmpty()) {
            code = "CUST-" + (100 + customerRepository.count() + 1);
        }

        if (customerRepository.existsByCustomerCode(code)) {
            code = "CUST-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        Customer customer = new Customer(
                code,
                dto.getName().trim(),
                dto.getPhone(),
                dto.getEmail(),
                dto.getAddress(),
                dto.getCreditLimit() != null ? dto.getCreditLimit() : BigDecimal.ZERO
        );

        customer = customerRepository.save(customer);
        return mapToDTO(customer);
    }

    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (dto.getName() != null) customer.setName(dto.getName().trim());
        if (dto.getPhone() != null) customer.setPhone(dto.getPhone());
        if (dto.getEmail() != null) customer.setEmail(dto.getEmail());
        if (dto.getAddress() != null) customer.setAddress(dto.getAddress());
        if (dto.getCreditLimit() != null) customer.setCreditLimit(dto.getCreditLimit());

        customer = customerRepository.save(customer);
        return mapToDTO(customer);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    private CustomerDTO mapToDTO(Customer c) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(c.getId());
        dto.setCustomerCode(c.getCustomerCode());
        dto.setName(c.getName());
        dto.setPhone(c.getPhone());
        dto.setEmail(c.getEmail());
        dto.setAddress(c.getAddress());
        dto.setCreditLimit(c.getCreditLimit());
        dto.setTotalSpent(c.getTotalSpent());
        dto.setTotalOrdersCount(c.getTotalOrdersCount());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
