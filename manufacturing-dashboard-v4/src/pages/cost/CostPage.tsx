import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

const useCostSubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/cost\/?(.*)$/);
  return match ? (match[1] || 'structure') : 'structure';
};

const cStyles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },
  unit: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  tabBar: { display: 'flex', gap: 8, marginBottom: 24, padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' as const },
  tabBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.15s ease' },
  tabBtnActive: { background: 'var(--accent)', color: 'white' },
};

/* ================================================================
   子頁 1：BOM 成本結構
   ================================================================ */
const BomPage: React.FC = () => {
  const sunburstOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'sunburst',
      radius: ['15%', '80%'],
      data: [
        {
          name: '直接成本', value: 0,
          children: [
            { name: '直接材料', value: 0, children: [
              { name: '電子元件', value: 4200 },
              { name: 'PCB', value: 1800 },
              { name: '被動元件', value: 800 },
              { name: '連接器', value: 600 },
            ]},
            { name: '直接人工', value: 0, children: [
              { name: '生產作業', value: 1200 },
              { name: '品檢', value: 300 },
            ]},
          ],
        },
        {
          name: '間接成本', value: 0,
          children: [
            { name: '製造費用', value: 0, children: [
              { name: '設備折舊', value: 800 },
              { name: '廠房攤提', value: 400 },
              { name: '水電', value: 250 },
            ]},
            { name: '管銷費用', value: 0, children: [
              { name: '行政管理', value: 350 },
              { name: '銷售費用', value: 300 },
            ]},
          ],
        },
      ],
      label: { fontSize: 11 },
      itemStyle: { borderWidth: 2 },
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={cStyles.title}>📋 BOM 成本結構</h1>
        <p style={cStyles.subtitle}>產品物料清單（BOM）成本分解與分析</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '標準成本（每件）', value: '11,000', unit: 'NTD', color: 'var(--text-primary)' },
          { label: '直接材料佔比', value: '76.4%', unit: '', color: 'var(--accent)' },
          { label: '直接人工佔比', value: '13.6%', unit: '', color: 'var(--info)' },
          { label: '製造費用佔比', value: '10.0%', unit: '', color: 'var(--purple)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={cStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={cStyles.chartTitle}>BOM 成本多層分解（旭日圖）</h3></div>
          <ReactECharts option={sunburstOption} style={{ height: '320px' }} />
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={cStyles.chartTitle}>主要料件成本佔比</h3></div>
          <ReactECharts
            option={{
              tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
              grid: { left: '3%', right: '10%', bottom: '3%', top: '5%', containLabel: true },
              xAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: '{value}元' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
              yAxis: { type: 'category', data: ['連接器', '被動元件', '品檢人工', 'PCB 板', '生產人工', '電子元件'], axisLabel: { color: 'var(--text-secondary)', fontSize: 11 } },
              series: [{
                type: 'bar', barWidth: '55%',
                itemStyle: { color: (p: { dataIndex: number }) => ['#8b5cf6', '#8b5cf6', '#10b981', '#3b82f6', '#10b981', '#3b82f6'][p.dataIndex], borderRadius: [0, 4, 4, 0] },
                data: [600, 800, 300, 1800, 1200, 4200],
                label: { show: true, position: 'right', color: 'var(--text-secondary)', fontSize: 11 },
              }],
            }}
            style={{ height: '320px' }}
          />
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={cStyles.chartTitle}>BOM 明細表</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>層級</th><th>料號</th><th>品名規格</th><th>用量</th><th>單位成本</th><th>合計成本</th><th>佔比</th><th>成本類別</th></tr>
            </thead>
            <tbody>
              {[
                { level: 'L1', code: 'M-0021', name: '電阻 470Ω', qty: '8 pcs', unit: 0.72, total: 5.76, pct: 0.05, cat: '直接材料' },
                { level: 'L1', code: 'M-PCB-01', name: 'PCB 主板 V3', qty: '1 片', unit: 1800, total: 1800, pct: 16.4, cat: '直接材料' },
                { level: 'L1', code: 'M-IC-08', name: '主控 IC', qty: '1 顆', unit: 3200, total: 3200, pct: 29.1, cat: '直接材料' },
                { level: 'L1', code: 'M-MOSFET', name: 'MOSFET 模組', qty: '2 顆', unit: 450, total: 900, pct: 8.2, cat: '直接材料' },
                { level: 'L2', code: 'LH-001', name: '生產作業工時', qty: '0.5 hr', unit: 2400, total: 1200, pct: 10.9, cat: '直接人工' },
                { level: 'L2', code: 'LH-002', name: '品質檢驗工時', qty: '0.125 hr', unit: 2400, total: 300, pct: 2.7, cat: '直接人工' },
                { level: 'L3', code: 'OH-001', name: '設備折舊攤提', qty: '1 件', unit: 800, total: 800, pct: 7.3, cat: '製造費用' },
                { level: 'L3', code: 'OH-002', name: '廠房租金攤提', qty: '1 件', unit: 400, total: 400, pct: 3.6, cat: '製造費用' },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{row.level}</td>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.qty}</td>
                  <td>${row.unit.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>${row.total.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent)' }}>{row.pct}%</td>
                  <td><span className={`badge ${row.cat === '直接材料' ? 'badge-info' : row.cat === '直接人工' ? 'badge-success' : 'badge-warning'}`}>{row.cat}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   子頁 2：成本組成結構
   ================================================================ */
const StructurePage: React.FC = () => {
  const trendOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['直接材料', '直接人工', '製造費用', '管銷費用'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1\'25', 'Q2\'25'], axisLabel: { color: 'var(--text-secondary)' } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: '{value}%' }, max: 100, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '直接材料', type: 'bar', stack: 'total', itemStyle: { color: '#3b82f6' }, data: [74, 75, 73, 76, 77, 76] },
      { name: '直接人工', type: 'bar', stack: 'total', itemStyle: { color: '#10b981' }, data: [14, 13, 14, 13, 13, 14] },
      { name: '製造費用', type: 'bar', stack: 'total', itemStyle: { color: '#f59e0b' }, data: [7, 7, 8, 7, 6, 7] },
      { name: '管銷費用', type: 'bar', stack: 'total', itemStyle: { color: '#8b5cf6' }, data: [5, 5, 5, 4, 4, 3] },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={cStyles.title}>📊 成本組成結構</h1>
        <p style={cStyles.subtitle}>追蹤各成本要素佔比趨勢與結構變化</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '月度總成本', value: '38.5M', unit: 'NTD', color: 'var(--text-primary)' },
          { label: '材料成本佔比', value: '76.4%', unit: '', color: 'var(--accent)' },
          { label: '毛利率', value: '24.8%', unit: '', color: 'var(--success)' },
          { label: 'vs 去年同期', value: '+1.2pp', unit: '', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={cStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={cStyles.chartTitle}>成本結構季度趨勢（堆疊百分比）</h3></div>
        <ReactECharts option={trendOption} style={{ height: '300px' }} />
      </div>
    </div>
  );
};

/* ================================================================
   子頁 3：成本差異追蹤
   ================================================================ */
const VariancePage: React.FC = () => {
  const waterfallData = [
    { name: '標準成本', value: 11000, type: 'base' },
    { name: '材料用量差異', value: -320, type: 'neg' },
    { name: '材料價格差異', value: 180, type: 'pos' },
    { name: '人工效率差異', value: -150, type: 'neg' },
    { name: '製費分攤差異', value: 80, type: 'pos' },
    { name: '良率損失', value: 210, type: 'pos' },
    { name: '實際成本', value: 11000, type: 'total' },
  ];

  const actualTotal = 11000 - 320 + 180 - 150 + 80 + 210;

  return (
    <div>
      <div className="page-header">
        <h1 style={cStyles.title}>📉 成本差異追蹤</h1>
        <p style={cStyles.subtitle}>標準成本 vs 實際成本差異分析，找出成本超支根因</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '標準成本（件）', value: '11,000', unit: '元', color: 'var(--text-primary)' },
          { label: '實際成本（件）', value: actualTotal.toLocaleString(), unit: '元', color: actualTotal > 11000 ? 'var(--danger)' : 'var(--success)' },
          { label: '成本差異', value: `+${(actualTotal - 11000).toLocaleString()}`, unit: '元', color: 'var(--danger)' },
          { label: '差異率', value: `${((actualTotal - 11000) / 11000 * 100).toFixed(1)}%`, unit: '', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={cStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={cStyles.chartTitle}>成本差異瀑布圖（元/件）</h3></div>
        <div style={{ padding: '16px 0' }}>
          {waterfallData.map((item, i) => {
            const isBase = item.type === 'base';
            const isTotal = item.type === 'total';
            const isNeg = item.type === 'neg';
            const displayVal = isTotal ? actualTotal : Math.abs(item.value);
            const barWidth = Math.min(Math.abs(item.value) / 11000 * 100, 100);
            const totalBarWidth = actualTotal / 11000 * 100;
            const color = isBase || isTotal ? 'var(--accent)' : isNeg ? 'var(--danger)' : 'var(--success)';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 140, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{item.name}</div>
                <div style={{ flex: 1, height: 28, background: 'var(--glass-border)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${isTotal ? totalBarWidth : barWidth}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease', opacity: 0.85 }} />
                </div>
                <div style={{ width: 90, fontWeight: 700, color, fontSize: 14, textAlign: 'right' }}>
                  {isBase || isTotal ? `${displayVal.toLocaleString()}` : `${isNeg ? '-' : '+'}${displayVal.toLocaleString()}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={cStyles.chartTitle}>差異明細分析</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>差異類型</th><th>差異金額（元/件）</th><th>差異方向</th><th>主要原因</th><th>責任部門</th><th>改善措施</th></tr>
            </thead>
            <tbody>
              {[
                { type: '材料用量差異', amt: -320, reason: '製程報廢率 2.8%（標準 2.0%）', dept: '生產', action: '改善生產製程，降低報廢' },
                { type: '材料價格差異', amt: +180, reason: '電子元件漲價 2.1%', dept: '採購', action: '尋找替代供應商' },
                { type: '人工效率差異', amt: -150, reason: '換線時間增加、設備故障', dept: '生產', action: '導入 SMED 快速換線' },
                { type: '製費分攤差異', amt: +80, reason: '產能利用率提升（88% vs 85%）', dept: '工程', action: '維持現有產能水準' },
                { type: '良率損失', amt: +210, reason: 'IQC 不良品轉換損耗', dept: '品管', action: '加強進料管制標準' },
              ].map(row => (
                <tr key={row.type}>
                  <td style={{ fontWeight: 600 }}>{row.type}</td>
                  <td style={{ color: row.amt < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>{row.amt > 0 ? '+' : ''}{row.amt}</td>
                  <td><span className={`badge ${row.amt < 0 ? 'badge-danger' : 'badge-success'}`}>{row.amt < 0 ? '不利差異' : '有利差異'}</span></td>
                  <td style={{ fontSize: 13 }}>{row.reason}</td>
                  <td>{row.dept}</td>
                  <td style={{ fontSize: 13 }}>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   子頁 4：成本優化建議
   ================================================================ */
const CostOptimizePage: React.FC = () => {
  const opportunities = [
    { title: '電子元件多源採購', cat: '材料降本', potential: 480000, effort: '中', timeline: '3 個月', priority: 'high', desc: '目前 M-IC-08 主控 IC 僅有單一供應商，導入備援供應商後可議價 8-12%，同時降低斷料風險。' },
    { title: '製程良率提升計畫', cat: '損耗降低', potential: 650000, effort: '高', timeline: '6 個月', priority: 'high', desc: '當前報廢率 2.8% 高於標準 2.0%，透過 SPC 管制與操作員培訓，目標降至 2.2%，年節省約 65 萬。' },
    { title: 'SMED 快速換線導入', cat: '人工效率', potential: 320000, effort: '中', timeline: '4 個月', priority: 'medium', desc: '換線時間由 45 分鐘縮短至 25 分鐘，可增加有效生產時間 15%，直接降低製造費用分攤。' },
    { title: '包裝材料規格標準化', cat: '材料降本', potential: 180000, effort: '低', timeline: '2 個月', priority: 'medium', desc: '目前有 8 種包裝規格，整合至 3 種標準規格，採購量集中可議價 10%，並降低管理複雜度。' },
  ];

  const priorityColor = (p: string) => p === 'high' ? 'var(--danger)' : 'var(--warning)';

  return (
    <div>
      <div className="page-header">
        <h1 style={cStyles.title}>💡 成本優化建議</h1>
        <p style={cStyles.subtitle}>基於成本分析的優化機會識別與行動方案</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '年度潛在節省', value: '1.63M', unit: 'NTD', color: 'var(--success)' },
          { label: '優化項目數', value: '4', unit: '項', color: 'var(--accent)' },
          { label: '高優先項目', value: '2', unit: '項', color: 'var(--danger)' },
          { label: '平均執行週期', value: '3.75', unit: '個月', color: 'var(--text-primary)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={cStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {opportunities.map((op, i) => {
          const pc = priorityColor(op.priority);
          return (
            <div key={i} className="glass-panel" style={{ borderLeft: `4px solid ${pc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: pc }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{op.title}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span className="badge badge-info">{op.cat}</span>
                      <span className="badge badge-warning">執行難度：{op.effort}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>${(op.potential / 10000).toFixed(0)}萬</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>年度節省潛力</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{op.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--glass-border)', fontSize: 13 }}>
                <span style={{ color: 'var(--accent)' }}>⏱️ 執行週期：{op.timeline}</span>
                <span className="badge" style={{ background: `${pc}20`, color: pc }}>{op.priority === 'high' ? '高優先' : '中優先'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================================================================
   主頁面
   ================================================================ */
const subTabs = [
  { key: 'bom', label: 'BOM 成本結構', path: '/cost/bom' },
  { key: 'structure', label: '成本組成結構', path: '/cost/structure' },
  { key: 'variance', label: '成本差異追蹤', path: '/cost/variance' },
  { key: 'optimize', label: '成本優化建議', path: '/cost/optimize' },
];

const CostPage: React.FC = () => {
  const subRoute = useCostSubRoute();
  const navigate = useNavigate();

  const renderPage = () => {
    switch (subRoute) {
      case 'bom': return <BomPage />;
      case 'structure': return <StructurePage />;
      case 'variance': return <VariancePage />;
      case 'optimize': return <CostOptimizePage />;
      default: return <StructurePage />;
    }
  };

  return (
    <div>
      <div style={cStyles.tabBar}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button key={tab.key} onClick={() => navigate(tab.path)} style={{ ...cStyles.tabBtn, ...(active ? cStyles.tabBtnActive : {}) }}>
              {tab.label}
            </button>
          );
        })}
      </div>
      {renderPage()}
    </div>
  );
};

export default CostPage;
