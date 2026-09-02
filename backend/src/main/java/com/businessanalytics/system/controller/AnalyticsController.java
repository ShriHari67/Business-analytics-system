package com.businessanalytics.system.controller;

import com.businessanalytics.system.dto.ApiResponse;
import com.businessanalytics.system.service.PythonAnalyticsBridgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final PythonAnalyticsBridgeService bridgeService;

    @Autowired
    public AnalyticsController(PythonAnalyticsBridgeService bridgeService) {
        this.bridgeService = bridgeService;
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getForecast(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.ok(bridgeService.getForecast(days)));
    }

    @GetMapping("/products-performance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductsPerformance() {
        return ResponseEntity.ok(ApiResponse.ok(bridgeService.getProductPerformance()));
    }
}
