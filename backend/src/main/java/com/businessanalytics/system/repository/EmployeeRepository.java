package com.businessanalytics.system.repository;

import com.businessanalytics.system.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByStatus(String status);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.status = 'ACTIVE'")
    Long countActiveEmployees();

    @Query("SELECT COALESCE(SUM(e.baseSalary), 0) FROM Employee e WHERE e.status = 'ACTIVE'")
    BigDecimal getTotalMonthlyPayroll();
}
