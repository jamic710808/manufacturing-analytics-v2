import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

const useProcurementSubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/procurement\/?(.*)$/);
  return match ? (match[1] || 'spend') : 'spend';
};

const pStyles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },
  unit: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  tabBar: { display: 'flex', gap: 8, marginBottom: 24, padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' as const },
  tabBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.15s ease' },
  tabBtnActive: { background: 'var(--accent)', color: 'white' },
};

/* ================================================================
   子頁 1：採購支出分析
   ================================================================ */
const SpendPage: React.FC = () => {
  const trendOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['採購金額', '預算'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLabel: { color: 'var(--text-secondary)' } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: (v: number) => `${(v / 1e6).toFixed(1)}M` }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '採購金額', type: 'bar', barWidth: '35%', itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: [7200000, 6800000, 7500000, 8100000, 7800000, 8280000] },
      { name: '預算', type: 'line', smooth: true, itemStyle: { color: '#f59e0b' }, lineStyle: { width: 2, type: 'dashed' }, data: [7500000, 7500000, 7500000, 8000000, 8000000, 8000000] },
    ],
  };

  const categoryOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: 'var(--text-secondary)' } },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['38%', '50%'],
      itemStyle: { borderRadius: 6 },
      label: { show: true, formatter: '{b}\n{d}%', color: 'var(--text-primary)', fontSize: 11 },
      data: [
        { name: '電子原料', value: 18500000 },
        { name: '包裝材料', value: 9200000 },
        { name: '生產設備', value: 6800000 },
        { name: '間接物料', value: 5800000 },
        { name: '物流服務', value: 5380000 },
      ],
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={pStyles.title}>💰 採購支出分析</h1>
        <p style={pStyles.subtitle}>掌握採購支出結構、預算執行率與品類分布</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '年度採購總額', value: '45.7M', unit: 'NTD', color: 'var(--text-primary)' },
          { label: '預算執行率', value: '96.2%', unit: '', color: 'var(--success)' },
          { label: '活躍供應商', value: '156', unit: '家', color: 'var(--text-primary)' },
          { label: '待處理 PO', value: '28', unit: '筆', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pStyles.chartTitle}>月度採購金額 vs 預算</h3></div>
          <ReactECharts option={trendOption} style={{ height: '280px' }} />
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pStyles.chartTitle}>採購品類分布</h3></div>
          <ReactECharts option={categoryOption} style={{ height: '280px' }} />
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={pStyles.chartTitle}>品類支出明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>品類</th><th>H1 採購額</th><th>年度預算</th><th>執行率</th><th>供應商數</th><th>主要供應商</th></tr>
            </thead>
            <tbody>
              {[
                { cat: '電子原料', amount: 18500000, budget: 20000000, suppliers: 42, top: '供應商 A' },
                { cat: '包裝材料', amount: 9200000, budget: 9000000, suppliers: 28, top: '供應商 B' },
                { cat: '生產設備', amount: 6800000, budget: 8000000, suppliers: 15, top: '供應商 F' },
                { cat: '間接物料', amount: 5800000, budget: 6000000, suppliers: 38, top: '供應商 G' },
                { cat: '物流服務', amount: 5380000, budget: 5500000, suppliers: 33, top: '供應商 E' },
              ].map(row => {
                const rate = Math.round(row.amount / row.budget * 100);
                const rateColor = rate > 100 ? 'var(--danger)' : rate > 90 ? 'var(--success)' : 'var(--warning)';
                return (
                  <tr key={row.cat}>
                    <td>{row.cat}</td>
                    <td>${(row.amount / 1e6).toFixed(2)}M</td>
                    <td>${(row.budget / 1e6).toFixed(2)}M</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--glass-border)', borderRadius: 3 }}>
                          <div style={{ width: `${Math.min(rate, 100)}%`, height: '100%', background: rateColor, borderRadius: 3 }} />
                        </div>
                        <span style={{ color: rateColor, fontWeight: 600, width: 40 }}>{rate}%</span>
                      </div>
                    </td>
                    <td>{row.suppliers}</td>
                    <td>{row.top}</td>
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
   子頁 2：價格與降本
   ================================================================ */
const PricePage: React.FC = () => {
  const savingsOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLabel: { color: 'var(--text-secondary)' } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: (v: number) => `${(v / 1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [{
      name: '降本金額', type: 'bar', barWidth: '50%',
      itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: 'rgba(16,185,129,0.3)' }] }, borderRadius: [4, 4, 0, 0] },
      data: [125000, 98000, 142000, 168000, 155000, 188000],
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={pStyles.title}>📉 價格與降本</h1>
        <p style={pStyles.subtitle}>追蹤採購價格趨勢、議價成效與降本達成率</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: 'H1 降本金額', value: '876K', unit: 'NTD', color: 'var(--success)' },
          { label: '降本率', value: '1.9%', unit: '', color: 'var(--success)' },
          { label: '年度降本目標', value: '1.5M', unit: 'NTD', color: 'var(--text-primary)' },
          { label: '目標達成率', value: '58.4%', unit: '', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={pStyles.chartTitle}>月度降本金額（元）</h3></div>
        <ReactECharts option={savingsOption} style={{ height: '250px' }} />
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={pStyles.chartTitle}>主要降本項目明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>料號</th><th>品名</th><th>原始單價</th><th>議價後單價</th><th>降幅</th><th>年採購量</th><th>年度節省</th><th>議價方式</th></tr>
            </thead>
            <tbody>
              {[
                { code: 'M-0021', name: '電阻 470Ω', orig: 0.85, new: 0.72, qty: 500000, method: '競標' },
                { code: 'P-0112', name: 'PCB 空板 V3', orig: 285, new: 258, qty: 2400, method: '長約協議' },
                { code: 'W-0033', name: '標準包裝盒', orig: 8.5, new: 7.8, qty: 120000, method: '量價協議' },
                { code: 'M-0055', name: '散熱膏', orig: 320, new: 295, qty: 800, method: '替代品導入' },
                { code: 'M-0088', name: '導電膠帶', orig: 45, new: 41, qty: 6000, method: '多源競價' },
              ].map(row => {
                const pct = ((row.orig - row.new) / row.orig * 100).toFixed(1);
                const saving = Math.round((row.orig - row.new) * row.qty);
                return (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td>${row.orig}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>${row.new}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>▼ {pct}%</td>
                    <td>{row.qty.toLocaleString()}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>${saving.toLocaleString()}</td>
                    <td><span className="badge badge-info">{row.method}</span></td>
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
   子頁 3：採購時效與交期
   ================================================================ */
const DeliveryPage: React.FC = () => {
  const otdOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['OTD 達成率', '目標線'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLabel: { color: 'var(--text-secondary)' } },
    yAxis: { type: 'value', min: 85, max: 100, axisLabel: { color: 'var(--text-secondary)', formatter: '{value}%' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: 'OTD 達成率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#3b82f6' }, lineStyle: { width: 3 }, data: [92.1, 93.5, 91.8, 94.2, 95.1, 94.2] },
      { name: '目標線', type: 'line', symbol: 'none', lineStyle: { type: 'dashed', color: '#f59e0b', width: 2 }, data: [95, 95, 95, 95, 95, 95] },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={pStyles.title}>🚚 採購時效與交期</h1>
        <p style={pStyles.subtitle}>監控交期達成率（OTD）、前置時間與延遲訂單分析</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: 'H1 OTD 達成率', value: '94.2%', unit: '', color: 'var(--warning)' },
          { label: '平均前置時間', value: '12', unit: '天', color: 'var(--text-primary)' },
          { label: '延遲 PO 數', value: '14', unit: '筆', color: 'var(--danger)' },
          { label: '平均延遲天數', value: '3.2', unit: '天', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={pStyles.chartTitle}>月度 OTD 達成率趨勢</h3></div>
        <ReactECharts option={otdOption} style={{ height: '250px' }} />
      </div>
      <div className="glass-panel">
        <div className="chart-header">
          <h3 style={pStyles.chartTitle}>延遲 PO 明細</h3>
          <span className="badge badge-danger">共 14 筆</span>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>PO 編號</th><th>供應商</th><th>品名</th><th>承諾交期</th><th>預計到貨</th><th>延遲天數</th><th>延遲原因</th><th>影響生產</th></tr>
            </thead>
            <tbody>
              {[
                { po: 'PO-2025-0312', supplier: '供應商 C', item: 'PCB 空板 V3', promise: '2025-03-18', eta: '2025-03-22', delay: 4, reason: '原料短缺', impact: true },
                { po: 'PO-2025-0298', supplier: '供應商 D', item: '散熱模組 H2', promise: '2025-03-15', eta: '2025-03-20', delay: 5, reason: '運輸延誤', impact: true },
                { po: 'PO-2025-0287', supplier: '供應商 G', item: '標準包裝盒', promise: '2025-03-10', eta: '2025-03-13', delay: 3, reason: '產能不足', impact: false },
                { po: 'PO-2025-0275', supplier: '供應商 B', item: '導電膠帶 5mm', promise: '2025-03-08', eta: '2025-03-10', delay: 2, reason: '品檢重工', impact: false },
              ].map(row => (
                <tr key={row.po}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.po}</td>
                  <td>{row.supplier}</td>
                  <td>{row.item}</td>
                  <td>{row.promise}</td>
                  <td style={{ color: 'var(--danger)' }}>{row.eta}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 700 }}>+{row.delay} 天</td>
                  <td><span className="badge badge-warning">{row.reason}</span></td>
                  <td>
                    <span className={`badge ${row.impact ? 'badge-danger' : 'badge-success'}`}>
                      {row.impact ? '有影響' : '無影響'}
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

/* ================================================================
   子頁 4：採購優化建議
   ================================================================ */
const OptimizePage: React.FC = () => {
  const recommendations = [
    {
      title: '電子原料：導入框架合約',
      category: '策略優化', priority: 'high',
      saving: '約 850,000 元/年',
      desc: '對年採購額超過 200 萬的電子原料品項（M-0021、M-0033 等）簽訂 12 個月框架合約，鎖定價格並享量折優惠。',
      action: '安排與供應商 A、C 進行框架協議談判',
    },
    {
      title: '包裝材料：合併採購優化',
      category: '流程優化', priority: 'high',
      saving: '約 420,000 元/年',
      desc: '目前包裝材料分散 28 家供應商採購，建議整合至 5 家優質供應商，提高議價能力並降低管理成本。',
      action: '執行供應商整合評估，目標 6 個月完成',
    },
    {
      title: '採購前置時間：建立安全庫存緩衝',
      category: '風險管控', priority: 'medium',
      saving: '降低停工損失 ~1,200,000 元/年',
      desc: '針對 OTD 達成率低於 93% 的供應商品項，建議額外增加 1 週安全庫存，降低延遲交貨對生產線的衝擊。',
      action: '更新 5 項關鍵物料的安全庫存參數',
    },
    {
      title: '供應商 C：績效改善計畫',
      category: '供應商管理', priority: 'medium',
      saving: '避免品質損失 ~350,000 元/年',
      desc: '供應商 C 近 3 個月 OTD 達成率僅 88.2%，低於合約要求 95%。建議啟動供應商改善計畫（SIP），設定 90 天改善期限。',
      action: '發出正式 SIP 通知，每週進度追蹤',
    },
  ];

  const priorityColor = (p: string) => p === 'high' ? 'var(--danger)' : p === 'medium' ? 'var(--warning)' : 'var(--info)';

  return (
    <div>
      <div className="page-header">
        <h1 style={pStyles.title}>💡 採購優化建議</h1>
        <p style={pStyles.subtitle}>基於數據分析的採購策略改善建議與行動計畫</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '潛在年度節省', value: '2.8M', unit: 'NTD', color: 'var(--success)' },
          { label: '優化建議數', value: '4', unit: '項', color: 'var(--accent)' },
          { label: '高優先項目', value: '2', unit: '項', color: 'var(--danger)' },
          { label: '預估 ROI', value: '380%', unit: '', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recommendations.map((rec, i) => {
          const pc = priorityColor(rec.priority);
          return (
            <div key={i} className="glass-panel" style={{ borderLeft: `4px solid ${pc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: pc }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{rec.title}</div>
                    <span className="badge badge-info" style={{ marginTop: 4 }}>{rec.category}</span>
                  </div>
                </div>
                <span className="badge" style={{ background: `${pc}20`, color: pc, textTransform: 'uppercase' }}>
                  {rec.priority === 'high' ? '高優先' : rec.priority === 'medium' ? '中優先' : '一般'}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>{rec.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>💰 預估節省：{rec.saving}</div>
                <div style={{ fontSize: 13, color: 'var(--accent)' }}>📋 行動：{rec.action}</div>
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
  { key: 'spend', label: '採購支出分析', path: '/procurement/spend' },
  { key: 'price', label: '價格與降本', path: '/procurement/price' },
  { key: 'delivery', label: '採購時效與交期', path: '/procurement/delivery' },
  { key: 'optimize', label: '採購優化建議', path: '/procurement/optimize' },
];

const ProcurementPage: React.FC = () => {
  const subRoute = useProcurementSubRoute();
  const navigate = useNavigate();

  const renderPage = () => {
    switch (subRoute) {
      case 'spend': return <SpendPage />;
      case 'price': return <PricePage />;
      case 'delivery': return <DeliveryPage />;
      case 'optimize': return <OptimizePage />;
      default: return <SpendPage />;
    }
  };

  return (
    <div>
      <div style={pStyles.tabBar}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button key={tab.key} onClick={() => navigate(tab.path)} style={{ ...pStyles.tabBtn, ...(active ? pStyles.tabBtnActive : {}) }}>
              {tab.label}
            </button>
          );
        })}
      </div>
      {renderPage()}
    </div>
  );
};

export default ProcurementPage;
