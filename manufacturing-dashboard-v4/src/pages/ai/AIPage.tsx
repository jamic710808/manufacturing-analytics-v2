import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

const useAISubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/ai\/?(.*)$/);
  return match ? (match[1] || 'anomaly') : 'anomaly';
};

const aiStyles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },
  unit: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  tabBar: { display: 'flex', gap: 8, marginBottom: 24, padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' as const },
  tabBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.15s ease' },
  tabBtnActive: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' },
};

/* ================================================================
   子頁 1：異常偵測
   ================================================================ */
const AnomalyPage: React.FC = () => {
  const timeSeriesOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['實際值', '預測上限', '預測下限', '異常點'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['09:00', '09:10', '09:20', '09:30', '09:40', '09:50', '10:00', '10:10', '10:20', '10:30', '10:40', '10:50', '11:00'], axisLabel: { color: 'var(--text-secondary)', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '實際值', type: 'line', smooth: true, itemStyle: { color: '#3b82f6' }, lineStyle: { width: 2 }, data: [85.2, 86.1, 87.3, 88.2, 86.8, 87.5, 92.1, 95.8, 89.2, 87.4, 86.9, 87.8, 88.1] },
      { name: '預測上限', type: 'line', smooth: true, lineStyle: { type: 'dashed', color: '#f59e0b', width: 1 }, itemStyle: { color: '#f59e0b' }, data: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90], symbol: 'none' },
      { name: '預測下限', type: 'line', smooth: true, lineStyle: { type: 'dashed', color: '#10b981', width: 1 }, itemStyle: { color: '#10b981' }, data: [82, 82, 82, 82, 82, 82, 82, 82, 82, 82, 82, 82, 82], symbol: 'none' },
      { name: '異常點', type: 'scatter', symbolSize: 14, itemStyle: { color: '#ef4444' }, data: [[6, 92.1], [7, 95.8]] },
    ],
  };

  const anomalies = [
    { id: 'ANO-001', time: '10:00', machine: '設備 #3 沖壓機', metric: 'OEE', value: 92.1, expected: '82-90', severity: 'medium', type: '效率突升', status: '確認中' },
    { id: 'ANO-002', time: '10:10', machine: '設備 #3 沖壓機', metric: 'OEE', value: 95.8, expected: '82-90', severity: 'high', type: '效率異常', status: '待確認' },
    { id: 'ANO-003', time: '08:45', machine: '設備 #7 焊接機', metric: '溫度', value: 285, expected: '240-270', severity: 'critical', type: '溫度超標', status: '已處理' },
    { id: 'ANO-004', time: '07:30', machine: '原料倉 A', metric: '庫存量', value: 195, expected: '500+', severity: 'high', type: '庫存偏低', status: '已派單' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 style={aiStyles.title}>🤖 異常偵測</h1>
        <p style={aiStyles.subtitle}>基於統計管制的多維度異常偵測，即時識別生產、設備、庫存異常</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '今日偵測異常', value: '4', unit: '件', color: 'var(--danger)' },
          { label: '模型偵測準確率', value: '94.2%', unit: '', color: 'var(--success)' },
          { label: '平均響應時間', value: '3.2', unit: '分鐘', color: 'var(--warning)' },
          { label: '誤報率', value: '2.1%', unit: '', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={aiStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header">
          <h3 style={aiStyles.chartTitle}>設備 #3 OEE 時序監控（含異常偵測）</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>管制帶：82% ~ 90%</span>
        </div>
        <ReactECharts option={timeSeriesOption} style={{ height: '260px' }} />
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={aiStyles.chartTitle}>今日異常事件清單</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>事件 ID</th><th>時間</th><th>設備/來源</th><th>監控指標</th><th>實際值</th><th>正常範圍</th><th>嚴重度</th><th>異常類型</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {anomalies.map(a => {
                const sc = a.severity === 'critical' ? 'var(--danger)' : a.severity === 'high' ? '#f97316' : 'var(--warning)';
                return (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.id}</td>
                    <td>{a.time}</td>
                    <td>{a.machine}</td>
                    <td>{a.metric}</td>
                    <td style={{ color: sc, fontWeight: 700 }}>{a.value}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.expected}</td>
                    <td><span className="status-badge" style={{ background: `${sc}20`, color: sc }}>{a.severity === 'critical' ? '緊急' : a.severity === 'high' ? '高' : '中'}</span></td>
                    <td>{a.type}</td>
                    <td><span className={`badge ${a.status === '已處理' || a.status === '已派單' ? 'badge-success' : a.status === '確認中' ? 'badge-info' : 'badge-warning'}`}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   子頁 2：需求預測
   ================================================================ */
const ForecastPage: React.FC = () => {
  const forecastOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['歷史需求', '預測需求', '預測區間上限', '預測區間下限'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['10月', '11月', '12月', '1月', '2月', '3月', '4月↑', '5月↑', '6月↑'], axisLabel: { color: (v: string) => v.includes('↑') ? '#8b5cf6' : 'var(--text-secondary)', fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '歷史需求', type: 'bar', barWidth: '35%', itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: [1250, 1380, 1520, 1180, 1290, 1420, null, null, null] },
      { name: '預測需求', type: 'line', smooth: true, itemStyle: { color: '#8b5cf6' }, lineStyle: { width: 3, type: 'dashed' }, symbol: 'circle', symbolSize: 8, data: [null, null, null, null, null, 1420, 1580, 1650, 1720] },
      { name: '預測區間上限', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dotted', color: 'rgba(139,92,246,0.4)', width: 1 }, data: [null, null, null, null, null, 1420, 1680, 1780, 1880] },
      { name: '預測區間下限', type: 'line', smooth: true, symbol: 'none', lineStyle: { type: 'dotted', color: 'rgba(139,92,246,0.4)', width: 1 }, data: [null, null, null, null, null, 1420, 1480, 1520, 1560] },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={aiStyles.title}>📈 需求預測</h1>
        <p style={aiStyles.subtitle}>基於時序分析的需求預測，輔助庫存規劃與採購決策</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '下月預測需求', value: '1,580', unit: '件', color: 'var(--purple)' },
          { label: '預測準確率（MAPE）', value: '8.3%', unit: '', color: 'var(--success)' },
          { label: '預測信賴區間', value: '±6.3%', unit: '', color: 'var(--text-primary)' },
          { label: 'Q2 季度預測', value: '4,950', unit: '件', color: 'var(--accent)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={aiStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header">
          <h3 style={aiStyles.chartTitle}>需求預測趨勢（帶預測區間）</h3>
          <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>↑ 箭頭為預測期間</span>
        </div>
        <ReactECharts option={forecastOption} style={{ height: '300px' }} />
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={aiStyles.chartTitle}>物料需求預測表</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>料號</th><th>品名</th><th>當前庫存</th><th>下月預測需求</th><th>建議採購量</th><th>採購時機</th><th>信賴度</th></tr>
            </thead>
            <tbody>
              {[
                { code: 'M-IC-08', name: '主控 IC', stock: 380, forecast: 1580, lead: 14, ss: 500, conf: 92 },
                { code: 'M-PCB-01', name: 'PCB 主板', stock: 220, forecast: 1580, lead: 10, ss: 300, conf: 88 },
                { code: 'M-0021', name: '電阻 470Ω', stock: 12000, forecast: 12640, lead: 7, ss: 8000, conf: 95 },
                { code: 'W-0033', name: '標準包裝盒', stock: 1650, forecast: 1580, lead: 5, ss: 800, conf: 96 },
              ].map(row => {
                const needed = Math.max(0, row.forecast + row.ss - row.stock);
                const urgent = row.stock < row.ss;
                return (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ color: urgent ? 'var(--danger)' : 'var(--text-primary)', fontWeight: urgent ? 700 : 400 }}>{row.stock.toLocaleString()}</td>
                    <td style={{ color: 'var(--purple)', fontWeight: 600 }}>{row.forecast.toLocaleString()}</td>
                    <td style={{ color: needed > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{needed > 0 ? `+${needed.toLocaleString()}` : '充足'}</td>
                    <td style={{ color: urgent ? 'var(--danger)' : 'var(--text-secondary)' }}>{urgent ? '立即採購' : `${row.lead} 天前`}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--glass-border)', borderRadius: 3 }}>
                          <div style={{ width: `${row.conf}%`, height: '100%', background: 'var(--purple)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>{row.conf}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   子頁 3：AI 智能建議
   ================================================================ */
const RecommendPage: React.FC = () => {
  const recommendations = [
    {
      id: 'REC-001', type: '庫存優化', confidence: 94, priority: 'high',
      title: '建議提前採購電阻 470Ω（M-0021）',
      insight: '根據近 6 個月需求趨勢分析，M-0021 下月需求預測為 12,640 件，當前庫存 12,000 件低於安全庫存水位。結合供應商 OTD 歷史（平均 7 天前置），建議本週發出採購單。',
      action: '發出 PO，數量建議 8,000 件，預算約 $5,760',
      impact: '避免斷料風險，預計節省停工損失 $120,000',
    },
    {
      id: 'REC-002', type: '設備維護', confidence: 87, priority: 'high',
      title: '設備 #7 焊接機預測性維護提醒',
      insight: '根據設備溫度趨勢（近 7 天偏高 8%）及振動頻率分析，預測設備 #7 在未來 14 天內發生故障的機率為 73%。建議排定預防性保養。',
      action: '安排本週末（3/29-3/30）停機保養，預估 4 小時',
      impact: '避免非計劃停機損失（約 $48,000/次），保養成本 $8,000',
    },
    {
      id: 'REC-003', type: '採購優化', confidence: 91, priority: 'medium',
      title: '供應商 A 框架合約議價機會',
      insight: '供應商 A 近 3 個月採購金額 $8.4M，超過框架合約觸發量折門檻。同類型競品供應商報價比現有合約低 7-9%，建議啟動年度議價。',
      action: '安排與供應商 A 召開議價會議，目標降幅 6%',
      impact: '年度節省潛力約 $504,000',
    },
    {
      id: 'REC-004', type: '品質改善', confidence: 82, priority: 'medium',
      title: '製程 #5 銅箔蝕刻 Cpk 下降根因分析',
      insight: '系統偵測到製程 #5 Cpk 由 1.45 降至 1.18，趨勢分析顯示溫度控制器精準度下降（±3°C vs 規格±1.5°C）可能是主因。',
      action: '校正溫度控制器，同時進行 24 小時連續監測',
      impact: '恢復 Cpk≥1.33，避免客訴與重工損失',
    },
  ];

  const priorityColor = (p: string) => p === 'high' ? 'var(--danger)' : 'var(--warning)';
  const typeColors: Record<string, string> = { '庫存優化': 'var(--accent)', '設備維護': 'var(--warning)', '採購優化': 'var(--success)', '品質改善': 'var(--info)' };

  return (
    <div>
      <div className="page-header">
        <h1 style={aiStyles.title}>💡 AI 智能建議</h1>
        <p style={aiStyles.subtitle}>基於多維度數據分析的主動式智能建議，協助優化決策</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '本週 AI 建議', value: '4', unit: '項', color: 'var(--purple)' },
          { label: '平均信賴度', value: '88.5%', unit: '', color: 'var(--success)' },
          { label: '建議採納率', value: '76%', unit: '', color: 'var(--accent)' },
          { label: '採納後節省', value: '2.1M', unit: 'NTD', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={aiStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recommendations.map(rec => {
          const pc = priorityColor(rec.priority);
          const tc = typeColors[rec.type] ?? 'var(--accent)';
          return (
            <div key={rec.id} className="glass-panel" style={{ borderLeft: `4px solid ${tc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: `${tc}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {rec.type === '庫存優化' ? '📦' : rec.type === '設備維護' ? '🔧' : rec.type === '採購優化' ? '🛒' : '📊'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span className="badge" style={{ background: `${tc}20`, color: tc }}>{rec.type}</span>
                      <span className="badge" style={{ background: `${pc}20`, color: pc }}>{rec.priority === 'high' ? '高優先' : '中優先'}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{rec.title}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: rec.confidence >= 90 ? 'var(--success)' : 'var(--warning)' }}>{rec.confidence}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>信賴度</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{rec.insight}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>📋 建議行動：</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>{rec.action}</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>💰 預期效益：</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>{rec.impact}</span>
                </div>
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
  { key: 'anomaly', label: '異常偵測', path: '/ai/anomaly' },
  { key: 'forecast', label: '需求預測', path: '/ai/forecast' },
  { key: 'recommend', label: 'AI 智能建議', path: '/ai/recommend' },
];

const AIPage: React.FC = () => {
  const subRoute = useAISubRoute();
  const navigate = useNavigate();

  const renderPage = () => {
    switch (subRoute) {
      case 'anomaly': return <AnomalyPage />;
      case 'forecast': return <ForecastPage />;
      case 'recommend': return <RecommendPage />;
      default: return <AnomalyPage />;
    }
  };

  return (
    <div>
      <div style={{ ...aiStyles.tabBar, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', borderColor: 'rgba(139,92,246,0.2)' }}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button key={tab.key} onClick={() => navigate(tab.path)} style={{ ...aiStyles.tabBtn, ...(active ? aiStyles.tabBtnActive : {}) }}>
              {tab.label}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--purple)', fontWeight: 600, alignSelf: 'center' }}>⚡ AI POWERED</span>
      </div>
      {renderPage()}
    </div>
  );
};

export default AIPage;
