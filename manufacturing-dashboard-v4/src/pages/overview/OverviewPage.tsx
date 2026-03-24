/**
 * OverviewPage.tsx - 工廠總覽主頁面
 *
 * V4 新功能：
 * - 異常警訊 Top 5
 * - 工廠健康度分數
 * - 即時 KPI 指標卡
 */
import React, { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';

/** KPI 指標類型 */
interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  trendLabel: string;
}

/** 異常警訊類型 */
interface Alert {
  id: string;
  level: 'P1' | 'P2' | 'P3';
  title: string;
  description: string;
  time: string;
  location: string;
}

/** 圖表資料類型 */
interface ChartData {
  name: string;
  value: number;
}

const OverviewPage: React.FC = () => {
  // 狀態管理
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendData, setTrendData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // 載入資料
  useEffect(() => {
    // 模擬 API 載入
    setTimeout(() => {
      setKpis([
        { id: 'oee', label: 'OEE', value: 87.3, unit: '%', trend: 2.5, trendLabel: '較上月' },
        { id: 'quality', label: '品質達成率', value: 96.2, unit: '%', trend: 0.8, trendLabel: '較上月' },
        { id: 'otd', label: 'OTD 達成率', value: 78.5, unit: '%', trend: -3.2, trendLabel: '較上月' },
        { id: 'inventory', label: '庫存週轉率', value: 8.4, unit: '次', trend: 1.1, trendLabel: '較上月' },
      ]);

      setAlerts([
        { id: '1', level: 'P1', title: '供應商交期延誤', description: '供應商 A-1234 原料短缺', time: '10分鐘前', location: '原料倉庫' },
        { id: '2', level: 'P2', title: '良率異常下降', description: 'SMT 線良率降至 94.2%', time: '35分鐘前', location: 'SMT-01' },
        { id: '3', level: 'P2', title: '設備維護提醒', description: '沖壓機 P-203 需要保養', time: '1小時前', location: '沖壓車間' },
        { id: '4', level: 'P3', title: '庫存水位警告', description: '物料 M-5678 低於安全庫存', time: '2小時前', location: '半成品倉' },
        { id: '5', level: 'P3', title: '訂單逾期風險', description: '訂單 PO-2024-0892 可能延誤', time: '3小時前', location: '生管課' },
      ]);

      setTrendData([
        { name: '一月', value: 82 },
        { name: '二月', value: 85 },
        { name: '三月', value: 84 },
        { name: '四月', value: 88 },
        { name: '五月', value: 86 },
        { name: '六月', value: 89 },
        { name: '七月', value: 87 },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  /** 取得異常等級顏色 */
  const getAlertColor = (level: Alert['level']) => {
    switch (level) {
      case 'P1':
        return 'var(--danger)';
      case 'P2':
        return 'var(--warning)';
      case 'P3':
        return 'var(--info)';
    }
  };

  /** 取得趨勢方向 */
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  };

  /** 取得趨勢顏色 */
  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'var(--success)';
    if (trend < 0) return 'var(--danger)';
    return 'var(--text-muted)';
  };

  /** OEE 趨勢圖配置 */
  const getOEEChartOption = () => ({
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
      min: 70,
      max: 100,
      axisLine: { lineStyle: { color: 'var(--chart-axis)' } },
      axisLabel: { color: 'var(--text-secondary)', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'var(--chart-grid)' } },
    },
    series: [
      {
        name: 'OEE',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
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
        <p>載入工廠總覽資料中...</p>
      </div>
    );
  }

  return (
    <div className="overview-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 style={styles.pageTitle}>🏭 工廠總覽</h1>
        <p style={styles.pageSubtitle}>即時掌握工廠健康度與異常警訊</p>
      </div>

      {/* KPI 指標卡 */}
      <div className="kpi-grid">
        {kpis.map(kpi => (
          <div key={kpi.id} className="glass-panel kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">
              {kpi.value}
              <span style={styles.kpiUnit}>{kpi.unit}</span>
            </span>
            <span
              className="kpi-trend"
              style={{ color: getTrendColor(kpi.trend) }}
            >
              {getTrendIcon(kpi.trend)} {Math.abs(kpi.trend)}% {kpi.trendLabel}
            </span>
          </div>
        ))}
      </div>

      {/* 主內容區 */}
      <div className="main-grid">
        {/* 左側：OEE 趨勢圖 */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>📈 OEE 趨勢</h3>
            <span className="badge badge-success">目標: 85%</span>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ReactECharts option={getOEEChartOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 右側：異常警訊 Top 5 */}
        <div className="glass-panel alerts-panel">
          <div className="chart-header">
            <h3 style={styles.chartTitle}>🚨 異常警訊 Top 5</h3>
            <a href="/alert" style={styles.viewAll}>查看全部 →</a>
          </div>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className="alert-item">
                <div
                  className="alert-level"
                  style={{ backgroundColor: getAlertColor(alert.level) }}
                >
                  {alert.level}
                </div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-desc">{alert.description}</div>
                  <div className="alert-meta">
                    <span>📍 {alert.location}</span>
                    <span>⏰ {alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 工廠健康度雷達圖 */}
      <div className="glass-panel health-radar">
        <div className="chart-header">
          <h3 style={styles.chartTitle}>🎯 工廠健康度評估</h3>
          <span className="health-score">綜合分數: <strong>85.6</strong> / 100</span>
        </div>
        <div className="health-factors">
          <div className="health-factor">
            <span className="factor-name">設備效率</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '88%', backgroundColor: 'var(--success)' }} />
            </div>
            <span className="factor-value">88%</span>
          </div>
          <div className="health-factor">
            <span className="factor-name">品質管理</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '96%', backgroundColor: 'var(--success)' }} />
            </div>
            <span className="factor-value">96%</span>
          </div>
          <div className="health-factor">
            <span className="factor-name">交付时效</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '78%', backgroundColor: 'var(--warning)' }} />
            </div>
            <span className="factor-value">78%</span>
          </div>
          <div className="health-factor">
            <span className="factor-name">庫存優化</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '92%', backgroundColor: 'var(--success)' }} />
            </div>
            <span className="factor-value">92%</span>
          </div>
          <div className="health-factor">
            <span className="factor-name">成本控制</span>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '85%', backgroundColor: 'var(--success)' }} />
            </div>
            <span className="factor-value">85%</span>
          </div>
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
  viewAll: {
    fontSize: '13px',
    color: 'var(--accent)',
    textDecoration: 'none',
  },
};

export default OverviewPage;
