package com.businessanalytics.system.service;

import com.businessanalytics.system.model.Customer;
import com.businessanalytics.system.model.Order;
import com.businessanalytics.system.model.OrderItem;
import com.businessanalytics.system.model.Product;
import com.businessanalytics.system.repository.CustomerRepository;
import com.businessanalytics.system.repository.OrderRepository;
import com.businessanalytics.system.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Autowired
    public ReportService(OrderRepository orderRepository,
                         CustomerRepository customerRepository,
                         ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public Map<String, Object> generateReport(String type, String startDateStr, String endDateStr, String search) {
        LocalDate start = (startDateStr != null && !startDateStr.isEmpty()) ? LocalDate.parse(startDateStr) : LocalDate.now().minusDays(60);
        LocalDate end = (endDateStr != null && !endDateStr.isEmpty()) ? LocalDate.parse(endDateStr) : LocalDate.now();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !o.getOrderDate().isBefore(start) && !o.getOrderDate().isAfter(end))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("reportType", type);
        response.put("startDate", start.toString());
        response.put("endDate", end.toString());

        switch (type.toLowerCase()) {
            case "sales":
            case "revenue":
            case "profit":
                List<Map<String, Object>> salesRows = new ArrayList<>();
                for (Order o : orders) {
                    if (search != null && !search.isEmpty()) {
                        String cust = (o.getCustomer() != null) ? o.getCustomer().getName().toLowerCase() : "";
                        if (!o.getOrderNumber().toLowerCase().contains(search.toLowerCase()) && !cust.contains(search.toLowerCase())) {
                            continue;
                        }
                    }
                    salesRows.add(Map.of(
                            "orderNumber", o.getOrderNumber(),
                            "date", o.getOrderDate().toString(),
                            "customer", o.getCustomer() != null ? o.getCustomer().getName() : "Walk-in",
                            "itemsCount", o.getItems().size(),
                            "revenue", o.getTotalAmount(),
                            "cost", o.getTotalCost(),
                            "profit", o.getProfit(),
                            "status", o.getStatus(),
                            "paymentMethod", o.getPaymentMethod()
                    ));
                }
                response.put("records", salesRows);
                response.put("totalRecords", salesRows.size());
                break;

            case "customers":
                List<Customer> customers = customerRepository.findAll();
                List<Map<String, Object>> custRows = customers.stream()
                        .filter(c -> search == null || search.isEmpty() || c.getName().toLowerCase().contains(search.toLowerCase()))
                        .map(c -> Map.of(
                                "customerCode", (Object) c.getCustomerCode(),
                                "name", c.getName(),
                                "phone", c.getPhone() != null ? c.getPhone() : "-",
                                "email", c.getEmail() != null ? c.getEmail() : "-",
                                "ordersCount", c.getTotalOrdersCount(),
                                "totalSpent", c.getTotalSpent(),
                                "creditLimit", c.getCreditLimit()
                        ))
                        .collect(Collectors.toList());
                response.put("records", custRows);
                response.put("totalRecords", custRows.size());
                break;

            case "products":
                List<Product> products = productRepository.findAll();
                List<Map<String, Object>> prodRows = products.stream()
                        .filter(p -> search == null || search.isEmpty() || p.getName().toLowerCase().contains(search.toLowerCase()) || p.getSku().toLowerCase().contains(search.toLowerCase()))
                        .map(p -> Map.of(
                                "sku", (Object) p.getSku(),
                                "name", p.getName(),
                                "category", p.getCategory() != null ? p.getCategory().getName() : "General",
                                "costPrice", p.getCostPrice(),
                                "sellingPrice", p.getSellingPrice(),
                                "stock", p.getStockQuantity(),
                                "status", p.isLowStock() ? "LOW STOCK" : "IN STOCK"
                        ))
                        .collect(Collectors.toList());
                response.put("records", prodRows);
                response.put("totalRecords", prodRows.size());
                break;

            default:
                response.put("records", Collections.emptyList());
                response.put("totalRecords", 0);
        }

        return response;
    }

    public String generateCsv(String type, String startDate, String endDate, String search) {
        Map<String, Object> data = generateReport(type, startDate, endDate, search);
        List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("records");

        if (records == null || records.isEmpty()) {
            return "No data available for the selected criteria\n";
        }

        StringBuilder csv = new StringBuilder();
        Set<String> headers = records.get(0).keySet();
        csv.append(String.join(",", headers)).append("\n");

        for (Map<String, Object> row : records) {
            List<String> values = new ArrayList<>();
            for (String h : headers) {
                Object val = row.get(h);
                String valStr = val != null ? val.toString().replace("\"", "\"\"") : "";
                values.add("\"" + valStr + "\"");
            }
            csv.append(String.join(",", values)).append("\n");
        }

        return csv.toString();
    }
}
