package com.businessanalytics.system.controller;

import com.businessanalytics.system.dto.ApiResponse;
import com.businessanalytics.system.dto.DashboardStatsDTO;
import com.businessanalytics.system.service.DashboardAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardAnalyticsService analyticsService;

    @Autowired
    public DashboardController(DashboardAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String timeRange,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        DashboardStatsDTO stats = analyticsService.getStats(timeRange, categoryId, productId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getSummary() {
        return getDashboardStats("THIS_MONTH", null, null, null, null);
    }
}
