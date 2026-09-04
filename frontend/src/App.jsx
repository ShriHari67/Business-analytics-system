import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import DataManagementPage from './pages/DataManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InsightsPage from './pages/InsightsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Newly Added Business Modules
import SalariesPage from './pages/SalariesPage';
import CreditPage from './pages/CreditPage';
import DebitPage from './pages/DebitPage';

import {
  getStoredRecords,
  getStoredSalaries,
  getStoredCredits,
  getStoredDebits,
} from './services/dataStore';
import './App.css';

const TAB_METADATA = {
  dashboard: {
    title: 'Executive Financial & Business Overview',
    subtitle: 'Dynamic calculations strictly computed from your business transactions',
  },
  data: {
    title: 'Data Management & Catalog Store',
    subtitle: 'Manual transaction entries, CSV/Excel file validation, and catalog management',
  },
  analytics: {
    title: 'Multi-Dimensional Business Analytics',
    subtitle: 'Interactive monthly revenue, profit trends, category and regional performance charts',
  },
  insights: {
    title: 'Algorithmic Business Insights & Discovery',
    subtitle: 'Automated identification of top performers, growth rates, and margin warnings',
  },
  reports: {
    title: 'Enterprise Financial & Audit Statements',
    subtitle: 'Generate customized accounting reports and export in CSV, Excel or PDF',
  },
  salary: {
    title: 'Employee Salary & Payroll Management',
    subtitle: 'Manage staff compensations, bonus incentives, and automated net salary disbursements',
  },
  credit: {
    title: 'Business Credit & Accounts Receivable',
    subtitle: 'Monitor customer credit lines, due payment dates, and outstanding receivables',
  },
  debit: {
    title: 'Business Debit & Accounts Payable',
    subtitle: 'Track vendor outflows, operating expenses, and category cost distributions',
  },
  settings: {
    title: 'System Preferences & Data Backup',
    subtitle: 'Export JSON archives, restore snapshots, and inspect microservices status',
  },
};

export default function App() {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [records, setRecords] = useState(() => getStoredRecords());
  const [salaries, setSalaries] = useState(() => getStoredSalaries());
  const [credits, setCredits] = useState(() => getStoredCredits());
  const [debits, setDebits] = useState(() => getStoredDebits());

  // Global Multi-Dimensional Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    product: '',
    category: '',
    region: '',
    customer: '',
    salesperson: '',
    search: '',
  });

  // Global Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 3500);
  };

  // Reload all stored datasets
  const refreshAll = () => {
    setRecords(getStoredRecords());
    setSalaries(getStoredSalaries());
    setCredits(getStoredCredits());
    setDebits(getStoredDebits());
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      product: '',
      category: '',
      region: '',
      customer: '',
      salesperson: '',
      search: '',
    });
    showToast('Filters reset to default view', 'info');
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.dashboard;

  return (
    <div className="app-container-dark">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Modern Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileOpen(false);
        }}
        isMobileOpen={isMobileOpen}
        totalRecords={records.length}
      />

      {/* Main App Content Area */}
      <div className="main-wrapper-dark">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          totalRecords={records.length}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          onOpenAddModal={() => {
            if (activeTab === 'salary' || activeTab === 'credit' || activeTab === 'debit') {
              // Stay on active tab to add record
            } else {
              setActiveTab('data');
            }
          }}
          onOpenUploadModal={() => setActiveTab('data')}
        />

        <main className="content-body-dark">
          {activeTab === 'dashboard' && (
            <Dashboard
              records={records}
              salaries={salaries}
              credits={credits}
              debits={debits}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'data' && (
            <DataManagementPage
              records={records}
              onDataUpdated={refreshAll}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage
              records={records}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsPage
              records={records}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              records={records}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              onShowToast={showToast}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'salary' && (
            <SalariesPage
              onDataUpdated={refreshAll}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'credit' && (
            <CreditPage
              onDataUpdated={refreshAll}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'debit' && (
            <DebitPage
              onDataUpdated={refreshAll}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              records={records}
              onDataUpdated={refreshAll}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Floating AI Business Analytics Chatbot Assistant */}
      <Chatbot
        records={records}
        salaries={salaries}
        credits={credits}
        debits={debits}
      />
    </div>
  );
}
