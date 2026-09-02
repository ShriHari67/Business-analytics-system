package com.businessanalytics.system.service;

import com.businessanalytics.system.dto.OrderCreateDTO;
import com.businessanalytics.system.dto.OrderItemDTO;
import com.businessanalytics.system.dto.OrderResponseDTO;
import com.businessanalytics.system.exception.BadRequestException;
import com.businessanalytics.system.exception.ResourceNotFoundException;
import com.businessanalytics.system.model.Customer;
import com.businessanalytics.system.model.Order;
import com.businessanalytics.system.model.OrderItem;
import com.businessanalytics.system.model.Product;
import com.businessanalytics.system.repository.CustomerRepository;
import com.businessanalytics.system.repository.OrderRepository;
import com.businessanalytics.system.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToDTO(order);
    }

    @Transactional
    public OrderResponseDTO createOrder(OrderCreateDTO dto) {
        if (dto.getCustomerId() == null) {
            throw new BadRequestException("Customer is required to place an order");
        }
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one line item");
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));

        String orderNumber = "ORD-" + LocalDate.now().getYear() + "-" + (1000 + orderRepository.count() + 1);

        Order order = new Order(
                orderNumber,
                customer,
                dto.getOrderDate() != null ? dto.getOrderDate() : LocalDate.now(),
                dto.getPaymentMethod(),
                dto.getStatus() != null ? dto.getStatus() : "COMPLETED",
                dto.getNotes()
        );

        if (dto.getDiscountAmount() != null) order.setDiscountAmount(dto.getDiscountAmount());
        if (dto.getTaxAmount() != null) order.setTaxAmount(dto.getTaxAmount());

        // Process line items & update inventory
        for (OrderItemDTO itemDTO : dto.getItems()) {
            if (itemDTO.getProductId() == null) {
                throw new BadRequestException("Product ID is required for each order item");
            }

            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProductId()));

            int quantity = (itemDTO.getQuantity() != null && itemDTO.getQuantity() > 0) ? itemDTO.getQuantity() : 1;

            // Deduct stock
            if (product.getStockQuantity() < quantity) {
                // Adjust or allow back-order with warning
                product.setStockQuantity(Math.max(0, product.getStockQuantity() - quantity));
            } else {
                product.setStockQuantity(product.getStockQuantity() - quantity);
            }
            productRepository.save(product);

            BigDecimal unitPrice = itemDTO.getUnitPrice() != null ? itemDTO.getUnitPrice() : product.getSellingPrice();
            BigDecimal unitCost = itemDTO.getUnitCost() != null ? itemDTO.getUnitCost() : product.getCostPrice();

            OrderItem item = new OrderItem(product, product.getName(), quantity, unitCost, unitPrice);
            order.addItem(item);
        }

        order.recalculateTotals();
        order = orderRepository.save(order);

        // Update customer cumulative analytics
        customer.setTotalSpent(customer.getTotalSpent().add(order.getTotalAmount()));
        customer.setTotalOrdersCount(customer.getTotalOrdersCount() + 1);
        customerRepository.save(customer);

        return mapToDTO(order);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setStatus(newStatus.toUpperCase());
        order = orderRepository.save(order);
        return mapToDTO(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Restore customer stats
        Customer customer = order.getCustomer();
        if (customer != null) {
            customer.setTotalSpent(customer.getTotalSpent().subtract(order.getTotalAmount()).max(BigDecimal.ZERO));
            customer.setTotalOrdersCount(Math.max(0, customer.getTotalOrdersCount() - 1));
            customerRepository.save(customer);
        }

        // Restore product stock quantities
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product p = item.getProduct();
                p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
                productRepository.save(p);
            }
        }

        orderRepository.delete(order);
    }

    private OrderResponseDTO mapToDTO(Order o) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        if (o.getCustomer() != null) {
            dto.setCustomerId(o.getCustomer().getId());
            dto.setCustomerName(o.getCustomer().getName());
            dto.setCustomerCode(o.getCustomer().getCustomerCode());
        }
        dto.setOrderDate(o.getOrderDate());
        dto.setSubtotal(o.getSubtotal());
        dto.setDiscountAmount(o.getDiscountAmount());
        dto.setTaxAmount(o.getTaxAmount());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setTotalCost(o.getTotalCost());
        dto.setProfit(o.getProfit());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setStatus(o.getStatus());
        dto.setNotes(o.getNotes());
        dto.setCreatedAt(o.getCreatedAt());

        List<OrderItemDTO> itemDTOs = o.getItems().stream().map(i -> {
            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setId(i.getId());
            if (i.getProduct() != null) itemDto.setProductId(i.getProduct().getId());
            itemDto.setProductName(i.getProductName());
            itemDto.setQuantity(i.getQuantity());
            itemDto.setUnitCost(i.getUnitCost());
            itemDto.setUnitPrice(i.getUnitPrice());
            itemDto.setTotalCost(i.getTotalCost());
            itemDto.setTotalPrice(i.getTotalPrice());
            itemDto.setProfit(i.getProfit());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
