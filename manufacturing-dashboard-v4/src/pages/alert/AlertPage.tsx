import React, { useState } from 'react';

type AlertLevel = 'critical' | 'high' | 'medium' | 'low';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface Alert {
  id: string;
  level: AlertLevel;
  status: AlertStatus;
  title: string;
  desc: string;
  module: string;
  time: string;
  assignee: string;
}

const allAlerts: Alert[] = [
  { id: 'A001', level: 'critical', status: 'active', title: '生產線 #3 停機超過 2 小時', desc: '設備故障導致生產中斷，預計影響今日 480 件產出目標', module: '生產', time: '09:15', assignee: '設備部門' },
  { id: 'A002', level: 'critical', status: 'active', title: '關鍵物料 M-0021 庫存低於安全水位', desc: '電阻 470Ω 現有庫存 200 件，低於安全庫存 500 件，補貨前置時間 7 天', module: '庫存', time: '08:32', assignee: '採購部門' },
  { id: 'A003', level: 'high', status: 'acknowledged', title: '供應商 E OTD 達成率連續 3 個月低於 88%', desc: '供應商 E 本月 OTD 僅 85.1%，未達合約要求 93%，需啟動改善計畫', module: '供應商', time: '昨日 17:00', assignee: '採購部門' },
  { id: 'A004', level: 'high', status: 'active', title: 'PO-2025-0312 交期延遲 4 天', desc: 'PCB 空板 V3 承諾 3/18 到貨，預計 3/22 才能到貨，影響訂單 WO-0812', module: '採購', time: '10:05', assignee: '採購部門' },
  { id: 'A005', level: 'high', status: 'active', title: 'Cpk 製程能力下降：製程 #5 銅箔蝕刻', desc: '近 7 天 Cpk 由 1.45 下降至 1.18，已低於 1.33 管制下限，品質風險升高', module: '品質', time: '08:50', assignee: '工程部門' },
  { id: 'A006', level: 'medium', status: 'active', title: '批次 LOT-2024-0312 庫齡 378 天（超齡）', desc: '鋁電解電容 100μF 批次超過建議儲存期限，需優先使用或進行效能驗證', module: '庫存', time: '昨日 09:00', assignee: '倉儲部門' },
  { id: 'A007', level: 'medium', status: 'acknowledged', title: 'OEE 本週低於目標：87% vs 目標 90%', desc: '換模時間偏長（平均 45 分鐘）及小停機次數增加（+23%）是主因', module: '生產', time: '昨日 08:00', assignee: '生產部門' },
  { id: 'A008', level: 'medium', status: 'resolved', title: '入料品檢 IQC 不良率偏高：PCB 空板批次', desc: '供應商 C 本批 PCB 來料不良率 3.2%，已超出 AQL 允收標準 1.5%', module: '品質', time: '3天前', assignee: '品管部門' },
  { id: 'A009', level: 'low', status: 'resolved', title: '採購合約即將到期：供應商 B 包裝材料框架合約', desc: '框架合約將於 2025-04-30 到期，建議提前 60 天開始續約談判', module: '採購', time: '4天前', assignee: '採購部門' },
  { id: 'A010', level: 'low', status: 'active', title: '供應商 C ISO 14001 認證即將到期', desc: '供應商 C 的 ISO 14001 環境管理認證將於 2025-05-15 到期', module: '供應商', time: '2天前', assignee: '採購部門' },
];

const levelConfig: Record<AlertLevel, { label: string; color: string; bg: string }> = {
  critical: { label: '緊急', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  high: { label: '高', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  medium: { label: '中', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low: { label: '低', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
};

const statusConfig: Record<AlertStatus, { label: string; color: string }> = {
  active: { label: '待處理', color: 'var(--danger)' },
  acknowledged: { label: '處理中', color: 'var(--warning)' },
  resolved: { label: '已解決', color: 'var(--success)' },
};

const AlertPage: React.FC = () => {
  const [filterLevel, setFilterLevel] = useState<AlertLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');
  const [filterModule, setFilterModule] = useState<string>('all');

  const filtered = allAlerts.filter(a =>
    (filterLevel === 'all' || a.level === filterLevel) &&
    (filterStatus === 'all' || a.status === filterStatus) &&
    (filterModule === 'all' || a.module === filterModule)
  );

  const counts = {
    critical: allAlerts.filter(a => a.level === 'critical' && a.status !== 'resolved').length,
    high: allAlerts.filter(a => a.level === 'high' && a.status !== 'resolved').length,
    medium: allAlerts.filter(a => a.level === 'medium' && a.status !== 'resolved').length,
    active: allAlerts.filter(a => a.status === 'active').length,
  };

  const modules = ['all', ...Array.from(new Set(allAlerts.map(a => a.module)))];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🔔 異常預警中心</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>跨模組即時預警，快速識別與處置異常事件</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>最後更新：{new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        {[
          { label: '緊急警示', value: counts.critical, color: 'var(--danger)' },
          { label: '高級別警示', value: counts.high, color: '#f97316' },
          { label: '中級別警示', value: counts.medium, color: 'var(--warning)' },
          { label: '待處理總計', value: counts.active, color: 'var(--text-primary)' },
        ].map(k => (
          <div key={k.label} className="glass-panel kpi-card">
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value" style={{ color: k.color }}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* 篩選器 */}
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>篩選：</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(l => {
            const active = filterLevel === l;
            const cfg = l !== 'all' ? levelConfig[l] : null;
            return (
              <button key={l} onClick={() => setFilterLevel(l)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: active ? (cfg?.color ?? 'var(--accent)') : 'var(--glass-bg)', color: active ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                {l === 'all' ? '全部等級' : levelConfig[l].label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map(s => {
            const active = filterStatus === s;
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: active ? 'var(--accent)' : 'var(--glass-bg)', color: active ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                {s === 'all' ? '全部狀態' : statusConfig[s].label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {modules.map(m => {
            const active = filterModule === m;
            return (
              <button key={m} onClick={() => setFilterModule(m)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: active ? 'var(--accent)' : 'var(--glass-bg)', color: active ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                {m === 'all' ? '全部模組' : m}
              </button>
            );
          })}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>顯示 {filtered.length} / {allAlerts.length} 筆</span>
      </div>

      {/* 預警清單 */}
      <div className="alerts-list">
        {filtered.map(alert => {
          const lc = levelConfig[alert.level];
          const sc = statusConfig[alert.status];
          return (
            <div key={alert.id} className="alert-item" style={{ borderLeft: `4px solid ${lc.color}`, background: alert.status === 'resolved' ? 'var(--glass-bg)' : lc.bg }}>
              <span className="alert-level" style={{ background: lc.color, minWidth: 36 }}>{lc.label}</span>
              <div className="alert-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="alert-title" style={{ opacity: alert.status === 'resolved' ? 0.6 : 1 }}>{alert.title}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: sc.color, flexShrink: 0, marginLeft: 12 }}>{sc.label}</span>
                </div>
                <div className="alert-desc">{alert.desc}</div>
                <div className="alert-meta">
                  <span style={{ color: 'var(--accent)' }}>#{alert.id}</span>
                  <span>模組：{alert.module}</span>
                  <span>責任人：{alert.assignee}</span>
                  <span>時間：{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            無符合條件的預警記錄
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPage;
