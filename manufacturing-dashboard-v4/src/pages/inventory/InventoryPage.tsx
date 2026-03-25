import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useData } from '../../data/DataContext';

/** 取得庫存子路由 */
const useInventorySubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/inventory\/?(.*)$/);
  return match ? (match[1] || 'efficiency') : 'efficiency';
};

/* ================================================================
   子頁 1：庫存效能儀表板
   ================================================================ */
const EfficiencyPage: React.FC = () => {
  const { data } = useData();
  const inv = data.inventory;

  const categoryOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: 'var(--text-secondary)' } },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['38%', '50%'],
      itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', color: 'var(--text-primary)', fontSize: 11 },
      data: inv.categories.map(c => ({ name: c.name, value: c.value })),
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    }],
  };

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)',
      textStyle: { color: 'var(--text-primary)' },
    },
    legend: { data: ['週轉率（次）', '庫存天數'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLabel: { color: 'var(--text-secondary)' },
      axisLine: { lineStyle: { color: 'var(--chart-axis)' } },
    },
    yAxis: [
      { type: 'value', name: '週轉率', axisLabel: { color: 'var(--text-secondary)', formatter: '{value}次' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
      { type: 'value', name: '庫存天數', axisLabel: { color: 'var(--text-secondary)', formatter: '{value}天' }, splitLine: { show: false } },
    ],
    series: [
      { name: '週轉率（次）', type: 'bar', barWidth: '35%', yAxisIndex: 0, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: [7.8, 8.1, 7.9, 8.3, 8.2, 8.4] },
      { name: '庫存天數', type: 'line', yAxisIndex: 1, smooth: true, itemStyle: { color: '#f59e0b' }, lineStyle: { width: 2 }, data: [46, 44, 45, 43, 44, 43] },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={pageStyles.title}>📦 庫存效能儀表板</h1>
        <p style={pageStyles.subtitle}>追蹤庫存週轉效率、倉庫利用率與庫存結構分析</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '總庫存金額', value: `${(inv.totalValue / 1e6).toFixed(1)}M`, unit: 'NTD', color: 'var(--text-primary)' },
          { label: '庫存週轉率', value: String(inv.turnoverRate), unit: '次/年', color: 'var(--success)' },
          { label: '平均庫存天數', value: String(inv.avgDays), unit: '天', color: 'var(--warning)' },
          { label: '倉庫利用率', value: `${inv.utilization}%`, unit: '', color: 'var(--info)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pageStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pageStyles.chartTitle}>庫存類別分佈</h3></div>
          <ReactECharts option={categoryOption} style={{ height: '280px' }} />
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pageStyles.chartTitle}>週轉率 vs 庫存天數趨勢</h3></div>
          <ReactECharts option={trendOption} style={{ height: '280px' }} />
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={pageStyles.chartTitle}>倉庫利用率明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>倉庫名稱</th><th>總容量</th><th>已使用</th><th>利用率</th><th>週轉率</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {inv.warehouses.map(row => {
                const rate = Math.round(row.used / row.capacity * 100);
                const color = row.status === 'good' ? 'var(--success)' : 'var(--warning)';
                return (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.capacity} 棧板</td>
                    <td>{row.used} 棧板</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--glass-border)', borderRadius: 3 }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: 3 }} />
                        </div>
                        <span style={{ color, fontWeight: 600, width: 40 }}>{rate}%</span>
                      </div>
                    </td>
                    <td>{row.turnover} 次/年</td>
                    <td><span className="status-badge" style={{ background: `${color}20`, color }}>{row.status === 'good' ? '正常' : '偏高'}</span></td>
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
   子頁 2：庫存風險分析
   ================================================================ */
const RiskPage: React.FC = () => {
  const riskBarOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    yAxis: { type: 'category', data: ['舊款面板 A', '停產零件 X', '不良半成品', '包裝箱舊規', '過期原料 B'], axisLabel: { color: 'var(--text-secondary)' } },
    series: [{
      type: 'bar', barWidth: '55%',
      itemStyle: { color: '#ef4444', borderRadius: [0, 4, 4, 0] },
      data: [180, 250, 200, 150, 120],
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={pageStyles.title}>⚠️ 庫存風險分析</h1>
        <p style={pageStyles.subtitle}>識別呆滯庫存、缺貨風險與庫存異常項目</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '呆滯庫存項數', value: '12', unit: '項', color: 'var(--danger)' },
          { label: '呆滯庫存金額', value: '856K', unit: 'NTD', color: 'var(--danger)' },
          { label: '缺貨風險品項', value: '5', unit: '項', color: 'var(--warning)' },
          { label: '庫存金額風險率', value: '6.8%', unit: '', color: 'var(--warning)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pageStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pageStyles.chartTitle}>呆滯天數 Top 5（天）</h3></div>
          <ReactECharts option={riskBarOption} style={{ height: '280px' }} />
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pageStyles.chartTitle}>缺貨警示品項</h3></div>
          <div className="alerts-list">
            {[
              { code: 'M-0021', name: '關鍵電阻 470Ω', stock: 200, min: 500, level: 'high' },
              { code: 'M-0055', name: '散熱膏 TG-3000', stock: 15, min: 30, level: 'high' },
              { code: 'P-0112', name: 'PCB 空板 V3', stock: 80, min: 150, level: 'medium' },
              { code: 'W-0033', name: '標準包裝盒', stock: 300, min: 500, level: 'medium' },
              { code: 'M-0088', name: '導電膠帶 5mm', stock: 50, min: 80, level: 'low' },
            ].map(item => {
              const levelColor = item.level === 'high' ? 'var(--danger)' : item.level === 'medium' ? 'var(--warning)' : 'var(--info)';
              return (
                <div key={item.code} className="alert-item">
                  <span className="alert-level" style={{ background: levelColor }}>{item.level === 'high' ? '緊急' : item.level === 'medium' ? '警告' : '注意'}</span>
                  <div className="alert-content">
                    <div className="alert-title">{item.code} · {item.name}</div>
                    <div className="alert-meta">
                      <span>現有：{item.stock}</span>
                      <span>最低安全量：{item.min}</span>
                      <span style={{ color: levelColor }}>缺口：{item.min - item.stock}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={pageStyles.chartTitle}>呆滯庫存明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>料號</th><th>品名</th><th>類別</th><th>倉庫</th><th>數量</th><th>庫存金額</th><th>週轉率</th><th>呆滯天數</th><th>建議處置</th></tr>
            </thead>
            <tbody>
              {[
                { code: 'M-1234', name: '舊款面板 A', cat: '原料', wh: '原料倉', qty: 500, val: 125000, turn: 0.3, days: 180, action: '降價出清' },
                { code: 'P-3456', name: '停產零件 X', cat: '原料', wh: '原料倉', qty: 300, val: 90000, turn: 0.1, days: 250, action: '報廢申請' },
                { code: 'F-9012', name: '不良半成品', cat: '半成品', wh: '不良區', qty: 120, val: 48000, turn: 0.2, days: 200, action: '重工評估' },
                { code: 'W-5678', name: '包裝箱舊規', cat: '包裝材', wh: '包裝倉', qty: 2000, val: 60000, turn: 0.5, days: 150, action: '協商退貨' },
              ].map(row => (
                <tr key={row.code}>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.cat}</td>
                  <td>{row.wh}</td>
                  <td>{row.qty.toLocaleString()}</td>
                  <td style={{ color: 'var(--danger)' }}>${row.val.toLocaleString()}</td>
                  <td>{row.turn} 次/年</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{row.days} 天</td>
                  <td><span className="badge badge-warning">{row.action}</span></td>
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
   子頁 3：安全庫存建議
   ================================================================ */
const SafetyStockPage: React.FC = () => {
  const comparisonOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['現有庫存', '建議安全庫存'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['電阻 470Ω', 'PCB 空板', '散熱膏', '導電膠帶', '包裝盒'], axisLabel: { color: 'var(--text-secondary)', fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '現有庫存', type: 'bar', barGap: '5%', barWidth: '35%', itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: [200, 80, 15, 50, 300] },
      { name: '建議安全庫存', type: 'bar', barWidth: '35%', itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }, data: [500, 150, 30, 80, 500] },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={pageStyles.title}>🛡️ 安全庫存建議</h1>
        <p style={pageStyles.subtitle}>根據需求波動與前置時間計算最佳安全庫存與再訂購點</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '低於安全庫存', value: '5', unit: '項', color: 'var(--danger)' },
          { label: '建議補貨金額', value: '2.3M', unit: 'NTD', color: 'var(--warning)' },
          { label: '平均前置時間', value: '14', unit: '天', color: 'var(--text-primary)' },
          { label: '庫存達標率', value: '87%', unit: '', color: 'var(--success)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pageStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={pageStyles.chartTitle}>現有庫存 vs 建議安全庫存</h3></div>
        <ReactECharts option={comparisonOption} style={{ height: '280px' }} />
      </div>
      <div className="glass-panel">
        <div className="chart-header">
          <h3 style={pageStyles.chartTitle}>安全庫存建議明細</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>公式：SS = Z × σd × √L（Z=1.65, 服務水準95%）</span>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>料號</th><th>品名</th><th>現有庫存</th><th>日均需求</th><th>需求標準差</th><th>前置時間</th><th>安全庫存</th><th>再訂購點</th><th>建議補貨量</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {[
                { code: 'M-0021', name: '電阻 470Ω', stock: 200, avg: 50, std: 12, lead: 7, ss: 524, rop: 874, order: 324 },
                { code: 'P-0112', name: 'PCB 空板 V3', stock: 80, avg: 15, std: 4, lead: 10, ss: 209, rop: 359, order: 129 },
                { code: 'M-0055', name: '散熱膏', stock: 15, avg: 2, std: 0.5, lead: 14, ss: 31, rop: 59, order: 16 },
                { code: 'M-0088', name: '導電膠帶', stock: 50, avg: 8, std: 2, lead: 7, ss: 88, rop: 144, order: 38 },
                { code: 'W-0033', name: '標準包裝盒', stock: 300, avg: 40, std: 10, lead: 5, ss: 370, rop: 570, order: 70 },
              ].map(row => {
                const ok = row.stock >= row.ss;
                const statusColor = ok ? 'var(--success)' : 'var(--danger)';
                return (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ color: ok ? 'var(--text-primary)' : 'var(--danger)', fontWeight: ok ? 400 : 700 }}>{row.stock.toLocaleString()}</td>
                    <td>{row.avg}/天</td>
                    <td>±{row.std}</td>
                    <td>{row.lead} 天</td>
                    <td style={{ fontWeight: 600 }}>{row.ss.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{row.rop.toLocaleString()}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{ok ? '—' : `+${row.order.toLocaleString()}`}</td>
                    <td><span className="status-badge" style={{ background: `${statusColor}20`, color: statusColor }}>{ok ? '充足' : '不足'}</span></td>
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
   子頁 4：批次追蹤分析
   ================================================================ */
const BatchPage: React.FC = () => {
  const consumptionOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', textStyle: { color: 'var(--text-primary)' } },
    legend: { data: ['原料', '半成品', '包裝材'], textStyle: { color: 'var(--text-secondary)' }, top: 4 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'], axisLabel: { color: 'var(--text-secondary)' } },
    yAxis: { type: 'value', axisLabel: { color: 'var(--text-secondary)', formatter: '{value}K' }, splitLine: { lineStyle: { color: 'var(--chart-grid)' } } },
    series: [
      { name: '原料', type: 'bar', stack: 'total', itemStyle: { color: '#3b82f6' }, data: [420, 380, 450, 410, 460, 440] },
      { name: '半成品', type: 'bar', stack: 'total', itemStyle: { color: '#10b981' }, data: [310, 290, 340, 320, 350, 330] },
      { name: '包裝材', type: 'bar', stack: 'total', itemStyle: { color: '#f59e0b' }, data: [120, 110, 130, 120, 140, 125] },
    ],
  };

  const fifoAlerts = [
    { batch: 'LOT-2024-0312', material: '鋁電解電容 100μF', received: '2024-03-12', age: 378, value: 45000, status: 'critical' },
    { batch: 'LOT-2024-0521', material: 'PCB 基材 FR4', received: '2024-05-21', age: 307, value: 32000, status: 'warning' },
    { batch: 'LOT-2024-0815', material: '助焊劑 RMA-218', received: '2024-08-15', age: 221, value: 12000, status: 'warning' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 style={pageStyles.title}>🔍 批次追蹤分析</h1>
        <p style={pageStyles.subtitle}>FIFO 先進先出管控、批次使用紀錄與效期追蹤</p>
      </div>
      <div className="kpi-grid">
        {[
          { label: '活躍批次數', value: '284', unit: '批', color: 'var(--text-primary)' },
          { label: 'FIFO 達成率', value: '94.2%', unit: '', color: 'var(--success)' },
          { label: '效期預警批次', value: '8', unit: '批', color: 'var(--warning)' },
          { label: '超齡庫存批次', value: '3', unit: '批', color: 'var(--danger)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}<span style={pageStyles.unit}>{k.unit}</span></span>
          </div>
        ))}
      </div>
      <div className="main-grid" style={{ marginBottom: 'var(--content-padding)' }}>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pageStyles.chartTitle}>各週批次消耗量（千元）</h3></div>
          <ReactECharts option={consumptionOption} style={{ height: '280px' }} />
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={pageStyles.chartTitle}>⏰ FIFO 超齡警示</h3></div>
          <div className="alerts-list">
            {fifoAlerts.map(alert => {
              const color = alert.status === 'critical' ? 'var(--danger)' : 'var(--warning)';
              return (
                <div key={alert.batch} className="alert-item">
                  <span className="alert-level" style={{ background: color }}>{alert.status === 'critical' ? '超齡' : '偏舊'}</span>
                  <div className="alert-content">
                    <div className="alert-title">{alert.batch}</div>
                    <div className="alert-desc" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{alert.material}</div>
                    <div className="alert-meta">
                      <span>入庫：{alert.received}</span>
                      <span style={{ color }}>庫齡：{alert.age} 天</span>
                      <span>金額：${alert.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="glass-panel">
        <div className="chart-header"><h3 style={pageStyles.chartTitle}>批次追蹤明細</h3></div>
        <div className="data-table">
          <table>
            <thead>
              <tr><th>批號</th><th>料號</th><th>品名</th><th>入庫日</th><th>原始數量</th><th>剩餘數量</th><th>使用率</th><th>庫齡</th><th>狀態</th></tr>
            </thead>
            <tbody>
              {[
                { lot: 'LOT-2025-0115', code: 'M-0021', name: '電阻 470Ω', in: '2025-01-15', orig: 5000, remain: 2100, age: 68 },
                { lot: 'LOT-2025-0201', code: 'P-0112', name: 'PCB 空板 V3', in: '2025-02-01', orig: 300, remain: 220, age: 51 },
                { lot: 'LOT-2025-0220', code: 'M-0055', name: '散熱膏', in: '2025-02-20', orig: 100, remain: 38, age: 32 },
                { lot: 'LOT-2025-0301', code: 'W-0033', name: '包裝盒', in: '2025-03-01', orig: 2000, remain: 1650, age: 23 },
                { lot: 'LOT-2025-0310', code: 'M-0088', name: '導電膠帶', in: '2025-03-10', orig: 200, remain: 180, age: 14 },
              ].map(row => {
                const usage = Math.round((row.orig - row.remain) / row.orig * 100);
                const ageColor = row.age > 60 ? 'var(--warning)' : 'var(--text-primary)';
                return (
                  <tr key={row.lot}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.lot}</td>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td>{row.in}</td>
                    <td>{row.orig.toLocaleString()}</td>
                    <td>{row.remain.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--glass-border)', borderRadius: 3 }}>
                          <div style={{ width: `${usage}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                        <span style={{ width: 36, fontSize: 12 }}>{usage}%</span>
                      </div>
                    </td>
                    <td style={{ color: ageColor, fontWeight: row.age > 60 ? 600 : 400 }}>{row.age} 天</td>
                    <td><span className="badge badge-success">正常</span></td>
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
   主頁面：InventoryPage（負責子路由切換 + 子頁 tab 導覽）
   ================================================================ */
const subTabs = [
  { key: 'efficiency', label: '庫存效能儀表板', path: '/inventory/efficiency' },
  { key: 'risk', label: '庫存風險分析', path: '/inventory/risk' },
  { key: 'safety', label: '安全庫存建議', path: '/inventory/safety' },
  { key: 'batch', label: '批次追蹤分析', path: '/inventory/batch' },
];

const InventoryPage: React.FC = () => {
  const subRoute = useInventorySubRoute();
  const navigate = useNavigate();

  const renderPage = () => {
    switch (subRoute) {
      case 'efficiency': return <EfficiencyPage />;
      case 'risk': return <RiskPage />;
      case 'safety': return <SafetyStockPage />;
      case 'batch': return <BatchPage />;
      default: return <EfficiencyPage />;
    }
  };

  return (
    <div>
      {/* 子頁 Tab 導覽列 */}
      <div style={pageStyles.tabBar}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              style={{
                ...pageStyles.tabBtn,
                ...(active ? pageStyles.tabBtnActive : {}),
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {renderPage()}
    </div>
  );
};

const pageStyles: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },
  unit: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  tabBar: {
    display: 'flex', gap: 8, marginBottom: 24,
    padding: '6px 8px',
    background: 'var(--glass-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-border)',
    flexWrap: 'wrap' as const,
  },
  tabBtn: {
    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: 'transparent', color: 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    background: 'var(--accent)', color: 'white',
  },
};

export default InventoryPage;
