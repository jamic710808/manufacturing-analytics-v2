/**
 * SupplierPage.tsx - 供應商管理頁面
 *
 * V4 新功能：
 * - 供應商評分卡
 * - 供應商風險評估
 * - 合作關係分析
 * - 供應商地圖視覺化
 */
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

/** 供應商類型 */
interface Supplier {
  id: string;
  name: string;
  code: string;
  country: string;
  category: string;
  rating: number;
  riskLevel: 'low' | 'medium' | 'high';
  annualVolume: number;
  cooperationYears: number;
  status: 'active' | 'pending' | 'suspended';
}

/** 供應商摘要類型 */
interface SupplierSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  avgRating: number;
  highRiskCount: number;
  totalAnnualVolume: number;
}

const SupplierPage: React.FC = () => {
  const [summary, setSummary] = useState<SupplierSummary>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    avgRating: 0,
    highRiskCount: 0,
    totalAnnualVolume: 0,
  });
  const [ratingDistribution, setRatingDistribution] = useState<{ name: string; value: number }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模擬 API 載入
    setTimeout(() => {
      setSummary({
        totalSuppliers: 156,
        activeSuppliers: 142,
        avgRating: 4.2,
        highRiskCount: 8,
        totalAnnualVolume: 185600000,
      });

      setRatingDistribution([
        { name: '5星 (優秀)', value: 45 },
        { name: '4星 (良好)', value: 68 },
        { name: '3星 (普通)', value: 28 },
        { name: '2星 (待改進)', value: 10 },
        { name: '1星 (不合格)', value: 5 },
      ]);

      setSuppliers([
        { id: '1', name: '供應商 A', code: 'S-001', country: '台灣', category: '電子原料', rating: 4.9, riskLevel: 'low', annualVolume: 28000000, cooperationYears: 8, status: 'active' },
        { id: '2', name: '供應商 B', code: 'S-002', country: '日本', category: '包裝材料', rating: 4.7, riskLevel: 'low', annualVolume: 18500000, cooperationYears: 12, status: 'active' },
        { id: '3', name: '供應商 C', code: 'S-003', country: '中國', category: '生產設備', rating: 4.5, riskLevel: 'medium', annualVolume: 22000000, cooperationYears: 5, status: 'active' },
        { id: '4', name: '供應商 D', code: 'S-004', country: '韓國', category: '間接物料', rating: 4.3, riskLevel: 'low', annualVolume: 12000000, cooperationYears: 6, status: 'active' },
        { id: '5', name: '供應商 E', code: 'S-005', country: '中國', category: '電子原料', rating: 3.8, riskLevel: 'high', annualVolume: 15000000, cooperationYears: 3, status: 'active' },
        { id: '6', name: '供應商 F', code: 'S-006', country: '美國', category: '物流服務', rating: 4.6, riskLevel: 'low', annualVolume: 8500000, cooperationYears: 7, status: 'active' },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  /** 取得風險等級顏色 */
  const getRiskColor = (riskLevel: Supplier['riskLevel']) => {
    switch (riskLevel) {
      case 'low': return 'var(--success)';
      case 'medium': return 'var(--warning)';
      case 'high': return 'var(--danger)';
    }
  };

  /** 取得評分星星 */
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalf) stars += '½';
    return stars;
  };

  /** 評分分佈圖配置 */
  const getRatingChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ratingDistribution.map(d => d.name),
      axisLine: { lineStyle: { color: 'var(--chart-axis)' } },
      axisLabel: { color: 'var(--text-secondary)', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'var(--chart-axis)' } },
      axisLabel: { color: 'var(--text-secondary)' },
      splitLine: { lineStyle: { color: 'var(--chart-grid)' } },
    },
    series: [
      {
        name: '供應商數',
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.3)' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        data: ratingDistribution.map(d => d.value),
      },
    ],
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>載入供應商資料中...</p>
      </div>
    );
  }

  return (
    <div className="supplier-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 style={styles.pageTitle}>🏭 供應商管理</h1>
        <p style={styles.pageSubtitle}>全面掌握供應商績效與風險</p>
      </div>

      {/* KPI 摘要卡 */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <span className="kpi-label">總供應商數</span>
          <span className="kpi-value">
            {summary.totalSuppliers}
            <span style={styles.kpiUnit}>家</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">平均評分</span>
          <span className="kpi-value">
            {summary.avgRating}
            <span style={styles.kpiUnit}>★</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">高風險供應商</span>
          <span className="kpi-value" style={{ color: summary.highRiskCount > 5 ? 'var(--danger)' : 'var(--warning)' }}>
            {summary.highRiskCount}
            <span style={styles.kpiUnit}>家</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">年採購額</span>
          <span className="kpi-value">
            {(summary.totalAnnualVolume / 1000000).toFixed(0)}
            <span style={styles.kpiUnit}>百萬</span>
          </span>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="main-grid">
        {/* 評分分佈圖 */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>📊 供應商評分分佈</h3>
          </div>
          <div className="chart-container" style={{ height: '250px' }}>
            <ReactECharts option={getRatingChartOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 風險評估摘要 */}
        <div className="glass-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>⚠️ 風險評估摘要</h3>
          </div>
          <div className="risk-summary">
            <div className="risk-item">
              <span className="risk-indicator low" />
              <span className="risk-label">低風險</span>
              <span className="risk-count" style={{ color: 'var(--success)' }}>
                {summary.activeSuppliers - summary.highRiskCount} 家
              </span>
            </div>
            <div className="risk-item">
              <span className="risk-indicator medium" />
              <span className="risk-label">中風險</span>
              <span className="risk-count" style={{ color: 'var(--warning)' }}>
                {Math.floor(summary.highRiskCount / 2)} 家
              </span>
            </div>
            <div className="risk-item">
              <span className="risk-indicator high" />
              <span className="risk-label">高風險</span>
              <span className="risk-count" style={{ color: 'var(--danger)' }}>
                {summary.highRiskCount} 家
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 供應商列表 */}
      <div className="glass-panel">
        <div className="chart-header">
          <h3 style={styles.chartTitle}>📋 供應商評比</h3>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>供應商</th>
                <th>代碼</th>
                <th>國家</th>
                <th>類別</th>
                <th>評分</th>
                <th>風險等級</th>
                <th>年採購額</th>
                <th>合作年資</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.code}</td>
                  <td>{supplier.country}</td>
                  <td>{supplier.category}</td>
                  <td>
                    <span className="rating">
                      {renderStars(supplier.rating)} {supplier.rating}
                    </span>
                  </td>
                  <td>
                    <span
                      className="risk-badge"
                      style={{
                        backgroundColor: `${getRiskColor(supplier.riskLevel)}20`,
                        color: getRiskColor(supplier.riskLevel),
                      }}
                    >
                      {supplier.riskLevel === 'low' ? '低' : supplier.riskLevel === 'medium' ? '中' : '高'}
                    </span>
                  </td>
                  <td>${(supplier.annualVolume / 1000000).toFixed(1)}M</td>
                  <td>{supplier.cooperationYears} 年</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: supplier.status === 'active' ? 'var(--success)20' : 'var(--warning)20',
                        color: supplier.status === 'active' ? 'var(--success)' : 'var(--warning)',
                      }}
                    >
                      {supplier.status === 'active' ? '正常' : '待審'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  kpiUnit: {
    fontSize: '18px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginLeft: '4px',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
};

export default SupplierPage;
