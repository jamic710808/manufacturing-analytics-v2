import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

const useSupplierSubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/supplier\/?(.*)$/);
  return match ? (match[1] || 'score') : 'score';
};

const sStyles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },
  unit: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  tabBar: { display: 'flex', gap: 8, marginBottom: 24, padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' as const },
  tabBtn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.15s ease' },
  tabBtnActive: { background: 'var(--accent)', color: 'white' },
};

const getRiskColor = (level: 'low' | 'medium' | 'high') =>
  level === 'low' ? 'var(--success)' : level === 'medium' ? 'var(--warning)' : 'var(--danger)';

/* ================================================================
   子頁 1：供應商評分卡
   ================================================================ */
const ScorePage: React.FC = () => {
  const suppliers = [
    { code: 'S-001', name: '供應商 A', country: '台灣', cat: '電子原料', otd: 98.5, quality: 99.2, price: 97.8, service: 96.5, years: 8, vol: 28 },
    { code: 'S-002', name: '供應商 B', country: '日本', cat: '包裝材料', otd: 96.2, quality: 98.5, price: 99.1, service: 97.2, years: 12, vol: 18.5 },
    { code: 'S-003', name: '供應商 C', country: '中國', cat: '生產設備', otd: 88.2, quality: 97.2, price: 98.5, service: 93.1, years: 5, vol: 22 },
    { code: 'S-004', name: '供應商 D', country: '韓國', cat: '間接物料', otd: 93.5, quality: 96.8, price: 97.2, service: 95.8, years: 6, vol: 12 },
    { code: 'S-005', name: '供應商 E', country: '中國', cat: '電子原料', otd: 85.1, quality: 91.2, price: 96.5, service: 88.5, years: 3, vol: 15 },
    { code: 'S-006', name: '供應商 F', country: '美國', cat: '物流服務', otd: 97.8, quality: 98.1, price: 95.2, service: 98.8, years: 7, vol: 8.5 },
  ];

  const radarOption = {
    tooltip: {},
    legend: { data: ['供應商 A', '供應商 E'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    radar: {
      indicator: [
        { name: '交期達成', max: 100 }, { name: '品質合格', max: 100 },
        { name: '價格合規', max: 100 }, { name: '服務評分', max: 100 }, { name: '合作穩定', max: 100 },
      ],
      radius: '65%', splitLine: { lineStyle: { color: 'var(--glass-border)' } },
      axisLine: { lineStyle: { color: 'var(--glass-border)' } },
      axisName: { color: 'var(--text-secondary)', fontSize: 11 },
    },
    series: [{
      type: 'radar',
      data: [
        { name: '供應商 A', value: [98.5, 99.2, 97.8, 96.5, 96], itemStyle: { color: '#3b82f6' }, areaStyle: { opacity: 0.15 } },
        { name: '供應商 E', value: [85.1, 91.2, 96.5, 88.5, 60], itemStyle: { color: '#ef4444' }, areaStyle: { opacity: 0.15 } },
      ],
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={sStyles.title}>⭐ 供應商評分卡</h1>
        <p style={sStyles.subtitle}>多維度評分：交期、品質、價格、服務綜合評估</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '供應商總數', value: '156', unit: '家', color: 'var(--text-primary)' },
          { label: '平均綜合評分', value: '92.4', unit: '分', color: 'var(--success)' },
          { label: '優秀供應商（≥95）', value: '45', unit: '家', color: 'var(--success)' },
          { label: '待改進（<85）', value: '12', unit: '家', color: 'var(--danger)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={sStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={sStyles.chartTitle}>評分雷達對比（最優 vs 最劣）</h3></div>
          <ReactECharts option={radarOption} style={{ height: '280px' }} />
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={sStyles.chartTitle}>評分分布</h3></div>
          <ReactECharts
            option={{
              tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
              grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
              xAxis: { type: 'category', data: ['95-100', '90-95', '85-90', '80-85', '<80'], axisLabel: { color: 'var(--text-secondary)' } },
              yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
              series: [{
                type: 'bar', barWidth: '55%',
                itemStyle: { color: (p: { dataIndex: number }) => ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'][p.dataIndex], borderRadius: [4, 4, 0, 0] },
                data: [45, 68, 25, 10, 8],
              }],
            }}
            style={{ height: '280px' }}
          />
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={sStyles.chartTitle}>供應商評分明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>代碼</th><th>供應商</th><th>國家</th><th>品類</th><th>交期 OTD</th><th>品質</th><th>價格</th><th>服務</th><th>綜合評分</th><th>年採購額</th></tr>
            </thead>
            <tbody>
              {suppliers.map(s => {
                const score = ((s.otd + s.quality + s.price + s.service) / 4).toFixed(1);
                const sc = parseFloat(score);
                const scoreColor = sc >= 95 ? 'var(--success)' : sc >= 88 ? 'var(--warning)' : 'var(--danger)';
                return (
                  <tr key={s.code}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.code}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.country}</td>
                    <td>{s.cat}</td>
                    <td style={{ color: s.otd >= 95 ? 'var(--success)' : 'var(--warning)' }}>{s.otd}%</td>
                    <td style={{ color: s.quality >= 97 ? 'var(--success)' : 'var(--warning)' }}>{s.quality}%</td>
                    <td>{s.price}%</td>
                    <td>{s.service}%</td>
                    <td style={{ color: scoreColor, fontWeight: 700, fontSize: 16 }}>{score}</td>
                    <td>${s.vol}M</td>
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
   子頁 2：供應鏈風險矩陣
   ================================================================ */
const RiskPage: React.FC = () => {
  const risks = [
    { supplier: '供應商 E', code: 'S-005', cat: '電子原料', prob: 'high', impact: 'high', risk: 'high', mitigation: '建立備援供應商', status: '進行中' },
    { supplier: '供應商 C', code: 'S-003', cat: '生產設備', prob: 'medium', impact: 'high', risk: 'high', mitigation: '簽訂備貨合約', status: '計畫中' },
    { supplier: '供應商 H', code: 'S-008', cat: '電子原料', prob: 'high', impact: 'medium', risk: 'medium', mitigation: '增加安全庫存', status: '完成' },
    { supplier: '供應商 K', code: 'S-011', cat: '包裝材料', prob: 'low', impact: 'high', risk: 'medium', mitigation: '雙源採購', status: '進行中' },
    { supplier: '供應商 M', code: 'S-015', cat: '物流服務', prob: 'medium', impact: 'medium', risk: 'medium', mitigation: '多物流商備案', status: '完成' },
    { supplier: '供應商 D', code: 'S-004', cat: '間接物料', prob: 'low', impact: 'low', risk: 'low', mitigation: '定期審核', status: '持續監控' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 style={sStyles.title}>🗺️ 供應鏈風險矩陣</h1>
        <p style={sStyles.subtitle}>評估供應商風險發生機率與衝擊程度，制定應對策略</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '高風險供應商', value: '8', unit: '家', color: 'var(--danger)' },
          { label: '中風險供應商', value: '24', unit: '家', color: 'var(--warning)' },
          { label: '單一來源採購', value: '12', unit: '項', color: 'var(--warning)' },
          { label: '風險緩解完成率', value: '68%', unit: '', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={sStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      {/* 風險矩陣視覺化 */}
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={sStyles.chartTitle}>2×2 風險矩陣（機率 × 衝擊）</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, height: 260, padding: '8px 0' }}>
          {[
            { label: '高機率 × 高衝擊', bg: 'rgba(239,68,68,0.12)', border: 'var(--danger)', items: ['供應商 E'] },
            { label: '低機率 × 高衝擊', bg: 'rgba(245,158,11,0.12)', border: 'var(--warning)', items: ['供應商 C', '供應商 K'] },
            { label: '高機率 × 低衝擊', bg: 'rgba(245,158,11,0.12)', border: 'var(--warning)', items: ['供應商 H'] },
            { label: '低機率 × 低衝擊', bg: 'rgba(16,185,129,0.12)', border: 'var(--success)', items: ['供應商 D', '供應商 M'] },
          ].map(cell => (
            <div key={cell.label} style={{ background: cell.bg, border: `1px solid ${cell.border}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: cell.border, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cell.label}</div>
              {cell.items.map(item => (
                <span key={item} style={{ fontSize: 13, color: 'var(--text-primary)', padding: '3px 8px', background: 'var(--glass-bg)', borderRadius: 6, display: 'inline-block' }}>{item}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={sStyles.chartTitle}>風險清單與緩解措施</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>供應商</th><th>代碼</th><th>品類</th><th>發生機率</th><th>衝擊程度</th><th>風險等級</th><th>緩解措施</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {risks.map(r => {
                const rc = getRiskColor(r.risk as 'low' | 'medium' | 'high');
                return (
                  <tr key={r.code}>
                    <td style={{ fontWeight: 600 }}>{r.supplier}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.code}</td>
                    <td>{r.cat}</td>
                    <td><span className="badge" style={{ background: `${getRiskColor(r.prob as 'low' | 'medium' | 'high')}20`, color: getRiskColor(r.prob as 'low' | 'medium' | 'high') }}>{r.prob === 'high' ? '高' : r.prob === 'medium' ? '中' : '低'}</span></td>
                    <td><span className="badge" style={{ background: `${getRiskColor(r.impact as 'low' | 'medium' | 'high')}20`, color: getRiskColor(r.impact as 'low' | 'medium' | 'high') }}>{r.impact === 'high' ? '高' : r.impact === 'medium' ? '中' : '低'}</span></td>
                    <td><span className="status-badge" style={{ background: `${rc}20`, color: rc }}>{r.risk === 'high' ? '高風險' : r.risk === 'medium' ? '中風險' : '低風險'}</span></td>
                    <td style={{ fontSize: 13 }}>{r.mitigation}</td>
                    <td><span className={`badge ${r.status === '完成' ? 'badge-success' : r.status === '進行中' ? 'badge-info' : 'badge-warning'}`}>{r.status}</span></td>
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
   子頁 3：產能與風險評估
   ================================================================ */
const CapacityPage: React.FC = () => {
  const capacityOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['當前訂單量', '最大產能'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['供應商 A', '供應商 B', '供應商 C', '供應商 D', '供應商 E', '供應商 F'], axisLabel: { color: 'var(--text-secondary)', fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: (v: number) => `${v}M` }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '當前訂單量', type: 'bar', barGap: '5%', barWidth: '35%', itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: [28, 18.5, 22, 12, 15, 8.5] },
      { name: '最大產能', type: 'bar', barWidth: '35%', itemStyle: { color: 'rgba(16,185,129,0.5)', borderRadius: [4, 4, 0, 0] }, data: [40, 25, 28, 20, 18, 15] },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={sStyles.title}>🏭 產能與風險評估</h1>
        <p style={sStyles.subtitle}>評估供應商產能利用率、集中度風險與備援能力</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '平均產能利用率', value: '74%', unit: '', color: 'var(--warning)' },
          { label: '產能超過 90% 供應商', value: '3', unit: '家', color: 'var(--danger)' },
          { label: '單一供應商依賴', value: '12', unit: '品項', color: 'var(--warning)' },
          { label: '備援供應商覆蓋率', value: '67%', unit: '', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={sStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={sStyles.chartTitle}>供應商訂單量 vs 最大產能（百萬）</h3></div>
        <ReactECharts option={capacityOption} style={{ height: '280px' }} />
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={sStyles.chartTitle}>產能利用率明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>供應商</th><th>品類</th><th>當前訂單量</th><th>最大產能</th><th>利用率</th><th>風險評估</th><th>備援供應商</th></tr>
            </thead>
            <tbody>
              {[
                { name: '供應商 A', cat: '電子原料', order: 28, cap: 40, backup: '供應商 J' },
                { name: '供應商 B', cat: '包裝材料', order: 18.5, cap: 25, backup: '供應商 L' },
                { name: '供應商 C', cat: '生產設備', order: 22, cap: 28, backup: '—' },
                { name: '供應商 D', cat: '間接物料', order: 12, cap: 20, backup: '供應商 N' },
                { name: '供應商 E', cat: '電子原料', order: 15, cap: 18, backup: '—' },
                { name: '供應商 F', cat: '物流服務', order: 8.5, cap: 15, backup: '供應商 P' },
              ].map(row => {
                const rate = Math.round(row.order / row.cap * 100);
                const rc = rate >= 90 ? 'var(--danger)' : rate >= 75 ? 'var(--warning)' : 'var(--success)';
                return (
                  <tr key={row.name}>
                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                    <td>{row.cat}</td>
                    <td>${row.order}M</td>
                    <td>${row.cap}M</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--glass-border)', borderRadius: 3 }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: rc, borderRadius: 3 }} />
                        </div>
                        <span style={{ color: rc, fontWeight: 600, width: 40 }}>{rate}%</span>
                      </div>
                    </td>
                    <td><span className="status-badge" style={{ background: `${rc}20`, color: rc }}>{rate >= 90 ? '產能緊張' : rate >= 75 ? '偏高' : '充裕'}</span></td>
                    <td style={{ color: row.backup === '—' ? 'var(--danger)' : 'var(--text-secondary)' }}>{row.backup}</td>
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
   子頁 4：合規與開發
   ================================================================ */
const CompliancePage: React.FC = () => {
  const candidates = [
    { name: '新供應商 Alpha', cat: '電子原料', stage: '樣品驗證', score: 82, country: '台灣', contact: '2025-01-15' },
    { name: '新供應商 Beta', cat: '包裝材料', stage: '資格審查', score: 75, country: '越南', contact: '2025-02-01' },
    { name: '新供應商 Gamma', cat: '物流服務', stage: '試單評估', score: 88, country: '台灣', contact: '2025-03-10' },
  ];

  const complianceItems = [
    { supplier: '供應商 A', iso9001: true, iso14001: true, iatf: true, rohs: true, reach: true, lastAudit: '2024-11' },
    { supplier: '供應商 B', iso9001: true, iso14001: true, iatf: false, rohs: true, reach: true, lastAudit: '2024-10' },
    { supplier: '供應商 C', iso9001: true, iso14001: false, iatf: false, rohs: true, reach: false, lastAudit: '2024-08' },
    { supplier: '供應商 E', iso9001: true, iso14001: false, iatf: false, rohs: false, reach: false, lastAudit: '2024-06' },
  ];

  const stageColor = (s: string) => s === '試單評估' ? 'var(--success)' : s === '樣品驗證' ? 'var(--warning)' : 'var(--info)';
  const Check = ({ v }: { v: boolean }) => <span style={{ color: v ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{v ? '✓' : '✗'}</span>;

  return (
    <div>
      <div className="page-header">
        <h1 style={sStyles.title}>📋 合規與開發</h1>
        <p style={sStyles.subtitle}>供應商認證合規管理、稽核紀錄與新供應商開發進度</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: 'ISO 9001 覆蓋率', value: '96%', unit: '', color: 'var(--success)' },
          { label: '合規審查逾期', value: '4', unit: '家', color: 'var(--warning)' },
          { label: '新供應商開發中', value: '3', unit: '家', color: 'var(--accent)' },
          { label: '本季稽核完成', value: '18', unit: '次', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={sStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={sStyles.chartTitle}>新供應商開發進度</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {candidates.map(c => {
            const sc = stageColor(c.stage);
            return (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.cat} · {c.country} · 首次接觸：{c.contact}</div>
                </div>
                <span className="badge" style={{ background: `${sc}20`, color: sc }}>{c.stage}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>評估分數</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c.score >= 85 ? 'var(--success)' : 'var(--warning)' }}>{c.score}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={sStyles.chartTitle}>認證合規狀態</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>供應商</th><th>ISO 9001</th><th>ISO 14001</th><th>IATF 16949</th><th>RoHS</th><th>REACH</th><th>最近稽核</th><th>下次稽核</th></tr>
            </thead>
            <tbody>
              {complianceItems.map(row => {
                const audit = new Date(row.lastAudit + '-01');
                const nextAudit = new Date(audit);
                nextAudit.setFullYear(nextAudit.getFullYear() + 1);
                const nextStr = `${nextAudit.getFullYear()}-${String(nextAudit.getMonth() + 1).padStart(2, '0')}`;
                return (
                  <tr key={row.supplier}>
                    <td style={{ fontWeight: 600 }}>{row.supplier}</td>
                    <td style={{ textAlign: 'center' }}><Check v={row.iso9001} /></td>
                    <td style={{ textAlign: 'center' }}><Check v={row.iso14001} /></td>
                    <td style={{ textAlign: 'center' }}><Check v={row.iatf} /></td>
                    <td style={{ textAlign: 'center' }}><Check v={row.rohs} /></td>
                    <td style={{ textAlign: 'center' }}><Check v={row.reach} /></td>
                    <td>{row.lastAudit}</td>
                    <td style={{ color: 'var(--accent)' }}>{nextStr}</td>
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
   主頁面
   ================================================================ */
const subTabs = [
  { key: 'score', label: '供應商評分卡', path: '/supplier/score' },
  { key: 'risk', label: '供應鏈風險矩陣', path: '/supplier/risk' },
  { key: 'capacity', label: '產能與風險評估', path: '/supplier/capacity' },
  { key: 'compliance', label: '合規與開發', path: '/supplier/compliance' },
];

const SupplierPage: React.FC = () => {
  const subRoute = useSupplierSubRoute();
  const navigate = useNavigate();

  const renderPage = () => {
    switch (subRoute) {
      case 'score': return <ScorePage />;
      case 'risk': return <RiskPage />;
      case 'capacity': return <CapacityPage />;
      case 'compliance': return <CompliancePage />;
      default: return <ScorePage />;
    }
  };

  return (
    <div>
      <div style={sStyles.tabBar}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button key={tab.key} onClick={() => navigate(tab.path)} style={{ ...sStyles.tabBtn, ...(active ? sStyles.tabBtnActive : {}) }}>
              {tab.label}
            </button>
          );
        })}
      </div>
      {renderPage()}
    </div>
  );
};

export default SupplierPage;
