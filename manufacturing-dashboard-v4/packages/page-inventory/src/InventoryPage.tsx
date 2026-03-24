/**
 * InventoryPage.tsx - 庫存分析頁面
 *
 * V4 新功能：
 * - 庫存週轉率追蹤
 * - 庫存分佈（按類別/倉庫）
 * - 呆滯庫存預警
 * - 庫存健康度儀表板
 */
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

/** 庫存品項類型 */
interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  unit: string;
  value: number;
  turnoverRate: number;
  daysOfSupply: number;
  status: 'normal' | 'low' | 'excess' | 'slow';
}

/** 庫存摘要類型 */
interface InventorySummary {
  totalValue: number;
  turnoverRate: number;
  avgDaysOfSupply: number;
  slowMovingCount: number;
  slowMovingValue: number;
}

const InventoryPage: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary>({
    totalValue: 0,
    turnoverRate: 0,
    avgDaysOfSupply: 0,
    slowMovingCount: 0,
    slowMovingValue: 0,
  });
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [trendData, setTrendData] = useState<{ name: string; value: number }[]>([]);
  const [slowMovingItems, setSlowMovingItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模擬 API 載入
    setTimeout(() => {
      setSummary({
        totalValue: 12568000,
        turnoverRate: 8.4,
        avgDaysOfSupply: 43,
        slowMovingCount: 12,
        slowMovingValue: 856000,
      });

      setCategoryData([
        { name: '原料', value: 4200000 },
        { name: '半成品', value: 3100000 },
        { name: '成品', value: 2800000 },
        { name: '包裝材', value: 1200000 },
        { name: '間接物料', value: 1268000 },
      ]);

      setTrendData([
        { name: '1月', value: 11800 },
        { name: '2月', value: 12200 },
        { name: '3月', value: 11900 },
        { name: '4月', value: 12400 },
        { name: '5月', value: 12100 },
        { name: '6月', value: 12568 },
      ]);

      setSlowMovingItems([
        { id: '1', code: 'M-1234', name: '舊款面板 A', category: '原料', warehouse: '原料倉', quantity: 500, unit: 'pcs', value: 125000, turnoverRate: 0.3, daysOfSupply: 180, status: 'slow' },
        { id: '2', code: 'W-5678', name: '包裝箱（舊規格）', category: '包裝材', warehouse: '包裝倉', quantity: 2000, unit: 'pcs', value: 60000, turnoverRate: 0.5, daysOfSupply: 150, status: 'slow' },
        { id: '3', code: 'F-9012', name: '不良半成品', category: '半成品', warehouse: '不良區', quantity: 120, unit: 'pcs', value: 48000, turnoverRate: 0.2, daysOfSupply: 200, status: 'slow' },
        { id: '4', code: 'P-3456', name: '停產零件 X', category: '原料', warehouse: '原料倉', quantity: 300, unit: 'pcs', value: 90000, turnoverRate: 0.1, daysOfSupply: 250, status: 'slow' },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  /** 取得狀態顏色 */
  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'normal': return 'var(--success)';
      case 'low': return 'var(--warning)';
      case 'excess': return 'var(--info)';
      case 'slow': return 'var(--danger)';
    }
  };

  /** 取得狀態標籤 */
  const getStatusLabel = (status: InventoryItem['status']) => {
    switch (status) {
      case 'normal': return '正常';
      case 'low': return '偏低';
      case 'excess': return '過剩';
      case 'slow': return '呆滯';
    }
  };

  /** 庫存分佈圖配置 */
  const getCategoryChartOption = () => ({
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
        avoidLabelOverlap: true,
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
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: categoryData,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      },
    ],
  });

  /** 庫存趨勢圖配置 */
  const getTrendChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--glass-bg)',
      borderColor: 'var(--glass-border)',
      textStyle: { color: 'var(--text-primary)' },
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
        formatter: (value: number) => `${(value / 1000).toFixed(0)}K`,
      },
      splitLine: { lineStyle: { color: 'var(--chart-grid)' } },
    },
    series: [
      {
        name: '庫存金額',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.3)' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        data: trendData.map(d => d.value),
      },
    ],
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>載入庫存分析資料中...</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 style={styles.pageTitle}>📦 庫存分析</h1>
        <p style={styles.pageSubtitle}>即時掌握庫存水位與週轉效率</p>
      </div>

      {/* KPI 摘要卡 */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <span className="kpi-label">總庫存金額</span>
          <span className="kpi-value">
            {(summary.totalValue / 1000000).toFixed(1)}
            <span style={styles.kpiUnit}>百萬</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">週轉率</span>
          <span className="kpi-value">
            {summary.turnoverRate}
            <span style={styles.kpiUnit}>次</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">平均庫存天數</span>
          <span className="kpi-value">
            {summary.avgDaysOfSupply}
            <span style={styles.kpiUnit}>天</span>
          </span>
        </div>
        <div className="glass-panel kpi-card">
          <span className="kpi-label">呆滯庫存</span>
          <span className="kpi-value" style={{ color: 'var(--danger)' }}>
            {summary.slowMovingCount}
            <span style={styles.kpiUnit}>項</span>
          </span>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="main-grid">
        {/* 左側：庫存分佈圖 */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>📊 庫存分佈</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ReactECharts option={getCategoryChartOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 右側：庫存趨勢圖 */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>📈 庫存金額趨勢</h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ReactECharts option={getTrendChartOption()} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      {/* 呆滯庫存列表 */}
      <div className="glass-panel">
        <div className="chart-header">
          <h3 style={styles.chartTitle}>⚠️ 呆滯庫存預警</h3>
          <span style={styles.alertBadge}>
            呆滯金額: {(summary.slowMovingValue / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>料號</th>
                <th>品名</th>
                <th>類別</th>
                <th>倉庫</th>
                <th>數量</th>
                <th>庫存金額</th>
                <th>週轉率</th>
                <th>呆滯天數</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {slowMovingItems.map(item => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.warehouse}</td>
                  <td>{item.quantity.toLocaleString()} {item.unit}</td>
                  <td>${item.value.toLocaleString()}</td>
                  <td>{item.turnoverRate} 次/年</td>
                  <td>{item.daysOfSupply} 天</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(item.status)}20`,
                        color: getStatusColor(item.status),
                      }}
                    >
                      {getStatusLabel(item.status)}
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
  alertBadge: {
    fontSize: '13px',
    color: 'var(--danger)',
    fontWeight: 600,
  },
};

export default InventoryPage;
