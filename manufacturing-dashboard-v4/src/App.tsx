import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import NotImplemented from './pages/NotImplemented';
import { DataProvider } from './data/DataContext';

/* 已實作的頁面（懶載入，加快首屏速度） */
const OverviewPage = lazy(() => import('./pages/overview/OverviewPage'));
const HealthPage = lazy(() => import('./pages/health/HealthPage'));
const AlertPage = lazy(() => import('./pages/alert/AlertPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const ProcurementPage = lazy(() => import('./pages/procurement/ProcurementPage'));
const SupplierPage = lazy(() => import('./pages/supplier/SupplierPage'));
const ProductionPage = lazy(() => import('./pages/production/ProductionPage'));
const CostPage = lazy(() => import('./pages/cost/CostPage'));
const AIPage = lazy(() => import('./pages/ai/AIPage'));
const SimulationPage = lazy(() => import('./pages/simulation/SimulationPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const KBPage = lazy(() => import('./pages/kb/KBPage'));

const PageLoader: React.FC = () => (
  <div className="loading-container">
    <div className="spinner" />
    <p>載入中...</p>
  </div>
);

const App: React.FC = () => (
  <DataProvider>
  <MainLayout>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 預設導向總覽 */}
        <Route path="/" element={<Navigate to="/overview" replace />} />

        {/* 已實作頁面 */}
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/alert" element={<AlertPage />} />
        <Route path="/inventory/*" element={<InventoryPage />} />
        <Route path="/procurement/*" element={<ProcurementPage />} />
        <Route path="/supplier/*" element={<SupplierPage />} />
        <Route path="/production/*" element={<ProductionPage />} />
        <Route path="/cost/*" element={<CostPage />} />
        <Route path="/ai/*" element={<AIPage />} />
        <Route path="/simulation/*" element={<SimulationPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route path="/reports/*" element={<ReportsPage />} />
        <Route path="/kb/dax" element={<KBPage />} />

        {/* 尚未實作的頁面 */}
        <Route path="*" element={<NotImplemented />} />
      </Routes>
    </Suspense>
  </MainLayout>
  </DataProvider>
);

export default App;
