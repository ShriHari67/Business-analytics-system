/**
 * BUSINESS ANALYTICS SYSTEM - DYNAMIC DATA STORE & ANALYTICS ENGINE
 * 
 * Strict Rule: ZERO HARDCODED BUSINESS DATA.
 * All metrics, charts, insights, and reports are dynamically computed from user data.
 */

const STORAGE_KEY = 'ba_user_business_data_v2';

/**
 * Get all stored user business records
 * Default is an empty array [] (Zero fake/demo data)
 */
export function getStoredRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading stored records:', e);
    return [];
  }
}

/**
 * Save records to persistent localStorage
 */
export function saveStoredRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records:', e);
  }
}

/**
 * Add a new business record
 */
export function addBusinessRecord(record) {
  const records = getStoredRecords();
  
  const quantity = Number(record.quantity) || 0;
  const revenue = Number(record.revenue) || 0;
  const cost = Number(record.cost) || 0;
  const profit = record.profit !== undefined && record.profit !== '' 
    ? Number(record.profit) 
    : (revenue - cost);

  const newRecord = {
    id: record.id || Date.now() + Math.random().toString(36).substr(2, 4),
    date: record.date || new Date().toISOString().split('T')[0],
    productName: (record.productName || '').trim(),
    category: (record.category || 'General').trim(),
    quantity: quantity,
    sales: Number(record.sales) || quantity,
    revenue: revenue,
    cost: cost,
    profit: profit,
    customerName: (record.customerName || 'Standard Customer').trim(),
    region: (record.region || 'North').trim(),
    salesperson: (record.salesperson || 'Staff').trim(),
    createdAt: new Date().toISOString(),
  };

  records.unshift(newRecord);
  saveStoredRecords(records);
  return newRecord;
}

/**
 * Update an existing business record
 */
export function updateBusinessRecord(id, updatedFields) {
  const records = getStoredRecords();
  const idx = records.findIndex(r => String(r.id) === String(id));
  if (idx === -1) throw new Error('Record not found');

  const revenue = updatedFields.revenue !== undefined ? Number(updatedFields.revenue) : records[idx].revenue;
  const cost = updatedFields.cost !== undefined ? Number(updatedFields.cost) : records[idx].cost;
  const profit = updatedFields.profit !== undefined && updatedFields.profit !== '' 
    ? Number(updatedFields.profit) 
    : (revenue - cost);

  records[idx] = {
    ...records[idx],
    ...updatedFields,
    quantity: Number(updatedFields.quantity ?? records[idx].quantity),
    sales: Number(updatedFields.sales ?? records[idx].sales),
    revenue,
    cost,
    profit,
    updatedAt: new Date().toISOString(),
  };

  saveStoredRecords(records);
  return records[idx];
}

/**
 * Delete a business record
 */
export function deleteBusinessRecord(id) {
  const records = getStoredRecords();
  const filtered = records.filter(r => String(r.id) !== String(id));
  saveStoredRecords(filtered);
  return true;
}

/**
 * Delete all business records (Reset dataset)
 */
export function clearAllBusinessRecords() {
  localStorage.removeItem(STORAGE_KEY);
  return true;
}

/**
 * Bulk import valid records
 */
export function bulkImportBusinessRecords(validRecords) {
  const existing = getStoredRecords();
  const formatted = validRecords.map((r, idx) => {
    const revenue = Number(r.revenue) || 0;
    const cost = Number(r.cost) || 0;
    const quantity = Number(r.quantity) || 1;
    const profit = r.profit !== undefined && r.profit !== '' ? Number(r.profit) : (revenue - cost);

    return {
      id: r.id || (Date.now() + idx + Math.random().toString(36).substr(2, 4)),
      date: r.date || new Date().toISOString().split('T')[0],
      productName: (r.productName || r.product || 'Unnamed Product').trim(),
      category: (r.category || 'General').trim(),
      quantity: quantity,
      sales: Number(r.sales) || quantity,
      revenue: revenue,
      cost: cost,
      profit: profit,
      customerName: (r.customerName || r.customer || 'Direct Client').trim(),
      region: (r.region || 'North').trim(),
      salesperson: (r.salesperson || 'Sales Team').trim(),
      createdAt: new Date().toISOString(),
    };
  });

  const combined = [...formatted, ...existing];
  saveStoredRecords(combined);
  return combined;
}

/**
 * Validate imported CSV/Excel rows
 * Returns diagnostic report: { total, valid, invalid, missingCount, duplicateCount, validRows, invalidRows }
 */
export function validateImportedData(rawRows) {
  if (!Array.isArray(rawRows)) {
    return { total: 0, valid: 0, invalid: 0, missingCount: 0, duplicateCount: 0, validRows: [], invalidRows: [] };
  }

  const validRows = [];
  const invalidRows = [];
  let missingCount = 0;
  let duplicateCount = 0;

  const seenKeys = new Set();

  rawRows.forEach((row, index) => {
    // Standardize keys (case insensitive & stripped)
    const norm = {};
    Object.keys(row).forEach(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      norm[cleanKey] = row[k];
    });

    const date = norm.date || norm.orderdate || norm.transactiondate || '';
    const productName = norm.productname || norm.product || norm.item || norm.itemname || '';
    const category = norm.category || norm.productcategory || 'General';
    const quantity = norm.quantity || norm.qty || norm.units || 1;
    const sales = norm.sales || norm.salesamount || quantity;
    const revenue = norm.revenue || norm.totalrevenue || norm.amount || norm.totalamount || 0;
    const cost = norm.cost || norm.totalcost || norm.cogs || 0;
    const profit = norm.profit || (Number(revenue) - Number(cost));
    const customerName = norm.customername || norm.customer || norm.client || 'Client';
    const region = norm.region || norm.territory || norm.location || 'North';
    const salesperson = norm.salesperson || norm.salesrep || norm.agent || 'Direct';

    const reasons = [];

    if (!productName || String(productName).trim() === '') {
      reasons.push('Missing Product Name');
      missingCount++;
    }
    if (isNaN(Number(revenue)) || Number(revenue) < 0) {
      reasons.push('Invalid Revenue value');
    }
    if (isNaN(Number(cost)) || Number(cost) < 0) {
      reasons.push('Invalid Cost value');
    }

    // Check duplicate
    const rowKey = `${date}_${productName}_${customerName}_${revenue}`.toLowerCase();
    if (seenKeys.has(rowKey)) {
      duplicateCount++;
    } else {
      seenKeys.add(rowKey);
    }

    if (reasons.length === 0) {
      validRows.push({
        date: date || new Date().toISOString().split('T')[0],
        productName: String(productName).trim(),
        category: String(category).trim(),
        quantity: Number(quantity) || 1,
        sales: Number(sales) || Number(quantity) || 1,
        revenue: Number(revenue),
        cost: Number(cost),
        profit: Number(profit),
        customerName: String(customerName).trim(),
        region: String(region).trim(),
        salesperson: String(salesperson).trim(),
      });
    } else {
      invalidRows.push({
        rowNumber: index + 1,
        data: row,
        reasons,
      });
    }
  });

  return {
    total: rawRows.length,
    valid: validRows.length,
    invalid: invalidRows.length,
    missingCount,
    duplicateCount,
    validRows,
    invalidRows,
  };
}

/**
 * Filter records by global filter criteria
 */
export function filterRecords(records, filters = {}) {
  if (!records || records.length === 0) return [];

  const {
    startDate,
    endDate,
    product,
    category,
    region,
    customer,
    salesperson,
    search,
  } = filters;

  return records.filter(r => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (product && r.productName.toLowerCase() !== product.toLowerCase()) return false;
    if (category && r.category.toLowerCase() !== category.toLowerCase()) return false;
    if (region && r.region.toLowerCase() !== region.toLowerCase()) return false;
    if (customer && r.customerName.toLowerCase() !== customer.toLowerCase()) return false;
    if (salesperson && r.salesperson.toLowerCase() !== salesperson.toLowerCase()) return false;

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      const match =
        (r.productName && r.productName.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.region && r.region.toLowerCase().includes(q)) ||
        (r.salesperson && r.salesperson.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Calculate dynamic KPIs strictly from filtered records
 */
export function calculateKPIs(records) {
  if (!records || records.length === 0) {
    return {
      totalRevenue: 0,
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      totalProducts: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      profitMargin: 0,
      recordCount: 0,
    };
  }

  let totalRevenue = 0;
  let totalSales = 0;
  let totalCost = 0;
  let totalProfit = 0;
  const uniqueProducts = new Set();
  const uniqueCustomers = new Set();

  records.forEach(r => {
    totalRevenue += Number(r.revenue) || 0;
    totalSales += Number(r.quantity) || Number(r.sales) || 0;
    totalCost += Number(r.cost) || 0;
    totalProfit += Number(r.profit) || 0;
    if (r.productName) uniqueProducts.add(r.productName.trim().toLowerCase());
    if (r.customerName) uniqueCustomers.add(r.customerName.trim().toLowerCase());
  });

  const recordCount = records.length;
  const averageOrderValue = recordCount > 0 ? totalRevenue / recordCount : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalSales,
    totalCost,
    totalProfit,
    totalProducts: uniqueProducts.size,
    totalCustomers: uniqueCustomers.size,
    averageOrderValue,
    profitMargin: Math.round(profitMargin * 10) / 10,
    recordCount,
  };
}

/**
 * Group monthly revenue and profit
 */
export function getMonthlyTrend(records) {
  if (!records || records.length === 0) return [];

  const map = {};

  records.forEach(r => {
    if (!r.date) return;
    const monthKey = r.date.substring(0, 7); // 'YYYY-MM'
    if (!map[monthKey]) {
      map[monthKey] = { monthKey, revenue: 0, profit: 0, cost: 0, sales: 0, count: 0 };
    }
    map[monthKey].revenue += Number(r.revenue) || 0;
    map[monthKey].profit += Number(r.profit) || 0;
    map[monthKey].cost += Number(r.cost) || 0;
    map[monthKey].sales += Number(r.quantity) || Number(r.sales) || 0;
    map[monthKey].count += 1;
  });

  return Object.values(map)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map(item => {
      // Format month label: '2026-08' -> 'Aug 2026'
      const [y, m] = item.monthKey.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return {
        ...item,
        label: isNaN(dateObj.getTime()) ? item.monthKey : label,
      };
    });
}

/**
 * Group sales by Product
 */
export function getSalesByProduct(records) {
  if (!records || records.length === 0) return [];

  const map = {};
  let overallRevenue = 0;

  records.forEach(r => {
    const pName = (r.productName || 'Other').trim();
    if (!map[pName]) {
      map[pName] = { name: pName, quantity: 0, revenue: 0, profit: 0, cost: 0, category: r.category };
    }
    map[pName].quantity += Number(r.quantity) || Number(r.sales) || 0;
    map[pName].revenue += Number(r.revenue) || 0;
    map[pName].profit += Number(r.profit) || 0;
    map[pName].cost += Number(r.cost) || 0;
    overallRevenue += Number(r.revenue) || 0;
  });

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .map(p => ({
      ...p,
      sharePct: overallRevenue > 0 ? Math.round((p.revenue / overallRevenue) * 1000) / 10 : 0,
      marginPct: p.revenue > 0 ? Math.round((p.profit / p.revenue) * 1000) / 10 : 0,
    }));
}

/**
 * Group sales by Category
 */
export function getSalesByCategory(records) {
  if (!records || records.length === 0) return [];

  const map = {};
  let overallRevenue = 0;

  records.forEach(r => {
    const cName = (r.category || 'General').trim();
    if (!map[cName]) {
      map[cName] = { name: cName, revenue: 0, profit: 0, quantity: 0, count: 0 };
    }
    map[cName].revenue += Number(r.revenue) || 0;
    map[cName].profit += Number(r.profit) || 0;
    map[cName].quantity += Number(r.quantity) || 0;
    map[cName].count += 1;
    overallRevenue += Number(r.revenue) || 0;
  });

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .map(c => ({
      ...c,
      percentage: overallRevenue > 0 ? Math.round((c.revenue / overallRevenue) * 1000) / 10 : 0,
      marginPct: c.revenue > 0 ? Math.round((c.profit / c.revenue) * 1000) / 10 : 0,
    }));
}

/**
 * Group revenue by Region
 */
export function getRevenueByRegion(records) {
  if (!records || records.length === 0) return [];

  const map = {};
  let overallRevenue = 0;

  records.forEach(r => {
    const reg = (r.region || 'Unassigned').trim();
    if (!map[reg]) {
      map[reg] = { region: reg, revenue: 0, profit: 0, sales: 0, orderCount: 0 };
    }
    map[reg].revenue += Number(r.revenue) || 0;
    map[reg].profit += Number(r.profit) || 0;
    map[reg].sales += Number(r.quantity) || 0;
    map[reg].orderCount += 1;
    overallRevenue += Number(r.revenue) || 0;
  });

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .map(r => ({
      ...r,
      sharePct: overallRevenue > 0 ? Math.round((r.revenue / overallRevenue) * 1000) / 10 : 0,
    }));
}

/**
 * Customer Performance ranking
 */
export function getCustomerPerformance(records) {
  if (!records || records.length === 0) return [];

  const map = {};

  records.forEach(r => {
    const cName = (r.customerName || 'Anonymous Client').trim();
    if (!map[cName]) {
      map[cName] = { name: cName, totalSpent: 0, profitGenerated: 0, ordersCount: 0, region: r.region };
    }
    map[cName].totalSpent += Number(r.revenue) || 0;
    map[cName].profitGenerated += Number(r.profit) || 0;
    map[cName].ordersCount += 1;
  });

  return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Generate AI-Style Business Insights strictly computed from user data
 */
export function generateBusinessInsights(records) {
  if (!records || records.length === 0) {
    return {
      hasData: false,
      insights: [],
      bestProduct: null,
      mostProfitableProduct: null,
      lowestProduct: null,
      bestRegion: null,
      peakRevenueMonth: null,
      peakProfitMonth: null,
      growthRate: 0,
      lowMarginItems: [],
    };
  }

  const productStats = getSalesByProduct(records);
  const regionStats = getRevenueByRegion(records);
  const monthlyStats = getMonthlyTrend(records);

  const bestProduct = productStats.length > 0 ? productStats[0] : null;
  
  // Most profitable product
  const mostProfitableProduct = [...productStats].sort((a, b) => b.profit - a.profit)[0] || null;
  
  // Lowest performing product (with revenue > 0 if possible, or minimum revenue)
  const lowestProduct = productStats.length > 1 ? productStats[productStats.length - 1] : null;

  // Best region
  const bestRegion = regionStats.length > 0 ? regionStats[0] : null;

  // Peak months
  const peakRevenueMonth = [...monthlyStats].sort((a, b) => b.revenue - a.revenue)[0] || null;
  const peakProfitMonth = [...monthlyStats].sort((a, b) => b.profit - a.profit)[0] || null;

  // Growth calculation across last two months if available
  let salesGrowth = 0;
  let profitGrowth = 0;
  if (monthlyStats.length >= 2) {
    const prev = monthlyStats[monthlyStats.length - 2];
    const curr = monthlyStats[monthlyStats.length - 1];
    if (prev.revenue > 0) {
      salesGrowth = Math.round(((curr.revenue - prev.revenue) / prev.revenue) * 1000) / 10;
    }
    if (prev.profit > 0) {
      profitGrowth = Math.round(((curr.profit - prev.profit) / prev.profit) * 1000) / 10;
    }
  }

  // Low margin / Negative profit products (< 15% margin)
  const lowMarginItems = productStats.filter(p => p.marginPct < 15 || p.profit <= 0);

  // Dynamic Insight Narrative Cards
  const insightsList = [];

  if (bestProduct) {
    insightsList.push({
      type: 'success',
      icon: '🏆',
      title: 'Top Revenue Driver',
      text: `"${bestProduct.name}" is your #1 performing product, generating ₹${bestProduct.revenue.toLocaleString('en-IN')} (${bestProduct.sharePct}% of total business revenue) across ${bestProduct.quantity} units sold.`,
    });
  }

  if (mostProfitableProduct) {
    insightsList.push({
      type: 'profit',
      icon: '💰',
      title: 'Highest Profit Generator',
      text: `"${mostProfitableProduct.name}" delivered the highest net bottom-line contribution with ₹${mostProfitableProduct.profit.toLocaleString('en-IN')} in total profit (${mostProfitableProduct.marginPct}% profit margin).`,
    });
  }

  if (bestRegion) {
    insightsList.push({
      type: 'info',
      icon: '🌍',
      title: 'Dominant Geographic Region',
      text: `The ${bestRegion.region} territory leads all sales regions with ₹${bestRegion.revenue.toLocaleString('en-IN')} in gross revenue across ${bestRegion.orderCount} customer orders.`,
    });
  }

  if (peakRevenueMonth) {
    insightsList.push({
      type: 'highlight',
      icon: '📅',
      title: 'Peak Operational Month',
      text: `${peakRevenueMonth.label} recorded your highest billing volume with ₹${peakRevenueMonth.revenue.toLocaleString('en-IN')} revenue and ₹${peakRevenueMonth.profit.toLocaleString('en-IN')} profit.`,
    });
  }

  if (monthlyStats.length >= 2) {
    insightsList.push({
      type: salesGrowth >= 0 ? 'growth' : 'warning',
      icon: salesGrowth >= 0 ? '📈' : '📉',
      title: 'Revenue Trajectory Rate',
      text: `Month-over-month revenue shifted by ${salesGrowth >= 0 ? '+' : ''}${salesGrowth}% and profit shifted by ${profitGrowth >= 0 ? '+' : ''}${profitGrowth}% based on your sequential data entries.`,
    });
  }

  if (lowMarginItems.length > 0) {
    insightsList.push({
      type: 'alert',
      icon: '⚠️',
      title: 'Margin Optimization Advisory',
      text: `${lowMarginItems.length} product(s) (including "${lowMarginItems[0].name}") are yielding margins below 15%. Consider reviewing supplier pricing or adjusting retail markup.`,
    });
  }

  return {
    hasData: true,
    insights: insightsList,
    bestProduct,
    mostProfitableProduct,
    lowestProduct,
    bestRegion,
    peakRevenueMonth,
    peakProfitMonth,
    salesGrowth,
    profitGrowth,
    lowMarginItems,
  };
}

/**
 * Download a structured CSV template
 */
export function downloadSampleCSVTemplate() {
  const headers = [
    'Date',
    'Product Name',
    'Category',
    'Quantity',
    'Sales',
    'Revenue',
    'Cost',
    'Profit',
    'Customer Name',
    'Region',
    'Salesperson',
  ];

  const sampleRows = [
    '2026-08-01,Wireless Keyboard,Electronics,10,10,21990,12000,9990,Aarav Tech,South,Rahul Sharma',
    '2026-08-05,USB-C Hub Pro,Electronics,25,25,39975,21250,18725,Priya Global,West,Sneha Patel',
    '2026-08-10,A4 Premium Paper,Office,50,50,16000,9000,7000,Green Leaf Ltd,North,Amit Verma',
    '2026-08-15,WiFi 6 Router,Networking,8,8,33592,19200,14392,Apex Cloud,East,Pooja Nair',
    '2026-08-20,IT AMC Support,Services,12,12,14400,4800,9600,Zenith Systems,South,Rahul Sharma',
  ];

  const csvContent = [headers.join(','), ...sampleRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'business_data_sample_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export records to CSV file
 */
export function exportRecordsToCSV(records, filename = 'business_data_export.csv') {
  if (!records || records.length === 0) return;

  const headers = [
    'Date',
    'Product Name',
    'Category',
    'Quantity',
    'Sales',
    'Revenue',
    'Cost',
    'Profit',
    'Customer Name',
    'Region',
    'Salesperson',
  ];

  const rows = records.map(r => [
    `"${r.date || ''}"`,
    `"${(r.productName || '').replace(/"/g, '""')}"`,
    `"${(r.category || '').replace(/"/g, '""')}"`,
    r.quantity || 0,
    r.sales || r.quantity || 0,
    r.revenue || 0,
    r.cost || 0,
    r.profit || 0,
    `"${(r.customerName || '').replace(/"/g, '""')}"`,
    `"${(r.region || '').replace(/"/g, '""')}"`,
    `"${(r.salesperson || '').replace(/"/g, '""')}"`,
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ====================================================================
// 1. EMPLOYEE SALARY MODULE STORE & CALCULATIONS
// ====================================================================
const SALARY_STORAGE_KEY = 'ba_employee_salaries_v1';

export function getStoredSalaries() {
  try {
    const raw = localStorage.getItem(SALARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading stored salaries:', e);
    return [];
  }
}

export function saveStoredSalaries(salaries) {
  try {
    localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(salaries));
  } catch (e) {
    console.error('Error saving salaries:', e);
  }
}

export function addSalaryRecord(data) {
  const salaries = getStoredSalaries();
  const basic = Number(data.basicSalary) || 0;
  const bonus = Number(data.bonus) || 0;
  const deduction = Number(data.deduction) || 0;
  const netSalary = basic + bonus - deduction;

  const newSalary = {
    id: data.id || 'sal_' + Date.now() + Math.random().toString(36).substr(2, 4),
    employeeName: (data.employeeName || '').trim(),
    employeeId: (data.employeeId || '').trim(),
    department: (data.department || 'General').trim(),
    salaryMonth: (data.salaryMonth || new Date().toISOString().substring(0, 7)).trim(),
    basicSalary: basic,
    bonus: bonus,
    deduction: deduction,
    netSalary: netSalary,
    paymentStatus: (data.paymentStatus || 'PAID').toUpperCase(),
    paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  salaries.unshift(newSalary);
  saveStoredSalaries(salaries);
  return newSalary;
}

export function updateSalaryRecord(updated) {
  const salaries = getStoredSalaries();
  const basic = Number(updated.basicSalary) || 0;
  const bonus = Number(updated.bonus) || 0;
  const deduction = Number(updated.deduction) || 0;
  const netSalary = basic + bonus - deduction;

  const index = salaries.findIndex(s => s.id === updated.id);
  if (index !== -1) {
    salaries[index] = {
      ...salaries[index],
      ...updated,
      basicSalary: basic,
      bonus: bonus,
      deduction: deduction,
      netSalary: netSalary,
      paymentStatus: (updated.paymentStatus || salaries[index].paymentStatus).toUpperCase(),
    };
    saveStoredSalaries(salaries);
    return salaries[index];
  }
  return null;
}

export function deleteSalaryRecord(id) {
  const salaries = getStoredSalaries();
  const filtered = salaries.filter(s => s.id !== id);
  saveStoredSalaries(filtered);
  return filtered;
}

export function calculateSalaryKPIs(salaries = []) {
  const totalEmployees = new Set(salaries.map(s => (s.employeeId || s.employeeName || '').toLowerCase()).filter(Boolean)).size;
  let totalSalaryPaid = 0;
  let pendingSalary = 0;
  let totalBonus = 0;
  let totalDeduction = 0;
  let totalGrossSalary = 0;

  salaries.forEach(s => {
    const net = Number(s.netSalary) || (Number(s.basicSalary) || 0) + (Number(s.bonus) || 0) - (Number(s.deduction) || 0);
    totalGrossSalary += net;
    totalBonus += Number(s.bonus) || 0;
    totalDeduction += Number(s.deduction) || 0;

    if ((s.paymentStatus || '').toUpperCase() === 'PAID') {
      totalSalaryPaid += net;
    } else {
      pendingSalary += net;
    }
  });

  return {
    totalEmployees: totalEmployees || salaries.length,
    totalRecords: salaries.length,
    totalGrossSalary,
    totalSalaryPaid,
    pendingSalary,
    totalBonus,
    totalDeduction,
  };
}

// ====================================================================
// 2. BUSINESS CREDIT MODULE STORE & CALCULATIONS (Money to receive)
// ====================================================================
const CREDIT_STORAGE_KEY = 'ba_business_credits_v1';

export function getStoredCredits() {
  try {
    const raw = localStorage.getItem(CREDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading stored credits:', e);
    return [];
  }
}

export function saveStoredCredits(credits) {
  try {
    localStorage.setItem(CREDIT_STORAGE_KEY, JSON.stringify(credits));
  } catch (e) {
    console.error('Error saving credits:', e);
  }
}

export function addCreditRecord(data) {
  const credits = getStoredCredits();
  const amount = Number(data.creditAmount) || 0;

  const newCredit = {
    id: data.id || 'crd_' + Date.now() + Math.random().toString(36).substr(2, 4),
    date: data.date || new Date().toISOString().split('T')[0],
    customerName: (data.customerName || '').trim(),
    description: (data.description || '').trim(),
    creditAmount: amount,
    dueDate: data.dueDate || '',
    paymentStatus: (data.paymentStatus || 'PENDING').toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  credits.unshift(newCredit);
  saveStoredCredits(credits);
  return newCredit;
}

export function updateCreditRecord(updated) {
  const credits = getStoredCredits();
  const index = credits.findIndex(c => c.id === updated.id);
  if (index !== -1) {
    credits[index] = {
      ...credits[index],
      ...updated,
      creditAmount: Number(updated.creditAmount) || credits[index].creditAmount,
      paymentStatus: (updated.paymentStatus || credits[index].paymentStatus).toUpperCase(),
    };
    saveStoredCredits(credits);
    return credits[index];
  }
  return null;
}

export function deleteCreditRecord(id) {
  const credits = getStoredCredits();
  const filtered = credits.filter(c => c.id !== id);
  saveStoredCredits(filtered);
  return filtered;
}

export function calculateCreditKPIs(credits = []) {
  let totalCredit = 0;
  let paidCredit = 0;
  let pendingCredit = 0;

  credits.forEach(c => {
    const amt = Number(c.creditAmount) || 0;
    totalCredit += amt;
    if ((c.paymentStatus || '').toUpperCase() === 'PAID') {
      paidCredit += amt;
    } else {
      pendingCredit += amt;
    }
  });

  return {
    totalCredit,
    paidCredit,
    pendingCredit,
    transactionCount: credits.length,
  };
}

// ====================================================================
// 3. BUSINESS DEBIT MODULE STORE & CALCULATIONS (Money to pay)
// ====================================================================
const DEBIT_STORAGE_KEY = 'ba_business_debits_v1';

export function getStoredDebits() {
  try {
    const raw = localStorage.getItem(DEBIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading stored debits:', e);
    return [];
  }
}

export function saveStoredDebits(debits) {
  try {
    localStorage.setItem(DEBIT_STORAGE_KEY, JSON.stringify(debits));
  } catch (e) {
    console.error('Error saving debits:', e);
  }
}

export function addDebitRecord(data) {
  const debits = getStoredDebits();
  const amount = Number(data.debitAmount) || 0;

  const newDebit = {
    id: data.id || 'deb_' + Date.now() + Math.random().toString(36).substr(2, 4),
    date: data.date || new Date().toISOString().split('T')[0],
    vendorName: (data.vendorName || '').trim(),
    description: (data.description || '').trim(),
    category: (data.category || 'Operations').trim(),
    debitAmount: amount,
    paymentStatus: (data.paymentStatus || 'PAID').toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  debits.unshift(newDebit);
  saveStoredDebits(debits);
  return newDebit;
}

export function updateDebitRecord(updated) {
  const debits = getStoredDebits();
  const index = debits.findIndex(d => d.id === updated.id);
  if (index !== -1) {
    debits[index] = {
      ...debits[index],
      ...updated,
      debitAmount: Number(updated.debitAmount) || debits[index].debitAmount,
      paymentStatus: (updated.paymentStatus || debits[index].paymentStatus).toUpperCase(),
    };
    saveStoredDebits(debits);
    return debits[index];
  }
  return null;
}

export function deleteDebitRecord(id) {
  const debits = getStoredDebits();
  const filtered = debits.filter(d => d.id !== id);
  saveStoredDebits(filtered);
  return filtered;
}

export function calculateDebitKPIs(debits = []) {
  let totalDebit = 0;
  let paidDebit = 0;
  let pendingDebit = 0;

  debits.forEach(d => {
    const amt = Number(d.debitAmount) || 0;
    totalDebit += amt;
    if ((d.paymentStatus || '').toUpperCase() === 'PAID') {
      paidDebit += amt;
    } else {
      pendingDebit += amt;
    }
  });

  return {
    totalDebit,
    paidDebit,
    pendingDebit,
    transactionCount: debits.length,
  };
}

// ====================================================================
// 4. INTEGRATED BUSINESS BALANCE CALCULATION
// ====================================================================
export function calculateIntegratedBusinessBalance(credits = [], debits = [], salaries = []) {
  const creditKPIs = calculateCreditKPIs(credits);
  const debitKPIs = calculateDebitKPIs(debits);
  const salaryKPIs = calculateSalaryKPIs(salaries);

  const totalCredit = creditKPIs.totalCredit;
  const totalDebit = debitKPIs.totalDebit;
  const totalSalary = salaryKPIs.totalGrossSalary;

  // Net Business Balance = Total Credit - Total Debit
  const netBusinessBalance = totalCredit - totalDebit;

  return {
    totalCredit,
    totalDebit,
    totalSalary,
    paidCredit: creditKPIs.paidCredit,
    pendingCredit: creditKPIs.pendingCredit,
    paidDebit: debitKPIs.paidDebit,
    pendingDebit: debitKPIs.pendingDebit,
    totalSalaryPaid: salaryKPIs.totalSalaryPaid,
    pendingSalary: salaryKPIs.pendingSalary,
    netBusinessBalance,
  };
}

