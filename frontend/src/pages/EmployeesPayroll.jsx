import React from 'react';

const EMPLOYEES = [
  { code: 'EMP-001', name: 'Rohan Verma', designation: 'Store & Sales Manager', dept: 'Sales & Ops', salary: 45000.00, phone: '+91 98888 11111', status: 'ACTIVE' },
  { code: 'EMP-002', name: 'Ananya Deshmukh', designation: 'Junior Accountant', dept: 'Finance', salary: 30000.00, phone: '+91 97777 22222', status: 'ACTIVE' },
  { code: 'EMP-003', name: 'Karthik Rao', designation: 'Support Specialist', dept: 'Support', salary: 28000.00, phone: '+91 96666 33333', status: 'ACTIVE' },
];

export default function EmployeesPayroll() {
  const totalPayroll = EMPLOYEES.reduce((acc, emp) => acc + emp.salary, 0);

  return (
    <div>
      <div className="card-section">
        <div className="section-header">
          <div>
            <h3>Staff & Employee Management</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Total Active Team: {EMPLOYEES.length} members | Monthly Base Payroll: <strong>₹{totalPayroll.toLocaleString('en-IN')}</strong>
            </div>
          </div>
          <button className="btn btn-primary">+ Add New Employee</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Monthly Base Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.map((emp) => (
                <tr key={emp.code}>
                  <td><strong>{emp.code}</strong></td>
                  <td>{emp.name}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.dept}</td>
                  <td>{emp.phone}</td>
                  <td><strong>₹{emp.salary.toLocaleString('en-IN')}</strong></td>
                  <td><span className="badge badge-paid">{emp.status}</span></td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      Disburse Salary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
