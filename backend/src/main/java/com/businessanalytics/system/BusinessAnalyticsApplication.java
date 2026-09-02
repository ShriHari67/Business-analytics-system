package com.businessanalytics.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Business Analytics System
 * Full-stack enterprise web application entry point for small businesses.
 */
@SpringBootApplication
public class BusinessAnalyticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(BusinessAnalyticsApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("🚀 BUSINESS ANALYTICS SYSTEM BACKEND STARTED SUCCESSFULLY");
        System.out.println("   REST API URL: http://localhost:8080/api/health");
        System.out.println("   Dashboard API: http://localhost:8080/api/dashboard/summary");
        System.out.println("=======================================================\n");
    }
}
