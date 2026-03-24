import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useDashboardSubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/dashboard\/?(.*)$/);
  return match ? (match[1] || 'cockpit') : 'cockpit';
};

const subTabs = [
  { key: 'cockpit', label: '🚀 駕駛艙', path: '/dashboard/cockpit' },
  { key: 'benchmark', label: '📊 標竿管理', path: '/dashboard/benchmark' },
];

/* ================================================================
   駕駛艙 - 執行儀表板
   ================================================================ */
const CockpitPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('本月');

  const kpis = [
    { label: '訂單達成率', value: '96.8%', trend: '+2.1%', target: '95%', status: 'success' },
    { label: '及時交貨率', value: '94.2%', trend: '+1.5%', target: '95%', status: 'warning' },
    { label: 'OEE 設備效率', value: '87.3%', trend: '+3.2%', target: '85%', status: 'success' },
    { label: '庫存週轉率', value: '8.4次', trend: '+0.6次', target: '8次', status: 'success' },
    { label: '採購降本率', value: '3.2%', trend: '+0.8%', target: '3%', status: 'success' },
    { label: '生產週期時間', value: '4.2天', trend: '-0.5天', target: '4.5天', status: 'success' },
  ];

  const alerts = [
    { level: 'critical', msg: '供應商 A 交期延誤風險', time: '10分鐘前' },
    { level: 'warning', msg: '庫存水位低於安全庫存', time: '25分鐘前' },
    { level: 'info', msg: '今日生產目標已達成 102%', time: '1小時前' },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🚀 經營駕駛艙</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>即時掌握製造運營核心指標，快速決策支援</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['本日', '本週', '本月', '本季'].map(t => (
              <button key={t} onClick={() => setTimeRange(t)}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: timeRange === t ? 'var(--accent)' : 'var(--glass-bg)',
                  color: timeRange === t ? 'white' : 'var(--text-secondary)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI 卡片區 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{kpi.label}</span>
              <span className={`badge badge-${kpi.status}`}>{kpi.target}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{kpi.trend}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>較前期</span>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        {/* ，生產趨勢圖 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>產能利用率趨勢</h3></div>
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📈</div>
              <div>產能利用率：78.5%</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>近30日趨勢圖</div>
            </div>
          </div>
        </div>

        {/* 異常告警 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>即時告警</h3></div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: a.level === 'critical' ? 'rgba(239,68,68,0.1)' : a.level === 'warning' ? 'rgba(245,158,11,0.1)' : 'var(--bg-surface)' }}>
                <span style={{ fontSize: 18 }}>{a.level === 'critical' ? '🔴' : a.level === 'warning' ? '🟡' : '🔵'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.msg}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   標竿管理 - 內外部基準對標
   ================================================================ */
const BenchmarkPage: React.FC = () => {
  const benchmarks = [
    { category: 'OEE', internal: 87.3, target: 85, industry: 78, worldClass: 90 },
    { category: '庫存週轉率', internal: 8.4, target: 8, industry: 6.5, worldClass: 12 },
    { category: '及時交貨率', internal: 94.2, target: 95, industry: 92, worldClass: 99 },
    { category: '採購降本率', internal: 3.2, target: 3, industry: 2.1, worldClass: 5 },
    { category: '人均產值', internal: 125, target: 120, industry: 98, worldClass: 150 },
    { category: '良率', internal: 98.7, target: 99, industry: 97.5, worldClass: 99.5 },
  ];

  const getBarColor = (val: number, target: number) => val >= target ? 'var(--success)' : val >= target * 0.9 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>📊 標竿管理</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>內部目標 vs 行業基準 vs 世界級標竿</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {benchmarks.map(b => (
          <div key={b.category} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{b.category}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>世界級 {b.worldClass}</span>
            </div>

            {/* 柱狀圖 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '內部實際', value: b.internal, color: 'var(--accent)' },
                { label: '目標', value: b.target, color: 'var(--warning)' },
                { label: '行業平均', value: b.industry, color: 'var(--text-muted)' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--glass-bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.value / b.worldClass) * 100}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
              {b.internal >= b.target ? '✅ 已達標' : b.internal >= b.industry ? '⚠️ 高於行業，需持續改進' : '🔴 低於行業平均，需重點關注'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================
   主頁面
   ================================================================ */
const DashboardPage: React.FC = () => {
  const subRoute = useDashboardSubRoute();
  const navigate = useNavigate();

  const tabBarStyle: React.CSSProperties = { display: 'flex', gap: 8, marginBottom: 24, padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' };
  const tabBtn: React.CSSProperties = { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.15s ease' };
  const tabBtnActive: React.CSSProperties = { background: 'var(--accent)', color: 'white' };

  return (
    <div>
      <div style={tabBarStyle}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button key={tab.key} onClick={() => navigate(tab.path)} style={{ ...tabBtn, ...(active ? tabBtnActive : {}) }}>
              {tab.label}
            </button>
          );
        })}
      </div>
      {subRoute === 'cockpit' ? <CockpitPage /> : <BenchmarkPage />}
    </div>
  );
};

export default DashboardPage;
