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
import { useLocation } from 'react-router-dom';
import { useData } from '../../data/DataContext';

/** 從 React Router location 取得生產子頁面 */
const useProductionSubRoute = (): string => {
  const location = useLocation();
  const match = location.pathname.match(/\/production\/(\w+)/);
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
  const subRoute = useProductionSubRoute();
  const { data: ctxData } = useData();
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

  // 從 Context 載入資料
  useEffect(() => {
    const prod = ctxData.production;
    setTimeout(() => {
      setSummary({
        overallOEE: prod.overallOEE,
        avgYield: prod.avgYield,
        totalOutput: prod.totalOutput,
        defectRate: prod.defectRate,
        criticalEquipment: prod.oeeData.filter(e => e.status === 'critical').length,
      });
      setOeeData(prod.oeeData);
      setYieldData(prod.yieldData);

      setTrendData([
        { name: '1月', oee: 82.5, yield: 94.8 },
        { name: '2月', oee: 84.1, yield: 95.2 },
        { name: '3月', oee: 83.8, yield: 95.0 },
        { name: '4月', oee: 85.6, yield: 95.8 },
        { name: '5月', oee: 86.9, yield: 96.1 },
        { name: '6月', oee: prod.overallOEE, yield: prod.avgYield },
      ]);

      setLoading(false);
    }, 400);
  }, [ctxData.production]);

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
      case 'cpk':
        return <CPKPage />;
      case 'quality':
        return <QualityPage />;
      case 'iqc':
        return <IQCPage />;
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

/* ===== 製程能力分析頁面 ===== */
const CPKPage: React.FC = () => {
  const cpkItems = [
    { id: '1', process: '外殼沖壓', param: '孔徑 φ8.0', usl: 8.05, lsl: 7.95, mean: 8.002, sigma: 0.012, cpk: 1.39, status: 'ok' },
    { id: '2', process: '射出成型', param: '壁厚 2.0mm', usl: 2.10, lsl: 1.90, mean: 1.995, sigma: 0.018, cpk: 1.94, status: 'excellent' },
    { id: '3', process: 'SMT 焊接', param: '焊錫高度', usl: 0.35, lsl: 0.15, mean: 0.262, sigma: 0.028, cpk: 1.05, status: 'warn' },
    { id: '4', process: 'CNC 銑削', param: '深度 5.0mm', usl: 5.05, lsl: 4.95, mean: 5.002, sigma: 0.008, cpk: 2.00, status: 'excellent' },
    { id: '5', process: '壓合組裝', param: '壓合力 200N', usl: 220, lsl: 180, mean: 201.5, sigma: 4.8, cpk: 1.28, status: 'ok' },
    { id: '6', process: '點膠製程', param: '膠量 0.5g', usl: 0.56, lsl: 0.44, mean: 0.498, sigma: 0.016, cpk: 1.29, status: 'ok' },
  ];

  const histogramOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['7.95~7.97', '7.97~7.99', '7.99~8.01', '8.01~8.03', '8.03~8.05'], axisLabel: { color: 'var(--text-secondary)', fontSize: 11 }, axisLine: { lineStyle: { color: 'var(--chart-axis)' } } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [{
      type: 'bar', barWidth: '70%',
      data: [8, 24, 58, 29, 11],
      itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: 'rgba(59,130,246,0.3)' }] }, borderRadius: [4, 4, 0, 0] },
    }],
  };

  const getCpkColor = (status: string) => status === 'excellent' ? 'var(--success)' : status === 'ok' ? 'var(--info)' : 'var(--warning)';
  const getCpkLabel = (status: string) => status === 'excellent' ? '卓越 ≥1.67' : status === 'ok' ? '合格 ≥1.33' : '警告 <1.33';

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: '製程合格率', value: '83', unit: '%', color: 'var(--info)' },
          { label: '卓越製程數', value: '2', unit: '項', color: 'var(--success)' },
          { label: '警告製程數', value: '1', unit: '項', color: 'var(--warning)' },
          { label: '平均 Cpk', value: '1.49', unit: '', color: 'var(--text-primary)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📊 孔徑分佈直方圖（射出 #1）</h3></div>
          <div style={{ height: '280px' }}><ReactECharts option={histogramOption} style={{ height: '100%' }} /></div>
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>🏆 Cpk 等級說明</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
            {[{ level: 'Cpk ≥ 1.67', label: '卓越製程', desc: '幾乎無不良品，可考慮放寬規格', color: 'var(--success)' }, { level: '1.33 ≤ Cpk < 1.67', label: '合格製程', desc: '符合製造標準，持續監控', color: 'var(--info)' }, { level: '1.00 ≤ Cpk < 1.33', label: '警告製程', desc: '需要改善，不良風險偏高', color: 'var(--warning)' }, { level: 'Cpk < 1.00', label: '不合格製程', desc: '立即停線改善，禁止出貨', color: 'var(--danger)' }].map(item => (
              <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', border: `1px solid ${item.color}40` }}>
                <div style={{ minWidth: '140px', fontSize: '14px', fontWeight: 700, color: item.color }}>{item.level}</div>
                <div><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📋 製程能力指數總表</h3></div>
        <div className="data-table">
          <table>
            <thead><tr><th>製程名稱</th><th>管制參數</th><th>USL</th><th>LSL</th><th>平均值 (μ)</th><th>標準差 (σ)</th><th>Cpk</th><th>判定</th></tr></thead>
            <tbody>
              {cpkItems.map(item => (
                <tr key={item.id}>
                  <td>{item.process}</td>
                  <td>{item.param}</td>
                  <td>{item.usl}</td>
                  <td>{item.lsl}</td>
                  <td>{item.mean}</td>
                  <td>{item.sigma}</td>
                  <td style={{ fontWeight: 700, color: getCpkColor(item.status) }}>{item.cpk}</td>
                  <td><span className="status-badge" style={{ backgroundColor: `${getCpkColor(item.status)}20`, color: getCpkColor(item.status) }}>{getCpkLabel(item.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ===== 品質異常與停機頁面 ===== */
const QualityPage: React.FC = () => {
  const defectData = [
    { name: '外觀刮傷', count: 128, rate: 32.5, line: 'SMT-01', cost: 45000 },
    { name: '尺寸超差', count: 87, rate: 22.1, line: 'CNC-02', cost: 32000 },
    { name: '焊接不良', count: 64, rate: 16.2, line: 'SMT-02', cost: 28000 },
    { name: '裝配錯誤', count: 45, rate: 11.4, line: 'ASM-01', cost: 18000 },
    { name: '功能異常', count: 38, rate: 9.6, line: 'TEST-01', cost: 52000 },
    { name: '其他', count: 32, rate: 8.1, line: '多線', cost: 12000 },
  ];

  const downtimeData = [
    { equipment: '射出成型 #2', minutes: 185, reason: '模具磨損', date: '03/20' },
    { equipment: 'CNC #4', minutes: 142, reason: '刀具更換', date: '03/21' },
    { equipment: 'SMT-02', minutes: 98, reason: '錫膏問題', date: '03/22' },
    { equipment: '包裝線 #1', minutes: 67, reason: '感應器異常', date: '03/23' },
    { equipment: '自動組裝 #1', minutes: 45, reason: '程式調整', date: '03/24' },
  ];

  const paretoOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['不良數', '累積比例'], textStyle: { color: 'var(--text-secondary)' }, top: '3%' },
    grid: { left: '3%', right: '6%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: defectData.map(d => d.name), axisLabel: { color: 'var(--text-secondary)', fontSize: 11 }, axisLine: { lineStyle: { color: 'var(--chart-axis)' } } },
    yAxis: [
      { type: 'value', name: '不良數', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
      { type: 'value', name: '累積(%)', min: 0, max: 100, axisLabel: { color: 'var(--text-secondary)', formatter: '{value}%' } },
    ],
    series: [
      { name: '不良數', type: 'bar', barWidth: '50%', data: defectData.map(d => d.count), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ef4444' }, { offset: 1, color: 'rgba(239,68,68,0.3)' }] }, borderRadius: [4, 4, 0, 0] } },
      { name: '累積比例', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, data: [32.5, 54.6, 70.8, 82.2, 91.8, 100] },
    ],
  };

  const downtimeOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: (v: number) => `${v}分` }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    yAxis: { type: 'category', data: downtimeData.map(d => d.equipment).reverse(), axisLabel: { color: 'var(--text-secondary)' } },
    series: [{ type: 'bar', barWidth: '50%', data: [...downtimeData.map(d => d.minutes)].reverse(), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.4)' }, { offset: 1, color: '#f59e0b' }] }, borderRadius: [0, 4, 4, 0] } }],
  };

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: '本月不良總數', value: '394', unit: '件', color: 'var(--danger)' },
          { label: '總停機時間', value: '537', unit: '分鐘', color: 'var(--warning)' },
          { label: '不良率', value: '1.8', unit: '%', color: 'var(--warning)' },
          { label: '品質成本', value: '187', unit: 'K', color: 'var(--danger)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📊 不良類型柏拉圖</h3></div>
          <div style={{ height: '280px' }}><ReactECharts option={paretoOption} style={{ height: '100%' }} /></div>
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>⏱ 設備停機時間 (本月 Top5)</h3></div>
          <div style={{ height: '280px' }}><ReactECharts option={downtimeOption} style={{ height: '100%' }} /></div>
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>🔍 不良項目明細</h3>
          <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600 }}>品質成本總計：187K</span>
        </div>
        <div className="data-table">
          <table>
            <thead><tr><th>不良類型</th><th>不良數</th><th>佔比</th><th>主要發生線別</th><th>品質成本</th></tr></thead>
            <tbody>
              {defectData.map((d, i) => (
                <tr key={i}>
                  <td>{d.name}</td>
                  <td style={{ fontWeight: 600 }}>{d.count}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--glass-border)', borderRadius: '3px' }}>
                        <div style={{ width: `${d.rate}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }} />
                      </div>
                      <span>{d.rate}%</span>
                    </div>
                  </td>
                  <td>{d.line}</td>
                  <td>${d.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ===== 三大品質檢驗頁面 ===== */
const IQCPage: React.FC = () => {
  const iqcData = [
    { id: '1', supplier: '供應商 A', material: '電阻 0402', lotNo: 'L240320-01', qty: 50000, sampleQty: 200, defects: 3, aql: 0.65, result: 'pass' },
    { id: '2', supplier: '供應商 C', material: '連接器 24P', lotNo: 'L240320-02', qty: 5000, sampleQty: 80, defects: 0, aql: 1.0, result: 'pass' },
    { id: '3', supplier: '供應商 E', material: 'IC 主控晶片', lotNo: 'L240321-01', qty: 2000, sampleQty: 50, defects: 4, aql: 0.65, result: 'fail' },
    { id: '4', supplier: '供應商 B', material: '包裝紙箱', lotNo: 'L240321-02', qty: 3000, sampleQty: 50, defects: 1, aql: 2.5, result: 'pass' },
    { id: '5', supplier: '供應商 D', material: 'PCB 基板', lotNo: 'L240322-01', qty: 1500, sampleQty: 50, defects: 2, aql: 1.0, result: 'pass' },
  ];

  const ipqcData = [
    { line: 'SMT-01', shift: '早班', time: '08:30', checkItem: '錫膏厚度', standard: '0.15±0.02mm', result: '0.152mm', status: 'pass' },
    { line: 'SMT-01', shift: '早班', time: '10:00', checkItem: '貼片偏移', standard: '≤0.1mm', result: '0.08mm', status: 'pass' },
    { line: 'SMT-02', shift: '早班', time: '09:15', checkItem: '焊錫高度', standard: '0.25±0.05mm', result: '0.31mm', status: 'fail' },
    { line: 'ASM-01', shift: '午班', time: '14:20', checkItem: '螺絲扭力', standard: '1.2±0.2 N·m', result: '1.18 N·m', status: 'pass' },
    { line: 'CNC-02', shift: '午班', time: '15:45', checkItem: '孔徑精度', standard: 'φ8.0±0.05', result: 'φ8.03', status: 'pass' },
  ];

  const oqcData = [
    { order: 'PO-2024-0891', product: '產品 A 型', qty: 5000, sampleQty: 125, defects: 1, criteria: 'AQL 0.65', result: 'pass', date: '03/22' },
    { order: 'PO-2024-0892', product: '產品 B 型', qty: 3200, sampleQty: 80, defects: 0, criteria: 'AQL 1.0', result: 'pass', date: '03/22' },
    { order: 'PO-2024-0893', product: '產品 C 型', qty: 8000, sampleQty: 200, defects: 6, criteria: 'AQL 0.65', result: 'fail', date: '03/23' },
    { order: 'PO-2024-0894', product: '產品 A 型', qty: 4500, sampleQty: 125, defects: 0, criteria: 'AQL 0.65', result: 'pass', date: '03/23' },
  ];

  const passColor = (result: string) => result === 'pass' ? 'var(--success)' : 'var(--danger)';
  const passLabel = (result: string) => result === 'pass' ? '合格' : '不合格';

  const summaryOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['50%', '75%'], center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: true, formatter: '{b}\n{d}%', color: 'var(--text-primary)' },
      data: [
        { value: 18, name: 'IQC 進料', itemStyle: { color: '#3b82f6' } },
        { value: 5, name: 'IPQC 製程', itemStyle: { color: '#10b981' } },
        { value: 7, name: 'OQC 出貨', itemStyle: { color: '#8b5cf6' } },
      ],
    }],
  };

  return (
    <>
      <div className="kpi-grid">
        {[
          { label: 'IQC 進料批數', value: '5', unit: '批', color: 'var(--info)' },
          { label: 'IQC 退貨批數', value: '1', unit: '批', color: 'var(--danger)' },
          { label: 'IPQC 異常點', value: '1', unit: '項', color: 'var(--warning)' },
          { label: 'OQC 出貨批數', value: '4', unit: '批', color: 'var(--info)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📊 品質異常分佈</h3></div>
          <div style={{ height: '260px' }}><ReactECharts option={summaryOption} style={{ height: '100%' }} /></div>
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📖 三大品質說明</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'IQC（進料品質管制）', desc: '原物料進廠時抽樣檢驗，確保原材料符合規格後才允許投入生產', color: '#3b82f6' },
              { name: 'IPQC（製程品質管制）', desc: '生產過程中定期巡迴抽查，即時發現製程異常並立即矯正', color: '#10b981' },
              { name: 'OQC（出貨品質管制）', desc: '成品出貨前最終抽樣驗收，確保出貨品質符合客戶要求', color: '#8b5cf6' },
            ].map(item => (
              <div key={item.name} style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px', borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📦 IQC 進料檢驗記錄</h3></div>
        <div className="data-table">
          <table>
            <thead><tr><th>供應商</th><th>材料</th><th>批號</th><th>進料數量</th><th>抽樣數</th><th>不良數</th><th>AQL</th><th>判定</th></tr></thead>
            <tbody>
              {iqcData.map(d => (
                <tr key={d.id}><td>{d.supplier}</td><td>{d.material}</td><td>{d.lotNo}</td><td>{d.qty.toLocaleString()}</td><td>{d.sampleQty}</td><td style={{ color: d.defects > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{d.defects}</td><td>{d.aql}</td>
                  <td><span className="status-badge" style={{ backgroundColor: `${passColor(d.result)}20`, color: passColor(d.result) }}>{passLabel(d.result)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>🔍 IPQC 製程巡檢記錄</h3></div>
        <div className="data-table">
          <table>
            <thead><tr><th>線別</th><th>班次</th><th>時間</th><th>檢查項目</th><th>標準值</th><th>實測值</th><th>判定</th></tr></thead>
            <tbody>
              {ipqcData.map((d, i) => (
                <tr key={i}><td>{d.line}</td><td>{d.shift}</td><td>{d.time}</td><td>{d.checkItem}</td><td>{d.standard}</td><td style={{ color: d.status === 'fail' ? 'var(--danger)' : 'var(--text-primary)', fontWeight: d.status === 'fail' ? 700 : 400 }}>{d.result}</td>
                  <td><span className="status-badge" style={{ backgroundColor: `${passColor(d.status)}20`, color: passColor(d.status) }}>{passLabel(d.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>🚚 OQC 出貨檢驗記錄</h3></div>
        <div className="data-table">
          <table>
            <thead><tr><th>訂單號</th><th>產品</th><th>出貨數量</th><th>抽樣數</th><th>不良數</th><th>驗收標準</th><th>日期</th><th>判定</th></tr></thead>
            <tbody>
              {oqcData.map((d, i) => (
                <tr key={i}><td>{d.order}</td><td>{d.product}</td><td>{d.qty.toLocaleString()}</td><td>{d.sampleQty}</td><td style={{ color: d.defects > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{d.defects}</td><td>{d.criteria}</td><td>{d.date}</td>
                  <td><span className="status-badge" style={{ backgroundColor: `${passColor(d.result)}20`, color: passColor(d.result) }}>{passLabel(d.result)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ProductionPage;
