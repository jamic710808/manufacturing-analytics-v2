/**
 * ProductionPage.tsx - 生產與品質分析頁面
 *
 * V4 新功能：
 * - OEE 設備效率儀表板
 * - 生產數據與良率分析
 * - 內部路由: /yield, /oee, /cpk, /quality, /iqc
 */
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

/** 取得當前內部路由 */
const getCurrentSubRoute = (): string => {
  const path = window.location.pathname;
  // path like /production/oee -> extract 'oee'
  const match = path.match(/\/production\/(\w+)/);
  return match ? match[1] : 'yield';
};

/** OEE 資料類型 */
interface OEEData {
  id: string;
  equipmentName: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

/** 生產良率資料類型 */
interface YieldData {
  id: string;
  productName: string;
  targetYield: number;
  actualYield: number;
  output: number;
  defectRate: number;
}

/** 摘要類型 */
interface ProductionSummary {
  overallOEE: number;
  avgYield: number;
  totalOutput: number;
  defectRate: number;
  criticalEquipment: number;
}

const ProductionPage: React.FC = () => {
  const [subRoute, setSubRoute] = useState(getCurrentSubRoute);
  const [summary, setSummary] = useState<ProductionSummary>({
    overallOEE: 0,
    avgYield: 0,
    totalOutput: 0,
    defectRate: 0,
    criticalEquipment: 0,
  });
  const [oeeData, setOeeData] = useState<OEEData[]>([]);
  const [yieldData, setYieldData] = useState<YieldData[]>([]);
  const [trendData, setTrendData] = useState<{ name: string; oee: number; yield: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // 監聽路由變化
  useEffect(() => {
    const handleRouteChange = () => {
      setSubRoute(getCurrentSubRoute());
    };
    window.addEventListener('popstate', handleRouteChange);
    // 初始設定
    handleRouteChange();
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // 模擬 API 載入
  useEffect(() => {
    setTimeout(() => {
      setSummary({
        overallOEE: 87.3,
        avgYield: 96.2,
        totalOutput: 1256800,
        defectRate: 1.8,
        criticalEquipment: 2,
      });

      setOeeData([
        { id: '1', equipmentName: '射出成型機 #1', availability: 92.5, performance: 95.2, quality: 98.1, oee: 86.4, status: 'good' },
        { id: '2', equipmentName: '射出成型機 #2', availability: 88.3, performance: 91.5, quality: 97.8, oee: 79.0, status: 'warning' },
        { id: '3', equipmentName: 'CNC 加工中心 #1', availability: 95.1, performance: 94.3, quality: 99.2, oee: 88.9, status: 'excellent' },
        { id: '4', equipmentName: 'CNC 加工中心 #2', availability: 78.2, performance: 89.1, quality: 96.5, oee: 67.3, status: 'critical' },
        { id: '5', equipmentName: '包裝線 #1', availability: 94.8, performance: 97.2, quality: 99.5, oee: 91.6, status: 'excellent' },
        { id: '6', equipmentName: '自動組裝線 #1', availability: 91.5, performance: 93.8, quality: 98.7, oee: 84.6, status: 'good' },
      ]);

      setYieldData([
        { id: '1', productName: '產品 A - 外殼件', targetYield: 98, actualYield: 97.8, output: 45000, defectRate: 2.2 },
        { id: '2', productName: '產品 B - 機構件', targetYield: 97, actualYield: 96.5, output: 32000, defectRate: 3.5 },
        { id: '3', productName: '產品 C - 電子件', targetYield: 99, actualYield: 99.2, output: 28000, defectRate: 0.8 },
        { id: '4', productName: '產品 D - 包裝材', targetYield: 99.5, actualYield: 99.1, output: 85000, defectRate: 0.9 },
        { id: '5', productName: '產品 E - 組裝件', targetYield: 96, actualYield: 94.8, output: 18000, defectRate: 5.2 },
      ]);

      setTrendData([
        { name: '1月', oee: 82.5, yield: 94.8 },
        { name: '2月', oee: 84.1, yield: 95.2 },
        { name: '3月', oee: 83.8, yield: 95.0 },
        { name: '4月', oee: 85.6, yield: 95.8 },
        { name: '5月', oee: 86.9, yield: 96.1 },
        { name: '6月', oee: 87.3, yield: 96.2 },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  /** 取得 OEE 狀態顏色 */
  const getStatusColor = (status: OEEData['status']) => {
    switch (status) {
      case 'excellent': return 'var(--success)';
      case 'good': return 'var(--info)';
      case 'warning': return 'var(--warning)';
      case 'critical': return 'var(--danger)';
    }
  };

  /** 取得 OEE 狀態標籤 */
  const getStatusLabel = (status: OEEData['status']) => {
    switch (status) {
      case 'excellent': return '卓越';
      case 'good': return '良好';
      case 'warning': return '警告';
      case 'critical': return '危急';
    }
  };

  /** OEE 趨勢圖配置 */
  const getTrendChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--glass-bg)',
      borderColor: 'var(--glass-border)',
      textStyle: { color: 'var(--text-primary)' },
    },
    legend: {
      data: ['OEE (%)', '良率 (%)'],
      textStyle: { color: 'var(--text-secondary)' },
      top: '5%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
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
        name: 'OEE (%)',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        data: trendData.map(d => d.oee),
      },
      {
        name: '良率 (%)',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#10b981' },
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
        data: trendData.map(d => d.yield),
      },
    ],
  });

  /** OEE 設備分布圖配置 */
  const getOEEGaugeOption = (value: number) => ({
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        itemStyle: {
          color: value >= 85 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444',
        },
        progress: {
          show: true,
          width: 18,
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [[1, 'rgba(255,255,255,0.1)']],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        anchor: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '10%'],
          fontSize: 28,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: 'var(--text-primary)',
        },
        data: [{ value: value }],
      },
    ],
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>載入生產數據中...</p>
      </div>
    );
  }

  /** 根據路由渲染不同頁面 */
  const renderPage = () => {
    switch (subRoute) {
      case 'oee':
        return <OEEDetailPage summary={summary} oeeData={oeeData} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />;
      case 'yield':
      default:
        return <YieldPage summary={summary} yieldData={yieldData} trendData={trendData} getTrendChartOption={getTrendChartOption} getOEEGaugeOption={getOEEGaugeOption} />;
    }
  };

  return (
    <div className="production-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1 style={styles.pageTitle}>🏭 生產與品質分析</h1>
        <p style={styles.pageSubtitle}>掌握設備效率與產品良率趨勢</p>
      </div>
      {renderPage()}
    </div>
  );
};

/** OEE 詳細頁面 */
interface OEEDetailPageProps {
  summary: ProductionSummary;
  oeeData: OEEData[];
  getStatusColor: (status: OEEData['status']) => string;
  getStatusLabel: (status: OEEData['status']) => string;
}
const OEEDetailPage: React.FC<OEEDetailPageProps> = ({ summary, oeeData, getStatusColor, getStatusLabel }) => (
  <>
    {/* KPI 摘要卡 - OEE 重點 */}
    <div className="kpi-grid">
      <div className="glass-panel kpi-card">
        <span className="kpi-label">整體 OEE</span>
        <span className="kpi-value" style={{ color: summary.overallOEE >= 85 ? 'var(--success)' : 'var(--warning)' }}>
          {summary.overallOEE}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>%</span>
        </span>
      </div>
      <div className="glass-panel kpi-card">
        <span className="kpi-label">警告設備</span>
        <span className="kpi-value" style={{ color: summary.criticalEquipment > 0 ? 'var(--danger)' : 'var(--success)' }}>
          {summary.criticalEquipment}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>台</span>
        </span>
      </div>
      <div className="glass-panel kpi-card">
        <span className="kpi-label">總產出</span>
        <span className="kpi-value">
          {(summary.totalOutput / 1000).toFixed(0)}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>K</span>
        </span>
      </div>
      <div className="glass-panel kpi-card">
        <span className="kpi-label">不良率</span>
        <span className="kpi-value" style={{ color: summary.defectRate > 2 ? 'var(--danger)' : 'var(--success)' }}>
          {summary.defectRate}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>%</span>
        </span>
      </div>
    </div>

    {/* OEE 六大損失分析 */}
    <div className="glass-panel">
      <div className="chart-header">
        <h3 style={styles.chartTitle}>📊 OEE 六大損失分析</h3>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>設備名稱</th>
              <th>可用率 (A)</th>
              <th>效能 (P)</th>
              <th>品質 (Q)</th>
              <th>OEE</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {oeeData.map(item => (
              <tr key={item.id}>
                <td>{item.equipmentName}</td>
                <td>{item.availability}%</td>
                <td>{item.performance}%</td>
                <td>{item.quality}%</td>
                <td style={{ fontWeight: 600 }}>{item.oee}%</td>
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

    {/* OEE 等級說明 */}
    <div className="glass-panel">
      <div className="chart-header">
        <h3 style={styles.chartTitle}>🏆 OEE 等級標準</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px' }}>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>85%+</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>世界級</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--info)' }}>70-85%</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>良好</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>60-70%</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>一般</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>60%以下</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>需改善</div>
        </div>
      </div>
    </div>
  </>
);

/** 生產良率頁面 */
interface YieldPageProps {
  summary: ProductionSummary;
  yieldData: YieldData[];
  trendData: { name: string; oee: number; yield: number }[];
  getTrendChartOption: () => any;
  getOEEGaugeOption: (value: number) => any;
}
const YieldPage: React.FC<YieldPageProps> = ({ summary, yieldData, trendData, getTrendChartOption, getOEEGaugeOption }) => (
  <>
    {/* KPI 摘要卡 */}
    <div className="kpi-grid">
      <div className="glass-panel kpi-card">
        <span className="kpi-label">整體 OEE</span>
        <span className="kpi-value" style={{ color: summary.overallOEE >= 85 ? 'var(--success)' : 'var(--warning)' }}>
          {summary.overallOEE}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>%</span>
        </span>
      </div>
      <div className="glass-panel kpi-card">
        <span className="kpi-label">平均良率</span>
        <span className="kpi-value" style={{ color: summary.avgYield >= 95 ? 'var(--success)' : 'var(--warning)' }}>
          {summary.avgYield}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>%</span>
        </span>
      </div>
      <div className="glass-panel kpi-card">
        <span className="kpi-label">總產出</span>
        <span className="kpi-value">
          {(summary.totalOutput / 1000).toFixed(0)}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>K</span>
        </span>
      </div>
      <div className="glass-panel kpi-card">
        <span className="kpi-label">不良率</span>
        <span className="kpi-value" style={{ color: summary.defectRate > 2 ? 'var(--danger)' : 'var(--success)' }}>
          {summary.defectRate}
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>%</span>
        </span>
      </div>
    </div>

    {/* 主內容區 */}
    <div className="main-grid">
      {/* OEE 趨勢圖 */}
      <div className="glass-panel chart-panel">
        <div className="chart-header">
          <h3 style={styles.chartTitle}>📈 OEE 與良率趨勢</h3>
        </div>
        <div className="chart-container" style={{ height: '280px' }}>
          <ReactECharts option={getTrendChartOption()} style={{ height: '100%' }} />
        </div>
      </div>

      {/* 整體 OEE 儀表 */}
      <div className="glass-panel chart-panel">
        <div className="chart-header">
          <h3 style={styles.chartTitle}>⚡ 整體 OEE 指數</h3>
        </div>
        <div className="chart-container" style={{ height: '280px' }}>
          <ReactECharts option={getOEEGaugeOption(summary.overallOEE)} style={{ height: '100%' }} />
        </div>
      </div>
    </div>

    {/* 生產良率表格 */}
    <div className="glass-panel">
      <div className="chart-header">
        <h3 style={styles.chartTitle}>📊 產品良率分析</h3>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>產品名稱</th>
              <th>目標良率</th>
              <th>實際良率</th>
              <th>產出數量</th>
              <th>不良率</th>
              <th>達成</th>
            </tr>
          </thead>
          <tbody>
            {yieldData.map(item => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.targetYield}%</td>
                <td style={{ fontWeight: 600 }}>{item.actualYield}%</td>
                <td>{item.output.toLocaleString()}</td>
                <td style={{ color: item.defectRate > 3 ? 'var(--danger)' : 'inherit' }}>
                  {item.defectRate}%
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: item.actualYield >= item.targetYield ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: item.actualYield >= item.targetYield ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {item.actualYield >= item.targetYield ? '達標' : '未達'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

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
    color: 'var(--warning)',
    fontWeight: 600,
  },
};

export default ProductionPage;
