package com.businessanalytics.system.controller;

import com.businessanalytics.system.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> details = Map.of(
                "application", "Business Analytics System",
                "status", "UP",
                "version", "1.0.0",
                "stack", "Java Spring Boot + MySQL + React + Python Analytics"
        );
        return ResponseEntity.ok(ApiResponse.ok("System backend is active and healthy", details));
    }
}
