import React, { useState } from 'react';
import { Alert, AlertLevel, AlertStatus, allAlerts, levelConfig, statusConfig } from '../../data/alertData';

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
