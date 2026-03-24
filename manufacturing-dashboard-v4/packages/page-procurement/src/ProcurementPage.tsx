/**
 * ProcurementPage.tsx - 採購分析頁面
 *
 * V4 新功能：
 * - 採購金額趨勢
 * - 供應商分佈分析
 * - 交期達成率追蹤
 * - 採購效率指標
 */
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

/** 採購摘要類型 */
interface ProcurementSummary {
  totalPOAmount: number;
  onTimeDeliveryRate: number;
  avgLeadTime: number;
  pendingPOs: number;
  activeSuppliers: number;
}

/** 供應商類型 */
interface SupplierPerformance {
  id: string;
  name: string;
  code: string;
  category: string;
  onTimeRate: number;
  qualityRate: number;
  priceCompliance: number;
  score: number;
}

const ProcurementPage: React.FC = () => {
  const [summary, setSummary] = useState<ProcurementSummary>({
    totalPOAmount: 0,
    onTimeDeliveryRate: 0,
    avgLeadTime: 0,
    pendingPOs: 0,
    activeSuppliers: 0,
  });
  const [trendData, setTrendData] = useState<{ name: string; value: number }[]>([]);
  const [supplierData, setSupplierData] = useState<{ name: string; value: number }[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<SupplierPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模擬 API 載入
    setTimeout(() => {
      setSummary({
        totalPOAmount: 45680000,
        onTimeDeliveryRate: 94.2,
        avgLeadTime: 12,
        pendingPOs: 28,
        activeSuppliers: 156,
      });

      setTrendData([
        { name: '1月', value: 7200000 },
        { name: '2月', value: 6800000 },
        { name: '3月', value: 7500000 },
        { name: '4月', value: 8100000 },
        { name: '5月', value: 7800000 },
        { name: '6月', value: 8280000 },
      ]);

      setSupplierData([
        { name: '電子原料', value: 18500000 },
        { name: '包裝材料', value: 9200000 },
        { name: '生產設備', value: 6800000 },
        { name: '間接物料', value: 5800000 },
        { name: '物流服務', value: 5380000 },
      ]);

      setTopSuppliers([
        { id: '1', name: '供應商 A', code: 'S-001', category: '電子原料', onTimeRate: 98.5, qualityRate: 99.2, priceCompliance: 97.8, score: 98.5 },
        { id: '2', name: '供應商 B', code: 'S-002', category: '包裝材料', onTimeRate: 96.2, qualityRate: 98.5, priceCompliance: 99.1, score: 97.9 },
        { id: '3', name: '供應商 C', code: 'S-003', category: '生產設備', onTimeRate: 94.8, qualityRate: 97.2, priceCompliance: 98.5, score: 96.8 },
        { id: '4', name: '供應商 D', code: 'S-004', category: '間接物料', onTimeRate: 93.5, qualityRate: 96.8, priceCompliance: 97.2, score: 95.8 },
        { id: '5', name: '供應商 E', code: 'S-005', category: '物流服務', onTimeRate: 92.1, qualityRate: 95.5, priceCompliance: 98.8, score: 95.5 },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  /** 取得分數顏色 */
  const getScoreColor = (score: number) => {
    if (score >= 97) return 'var(--success)';
    if (score >= 94) return 'var(--warning)';
    return 'var(--danger)';
  };

  /** 供應商分佈圖配置 */
  const getSupplierChartOption = () => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: 'var(--text-secondary)' },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: 'var(--surface-base)',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: 'var(--text-primary)',
        },
        data: supplierData,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      },
    ],
  });

  /** 採購趨勢圖配置 */
  const getTrendChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--glass-bg)',
      borderColor: 'var(--glass-border)',
      textStyle: { color: 'var(--text-primary)' },
      formatter: '{b}: ${c.toLocaleString()}',
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
      boundaryGap: false,
      data: trendData.map(d => d.name),
      axisLine: { lineStyle: { color: 'var(--chart-axis)' } },
      axisLabel: { color: 'var(--text-secondary)' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'var(--chart-axis)' } },
      axisLabel: {
        color: 'var(--text-secondary)',
        formatter: (value: number) => `${(value / 1000000).toFixed(1)}M`,
      },
      splitLine: { lineStyle: { color: 'var(--chart-grid)' } },
    },
    series: [
      {
        name: '採購金額',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
        data: trendData.map(d => d.value),
      },
    ],
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>載入採購分析資料中...</p>
      </div>
    );
  }

  return (
    <div className="procurement-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 style={styles.pageTitle}>🛒 採購分析</h1>
        <p style={styles.pageSubtitle}>掌握採購效率與供應商績效</p>
      </div>

      {/* KPI 摘要卡 */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <span className="kpi-label">採購總金額</span>
          <span className="kpi-value">
            {(summary.totalPOAmount / 1000000).toFixed(1)}
            <span style={styles.kpiUnit}>百萬</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">交期達成率</span>
          <span className="kpi-value" style={{ color: summary.onTimeDeliveryRate >= 95 ? 'var(--success)' : 'var(--warning)' }}>
            {summary.onTimeDeliveryRate}
            <span style={styles.kpiUnit}>%</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">平均交期</span>
          <span className="kpi-value">
            {summary.avgLeadTime}
            <span style={styles.kpiUnit}>天</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">待處理 PO</span>
          <span className="kpi-value" style={{ color: summary.pendingPOs > 20 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {summary.pendingPOs}
            <span style={styles.kpiUnit}>筆</span>
          </span>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="main-grid">
        {/* 左側：採購趨勢圖 */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>📈 採購金額趨勢</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ReactECharts option={getTrendChartOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 右側：供應商分佈圖 */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>📊 採購類別分佈</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ReactECharts option={getSupplierChartOption()} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      {/* 供應商績效排行 */}
      <div className="glass-panel">
        <div className="chart-header">
          <h3 style={styles.chartTitle}>🏆 供應商績效評比 Top 5</h3>
          <span style={styles.supplierCount}>共 {summary.activeSuppliers} 家供應商</span>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>供應商</th>
                <th>代碼</th>
                <th>類別</th>
                <th>交期達成</th>
                <th>品質合格率</th>
                <th>價格合規</th>
                <th>綜合評分</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map((supplier, index) => (
                <tr key={supplier.id}>
                  <td>
                    <span className="rank-badge" data-rank={index + 1}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{supplier.name}</td>
                  <td>{supplier.code}</td>
                  <td>{supplier.category}</td>
                  <td>{supplier.onTimeRate}%</td>
                  <td>{supplier.qualityRate}%</td>
                  <td>{supplier.priceCompliance}%</td>
                  <td>
                    <span
                      className="score-badge"
                      style={{
                        backgroundColor: `${getScoreColor(supplier.score)}20`,
                        color: getScoreColor(supplier.score),
                      }}
                    >
                      {supplier.score}
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
  supplierCount: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};

export default ProcurementPage;
