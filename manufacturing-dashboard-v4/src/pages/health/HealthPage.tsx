import React from 'react';
import ReactECharts from 'echarts-for-react';

const HealthPage: React.FC = () => {
  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '設備效率 OEE', max: 100 },
        { name: '品質良率', max: 100 },
        { name: '準時交貨 OTD', max: 100 },
        { name: '庫存效能', max: 100 },
        { name: '採購績效', max: 100 },
        { name: '供應商評分', max: 100 },
      ],
      radius: '68%',
      splitLine: { lineStyle: { color: 'var(--glass-border)' } },
      axisLine: { lineStyle: { color: 'var(--glass-border)' } },
      axisName: { color: 'var(--text-secondary)', fontSize: 12 },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.03)'] } },
    },
    series: [{
      type: 'radar',
      data: [{
        name: '本月',
        value: [87, 96, 78, 92, 94, 88],
        itemStyle: { color: '#3b82f6' },
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
      }, {
        name: '目標',
        value: [90, 98, 85, 95, 96, 92],
        itemStyle: { color: '#f59e0b' },
        lineStyle: { type: 'dashed', width: 2 },
        areaStyle: { opacity: 0 },
      }],
    }],
    legend: { data: ['本月', '目標'], textStyle: { color: 'var(--text-secondary)' }, bottom: 0 },
  };

  const factors = [
    { name: '設備效率 OEE', value: 87, target: 90, icon: '⚙️', trend: +2.1 },
    { name: '品質良率', value: 96, target: 98, icon: '✅', trend: +0.5 },
    { name: '準時交貨率 OTD', value: 78, target: 85, icon: '🚚', trend: -1.2 },
    { name: '庫存週轉率達標', value: 92, target: 95, icon: '📦', trend: +1.8 },
    { name: '採購交期達成', value: 94, target: 96, icon: '🛒', trend: +0.8 },
    { name: '供應商綜合評分', value: 88, target: 92, icon: '🏭', trend: -0.3 },
    { name: '製程能力 Cpk≥1.33', value: 83, target: 90, icon: '📊', trend: +1.5 },
    { name: '安全事故零記錄', value: 100, target: 100, icon: '🛡️', trend: 0 },
  ];

  const getColor = (value: number, target: number) => {
    const pct = value / target;
    if (pct >= 0.97) return 'var(--success)';
    if (pct >= 0.90) return 'var(--warning)';
    return 'var(--danger)';
  };

  const overallScore = Math.round(factors.reduce((s, f) => s + f.value / f.target * 100, 0) / factors.length);

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🏥 工廠健康度</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>多維度綜合評估工廠整體運營健康狀況</p>
      </div>

      {/* 整體健康度 */}
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)', display: 'flex', alignItems: 'center', gap: 32, padding: '20px 28px' }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>整體健康度</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: overallScore >= 90 ? 'var(--success)' : overallScore >= 80 ? 'var(--warning)' : 'var(--danger)', lineHeight: 1 }}>{overallScore}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>/ 100 分</div>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: '優秀指標（≥97%）', count: factors.filter(f => f.value / f.target >= 0.97).length, color: 'var(--success)' },
            { label: '良好指標（90-97%）', count: factors.filter(f => { const p = f.value / f.target; return p >= 0.90 && p < 0.97; }).length, color: 'var(--warning)' },
            { label: '待改善（<90%）', count: factors.filter(f => f.value / f.target < 0.90).length, color: 'var(--danger)' },
            { label: '監控項目', count: factors.length, color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-grid">
        {/* 雷達圖 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>多維度健康度雷達</h3></div>
          <ReactECharts option={radarOption} style={{ height: '320px' }} />
        </div>

        {/* 各維度進度 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>各維度達標狀況</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
            {factors.map(f => {
              const color = getColor(f.value, f.target);
              const pct = Math.min(Math.round(f.value / f.target * 100), 100);
              return (
                <div key={f.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.icon} {f.name}</span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: f.trend > 0 ? 'var(--success)' : f.trend < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {f.trend > 0 ? `▲${f.trend}` : f.trend < 0 ? `▼${Math.abs(f.trend)}` : '—'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{f.value}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/{f.target}</span></span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--glass-border)', borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 改善建議 */}
      <div className="glass-panel" style={{ marginTop: 'var(--content-padding)' }}>
        <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>🎯 重點改善方向</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 8 }}>
          {factors
            .filter(f => f.value / f.target < 0.95)
            .sort((a, b) => a.value / a.target - b.value / b.target)
            .slice(0, 3)
            .map((f, i) => {
              const gap = f.target - f.value;
              return (
                <div key={f.name} style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', borderLeft: '4px solid var(--danger)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>優先改善 #{i + 1}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{f.icon} {f.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--danger)' }}>距目標差距：{gap} 點</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    目標：{f.target} | 當前：{f.value} | 達標率：{Math.round(f.value / f.target * 100)}%
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
