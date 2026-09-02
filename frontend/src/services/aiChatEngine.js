/**
 * BUSINESS ANALYTICS SYSTEM - AI CHAT ENGINE
 * 
 * Analyzes live business sales, salary payroll, credit receivables,
 * and debit expenses, generating data-driven responses with context memory.
 */

import {
  calculateKPIs,
  getMonthlyTrend,
  getSalesByProduct,
  getSalesByCategory,
  getRevenueByRegion,
  getCustomerPerformance,
  generateBusinessInsights,
  calculateSalaryKPIs,
  calculateCreditKPIs,
  calculateDebitKPIs,
  calculateIntegratedBusinessBalance,
} from './dataStore';

export class AIChatEngine {
  constructor() {
    this.conversationHistory = [];
    this.lastContext = {
      topic: null, // 'product', 'region', 'category', 'monthly', 'kpi', 'customer', 'salary', 'credit', 'debit', 'balance'
      entity: null,
    };
  }

  /**
   * Clear session conversation memory
   */
  clearHistory() {
    this.conversationHistory = [];
    this.lastContext = { topic: null, entity: null };
  }

  /**
   * Process a user prompt and return a structured response
   */
  async processQuery(userInput, records = [], salaries = [], credits = [], debits = []) {
    // Record user query in history
    this.conversationHistory.push({ role: 'user', content: userInput, timestamp: new Date().toISOString() });

    // Simulate minor processing delay for realistic AI feel
    await new Promise(resolve => setTimeout(resolve, 350));

    const query = userInput.toLowerCase().trim();
    const hasAnyData = records.length > 0 || salaries.length > 0 || credits.length > 0 || debits.length > 0;

    if (!hasAnyData) {
      const response = {
        text: `📊 **No business data available in the system.**\n\nI currently don't see any transaction, salary, credit, or debit records loaded. To analyze your business performance:\n\n1. Go to the **Data Management** page to enter transactions or upload CSV.\n2. Add payroll entries under **Employee Salary**.\n3. Record receivables in **Business Credit** and expenses in **Business Debit**.\n\nOnce your data is saved, I'll be ready to calculate net business balances, identify top products, analyze payroll, and provide profit insights!`,
        suggestions: ['How do I upload data?', 'What data fields are required?'],
      };
      this.conversationHistory.push({ role: 'assistant', content: response.text, timestamp: new Date().toISOString() });
      return response;
    }

    const kpis = calculateKPIs(records);
    const productStats = getSalesByProduct(records);
    const categoryStats = getSalesByCategory(records);
    const regionStats = getRevenueByRegion(records);
    const monthlyStats = getMonthlyTrend(records);
    const customerStats = getCustomerPerformance(records);
    const insights = generateBusinessInsights(records);
    const salaryKPIs = calculateSalaryKPIs(salaries);
    const creditKPIs = calculateCreditKPIs(credits);
    const debitKPIs = calculateDebitKPIs(debits);
    const balanceData = calculateIntegratedBusinessBalance(credits, debits, salaries);

    let answerText = '';
    let suggestions = [];

    // ====================================================================
    // INTENT CLASSIFICATION & DATA-DRIVEN REASONING
    // ====================================================================

    // 1. SALARY / PAYROLL INQUIRIES
    if (
      query.includes('salary') ||
      query.includes('salaries') ||
      query.includes('payroll') ||
      query.includes('employee') ||
      query.includes('staff pay') ||
      query.includes('bonus') ||
      query.includes('deduction')
    ) {
      if (salaries.length === 0) {
        answerText = `💼 **Employee Salary & Payroll Status**\n\nNo salary records have been entered yet. You can add staff payroll details under the **Employee Salary** module.`;
      } else {
        answerText = `💼 **Employee Payroll & Salary Summary**\n\nBased on **${salaryKPIs.totalRecords} payroll entries** across **${salaryKPIs.totalEmployees} employee(s)**:\n\n` +
          `• **Total Gross Payroll**: ₹${salaryKPIs.totalGrossSalary.toLocaleString('en-IN')}\n` +
          `• **Total Salary Paid**: ₹${salaryKPIs.totalSalaryPaid.toLocaleString('en-IN')}\n` +
          `• **Pending / Unpaid Salary**: ₹${salaryKPIs.pendingSalary.toLocaleString('en-IN')}\n` +
          `• **Total Bonuses Allocated**: ₹${salaryKPIs.totalBonus.toLocaleString('en-IN')}\n` +
          `• **Total Deductions**: ₹${salaryKPIs.totalDeduction.toLocaleString('en-IN')}`;
        this.lastContext = { topic: 'salary', entity: salaryKPIs };
      }
      suggestions = ['Business Credit', 'Business Debit', 'Net Business Balance', 'Overall Performance'];
    }

    // 2. CREDIT / RECEIVABLES INQUIRIES
    else if (
      query.includes('credit') ||
      query.includes('receivable') ||
      query.includes('money to receive') ||
      query.includes('customer dues') ||
      query.includes('owing')
    ) {
      if (credits.length === 0) {
        answerText = `📥 **Business Credit Status**\n\nNo credit records have been added yet. You can track customer dues and receivables under the **Business Credit** module.`;
      } else {
        const paidPct = creditKPIs.totalCredit > 0 ? Math.round((creditKPIs.paidCredit / creditKPIs.totalCredit) * 100) : 0;
        answerText = `📥 **Business Credit & Receivables Overview**\n\n` +
          `• **Total Credit Booked**: ₹${creditKPIs.totalCredit.toLocaleString('en-IN')} (${creditKPIs.transactionCount} entries)\n` +
          `• **Recovered / Paid Credit**: ₹${creditKPIs.paidCredit.toLocaleString('en-IN')} (${paidPct}% recovered)\n` +
          `• **Pending / Outstanding Credit**: ₹${creditKPIs.pendingCredit.toLocaleString('en-IN')} (${100 - paidPct}% due)`;
        this.lastContext = { topic: 'credit', entity: creditKPIs };
      }
      suggestions = ['Business Debit', 'Net Business Balance', 'Overall Summary'];
    }

    // 3. DEBIT / EXPENSES / PAYABLES INQUIRIES
    else if (
      query.includes('debit') ||
      query.includes('payable') ||
      query.includes('expenses') ||
      query.includes('money to pay') ||
      query.includes('vendor bills')
    ) {
      if (debits.length === 0) {
        answerText = `📤 **Business Debit Status**\n\nNo debit records have been entered yet. You can track vendor bills and operational outflows under the **Business Debit** module.`;
      } else {
        const paidPct = debitKPIs.totalDebit > 0 ? Math.round((debitKPIs.paidDebit / debitKPIs.totalDebit) * 100) : 0;
        answerText = `📤 **Business Debit & Accounts Payable Overview**\n\n` +
          `• **Total Debit Booked**: ₹${debitKPIs.totalDebit.toLocaleString('en-IN')} (${debitKPIs.transactionCount} bills)\n` +
          `• **Settled / Paid Debits**: ₹${debitKPIs.paidDebit.toLocaleString('en-IN')} (${paidPct}% paid)\n` +
          `• **Pending Payables**: ₹${debitKPIs.pendingDebit.toLocaleString('en-IN')} (${100 - paidPct}% pending)`;
        this.lastContext = { topic: 'debit', entity: debitKPIs };
      }
      suggestions = ['Business Credit', 'Employee Salary', 'Net Business Balance'];
    }

    // 4. NET BUSINESS BALANCE / WORKING CAPITAL
    else if (
      query.includes('balance') ||
      query.includes('net business balance') ||
      query.includes('working capital') ||
      query.includes('cash flow') ||
      query.includes('credit minus debit')
    ) {
      answerText = `⚖️ **Net Business Balance & Working Capital**\n\n` +
        `• **Total Credit (Inflows/Receivables)**: ₹${balanceData.totalCredit.toLocaleString('en-IN')}\n` +
        `• **Total Debit (Outflows/Payables)**: ₹${balanceData.totalDebit.toLocaleString('en-IN')}\n` +
        `• **Total Payroll (Salaries)**: ₹${balanceData.totalSalary.toLocaleString('en-IN')}\n\n` +
        `💎 **Net Business Balance (Total Credit - Total Debit)**: **₹${balanceData.netBusinessBalance.toLocaleString('en-IN')}**\n\n` +
        (balanceData.netBusinessBalance >= 0 
          ? `✅ Your business maintains a positive working capital surplus of **₹${balanceData.netBusinessBalance.toLocaleString('en-IN')}**.` 
          : `⚠️ Outflows exceed receivables by **₹${Math.abs(balanceData.netBusinessBalance).toLocaleString('en-IN')}**. Prioritize collecting pending credits.`);
      this.lastContext = { topic: 'balance', entity: balanceData };
      suggestions = ['Employee Salary', 'Business Credit', 'Business Debit', 'Overall Performance'];
    }

    // 5. GREETING & HELP
    else if (query === 'hi' || query === 'hello' || query === 'hey' || query.includes('who are you') || query.includes('what can you do') || query === 'help') {
      answerText = `👋 Hello! I am your **Business Analytics AI Assistant**.\n\nI am connected directly to your live system data:\n` +
        `• **Sales Ledger**: ${records.length} records (₹${kpis.totalRevenue.toLocaleString('en-IN')} revenue)\n` +
        `• **Payroll**: ${salaryKPIs.totalEmployees} employees (₹${salaryKPIs.totalGrossSalary.toLocaleString('en-IN')})\n` +
        `• **Credit Receivables**: ₹${creditKPIs.totalCredit.toLocaleString('en-IN')}\n` +
        `• **Debit Payables**: ₹${debitKPIs.totalDebit.toLocaleString('en-IN')}\n` +
        `• **Net Balance**: ₹${balanceData.netBusinessBalance.toLocaleString('en-IN')}\n\n` +
        `What would you like to analyze?`;
      suggestions = ['Overall Performance', 'Top Products', 'Net Business Balance', 'Employee Salary', 'Business Credit', 'Business Debit'];
      this.lastContext = { topic: 'greeting', entity: null };
    }

    // 6. OVERALL BUSINESS PERFORMANCE & SUMMARY
    else if (
      query.includes('overall') ||
      query.includes('performance') ||
      query.includes('summary') ||
      query.includes('how is the business doing') ||
      query.includes('kpi') ||
      query.includes('metrics') ||
      query.includes('overview')
    ) {
      const topP = productStats[0];
      const topR = regionStats[0];

      answerText = `📊 **Executive Business Performance Summary**\n\nBased on your active **${kpis.recordCount} records**:\n\n` +
        `• **Gross Revenue**: ₹${kpis.totalRevenue.toLocaleString('en-IN')}\n` +
        `• **Total Cost (COGS)**: ₹${kpis.totalCost.toLocaleString('en-IN')}\n` +
        `• **Net Profit**: ₹${kpis.totalProfit.toLocaleString('en-IN')} (${kpis.profitMargin}% Profit Margin)\n` +
        `• **Units Sold**: ${kpis.totalSales.toLocaleString('en-IN')} across ${kpis.totalProducts} unique products\n` +
        `• **Customer Base**: ${kpis.totalCustomers} unique clients\n` +
        `• **Average Order Value**: ₹${Math.round(kpis.averageOrderValue).toLocaleString('en-IN')}\n` +
        `• **Net Business Balance**: ₹${balanceData.netBusinessBalance.toLocaleString('en-IN')}\n\n` +
        (topP ? `🏆 Leading Product: **${topP.name}** (₹${topP.revenue.toLocaleString('en-IN')})\n` : '') +
        (topR ? `🌍 Top Territory: **${topR.region}** (₹${topR.revenue.toLocaleString('en-IN')})` : '');

      suggestions = ['Top Products', 'Monthly Trends', 'Net Business Balance', 'Areas for Improvement'];
      this.lastContext = { topic: 'kpi', entity: null };
    }

    // 7. HIGHEST SALES & TOP PRODUCTS
    else if (
      query.includes('highest sales') ||
      query.includes('best product') ||
      query.includes('top product') ||
      query.includes('best selling') ||
      query.includes('most sold') ||
      query.includes('top 5') ||
      query.includes('top seller')
    ) {
      if (productStats.length === 0) {
        answerText = `No product records found in the dataset.`;
      } else {
        const top = productStats[0];
        const top5 = productStats.slice(0, 5);

        let listStr = top5.map((p, idx) => 
          `${idx + 1}. **${p.name}**: ₹${p.revenue.toLocaleString('en-IN')} (${p.quantity} units, ${p.sharePct}% share, ${p.marginPct}% margin)`
        ).join('\n');

        answerText = `🏆 **Top Performing Products**\n\nYour #1 revenue driver is **${top.name}**.\n\n` +
          `**Top Catalog Leaderboard:**\n${listStr}\n\n` +
          `💡 **Insight**: *${top.name}* represents **${top.sharePct}%** of your total business revenue with a profit margin of **${top.marginPct}%**.`;

        this.lastContext = { topic: 'product', entity: top };
      }
      suggestions = ['Most Profitable Product', 'Lowest Performing Product', 'Sales by Category'];
    }

    // 8. MOST PROFITABLE PRODUCT
    else if (
      query.includes('most profitable') ||
      query.includes('highest profit') ||
      query.includes('highest margin') ||
      query.includes('best profit')
    ) {
      const sortedByProfit = [...productStats].sort((a, b) => b.profit - a.profit);
      if (sortedByProfit.length > 0) {
        const mostProf = sortedByProfit[0];
        answerText = `💰 **Most Profitable Product**\n\n**${mostProf.name}** generates the highest bottom-line return in your business:\n\n` +
          `• **Total Net Profit**: ₹${mostProf.profit.toLocaleString('en-IN')}\n` +
          `• **Gross Revenue**: ₹${mostProf.revenue.toLocaleString('en-IN')}\n` +
          `• **Cost of Goods**: ₹${mostProf.cost.toLocaleString('en-IN')}\n` +
          `• **Profit Margin**: **${mostProf.marginPct}%**\n` +
          `• **Units Sold**: ${mostProf.quantity}\n\n` +
          `It is your most lucrative product per unit sold.`;
        this.lastContext = { topic: 'product', entity: mostProf };
      } else {
        answerText = `No product data available to compute profit.`;
      }
      suggestions = ['Lowest Performing Product', 'Profit vs Cost', 'Overall Summary'];
    }

    // 9. LOWEST PERFORMING & UNDERPERFORMING PRODUCTS
    else if (
      query.includes('lowest') ||
      query.includes('worst product') ||
      query.includes('least sales') ||
      query.includes('underperforming') ||
      query.includes('low sales')
    ) {
      if (productStats.length > 1) {
        const lowest = productStats[productStats.length - 1];
        const lowMarginItems = productStats.filter(p => p.marginPct < 15 || p.profit <= 0);

        answerText = `⚠️ **Underperforming Product Analysis**\n\n` +
          `Your lowest-revenue product is **${lowest.name}**:\n` +
          `• **Total Revenue**: ₹${lowest.revenue.toLocaleString('en-IN')} (${lowest.sharePct}% of total revenue)\n` +
          `• **Units Sold**: ${lowest.quantity}\n` +
          `• **Net Profit**: ₹${lowest.profit.toLocaleString('en-IN')} (${lowest.marginPct}% margin)\n\n` +
          (lowMarginItems.length > 0 ? `🚨 **Low Margin Alert**: There are ${lowMarginItems.length} product(s) yielding below 15% profit margin. Consider optimizing production costs or pricing.` : '');

        this.lastContext = { topic: 'product', entity: lowest };
      } else if (productStats.length === 1) {
        answerText = `You currently have only 1 product in your dataset (**${productStats[0].name}**). As more products are recorded, comparative low performers will be identified.`;
      } else {
        answerText = `No product data available.`;
      }
      suggestions = ['Top Products', 'Areas for Improvement', 'Cost Analysis'];
    }

    // 10. BEST REGION & REGIONAL PERFORMANCE
    else if (
      query.includes('region') ||
      query.includes('territory') ||
      query.includes('geographic') ||
      query.includes('location') ||
      query.includes('where do we sell')
    ) {
      if (regionStats.length > 0) {
        const topReg = regionStats[0];
        let regionBreakdown = regionStats.map(r => 
          `• **${r.region}**: ₹${r.revenue.toLocaleString('en-IN')} (${r.sharePct}% share, ${r.orderCount} orders)`
        ).join('\n');

        answerText = `🌍 **Regional Performance Breakdown**\n\n` +
          `Your top-performing region is **${topReg.region}**, generating **₹${topReg.revenue.toLocaleString('en-IN')}** across **${topReg.orderCount} orders** (${topReg.sharePct}% of all sales).\n\n` +
          `**All Sales Territories:**\n${regionBreakdown}`;

        this.lastContext = { topic: 'region', entity: topReg };
      } else {
        answerText = `No regional data recorded.`;
      }
      suggestions = ['Top Products', 'Monthly Trends', 'Customer Performance'];
    }

    // 11. MAJOR TRENDS & MONTHLY ANALYSIS
    else if (
      query.includes('trend') ||
      query.includes('month') ||
      query.includes('growth') ||
      query.includes('trajectory') ||
      query.includes('time') ||
      query.includes('progression')
    ) {
      if (monthlyStats.length > 0) {
        const peakMonth = [...monthlyStats].sort((a, b) => b.revenue - a.revenue)[0];
        let monthlyList = monthlyStats.map(m => 
          `• **${m.label || m.monthKey}**: Revenue ₹${m.revenue.toLocaleString('en-IN')} | Profit ₹${m.profit.toLocaleString('en-IN')} (${m.count} transactions)`
        ).join('\n');

        let growthText = '';
        if (monthlyStats.length >= 2) {
          const prev = monthlyStats[monthlyStats.length - 2];
          const curr = monthlyStats[monthlyStats.length - 1];
          const growth = prev.revenue > 0 ? Math.round(((curr.revenue - prev.revenue) / prev.revenue) * 1000) / 10 : 0;
          growthText = `\n📈 **Sequential Growth**: Month-over-month revenue changed by **${growth >= 0 ? '+' : ''}${growth}%** between the last two recorded periods.\n`;
        }

        answerText = `📈 **Monthly Financial Trends & Velocity**\n\n` +
          `• **Peak Month**: **${peakMonth.label || peakMonth.monthKey}** with ₹${peakMonth.revenue.toLocaleString('en-IN')} revenue and ₹${peakMonth.profit.toLocaleString('en-IN')} profit.\n` +
          growthText + `\n` +
          `**Monthly Timeline:**\n${monthlyList}`;

        this.lastContext = { topic: 'monthly', entity: peakMonth };
      } else {
        answerText = `No dated transaction records available to compute monthly trends.`;
      }
      suggestions = ['Overall Performance', 'Key Insights', 'Top Products'];
    }

    // 12. KEY BUSINESS INSIGHTS
    else if (
      query.includes('insight') ||
      query.includes('ai insight') ||
      query.includes('recommendation') ||
      query.includes('findings') ||
      query.includes('takeaway')
    ) {
      if (insights.hasData && insights.insights.length > 0) {
        const listStr = insights.insights.map(item => `• ${item.icon} **${item.title}**: ${item.text}`).join('\n\n');
        answerText = `💡 **Algorithmic Business Insights**\n\nHere are the key takeaways derived from your data:\n\n${listStr}`;
      } else {
        answerText = `💡 **Current Insights**:\n• Total Revenue: ₹${kpis.totalRevenue.toLocaleString('en-IN')}\n• Profit Margin: ${kpis.profitMargin}%\n• Net Business Balance: ₹${balanceData.netBusinessBalance.toLocaleString('en-IN')}`;
      }
      suggestions = ['Areas for Improvement', 'Top Products', 'Best Region'];
      this.lastContext = { topic: 'insights', entity: null };
    }

    // 13. AREAS NEEDING IMPROVEMENT / WEAKNESSES
    else if (
      query.includes('improvement') ||
      query.includes('weakness') ||
      query.includes('issue') ||
      query.includes('problem') ||
      query.includes('risk') ||
      query.includes('what should i fix') ||
      query.includes('need improvement')
    ) {
      const lowMargin = productStats.filter(p => p.marginPct < 15 || p.profit <= 0);
      const lowestP = productStats.length > 1 ? productStats[productStats.length - 1] : null;
      const lowestR = regionStats.length > 1 ? regionStats[regionStats.length - 1] : null;

      let points = [];

      if (balanceData.netBusinessBalance < 0) {
        points.push(`1. **Working Capital Deficit**: Current debits exceed credits by ₹${Math.abs(balanceData.netBusinessBalance).toLocaleString('en-IN')}. Focus on clearing pending credit receivables.`);
      }

      if (lowMargin.length > 0) {
        points.push(`2. **Margin Squeeze**: ${lowMargin.length} product(s) have margins below 15% (e.g. *${lowMargin[0].name}* at ${lowMargin[0].marginPct}% margin). Consider increasing prices or lowering COGS.`);
      }

      if (lowestP) {
        points.push(`3. **Low Volume Product**: *${lowestP.name}* generated only ₹${lowestP.revenue.toLocaleString('en-IN')} (${lowestP.sharePct}% share). Review sales strategy.`);
      }

      if (lowestR) {
        points.push(`4. **Regional Lag**: The *${lowestR.region}* region represents your lowest sales volume (₹${lowestR.revenue.toLocaleString('en-IN')}). Consider localized promotions.`);
      }

      if (points.length === 0) {
        points.push(`• All products are performing above 15% margin and working capital is positive! Focus on scaling marketing in top regions.`);
      }

      answerText = `⚠️ **Key Areas for Operational Improvement**\n\nBased on your numbers, here are priority areas to optimize:\n\n${points.join('\n\n')}`;
      suggestions = ['Net Business Balance', 'Lowest Performing Product', 'Profit Analysis'];
      this.lastContext = { topic: 'improvement', entity: null };
    }

    // 14. DEFAULT NATURAL RESPONSE
    else {
      answerText = `I analyzed your live system metrics:\n` +
        `• **Sales Revenue**: ₹${kpis.totalRevenue.toLocaleString('en-IN')} (${records.length} records)\n` +
        `• **Payroll**: ₹${salaryKPIs.totalGrossSalary.toLocaleString('en-IN')} (${salaryKPIs.totalEmployees} employees)\n` +
        `• **Credit Receivables**: ₹${creditKPIs.totalCredit.toLocaleString('en-IN')}\n` +
        `• **Debit Payables**: ₹${debitKPIs.totalDebit.toLocaleString('en-IN')}\n` +
        `• **Net Balance**: ₹${balanceData.netBusinessBalance.toLocaleString('en-IN')}\n\n` +
        `Try asking: *"What is our net business balance?"*, *"Tell me about employee salaries"*, or *"Which product has the highest sales?"*`;
      suggestions = ['Overall Summary', 'Net Business Balance', 'Employee Salary', 'Business Credit', 'Business Debit'];
    }

    const finalResponse = {
      text: answerText,
      suggestions: suggestions.length > 0 ? suggestions : ['Overall Summary', 'Net Business Balance', 'Top Products'],
    };

    this.conversationHistory.push({ role: 'assistant', content: answerText, timestamp: new Date().toISOString() });
    return finalResponse;
  }
}

export const aiChatEngine = new AIChatEngine();
