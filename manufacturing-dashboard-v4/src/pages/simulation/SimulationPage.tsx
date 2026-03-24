import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useSimSubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/simulation\/?(.*)$/);
  return match ? (match[1] || 'whatif') : 'whatif';
};

const subTabs = [
  { key: 'whatif', label: 'What-If 情境模擬', path: '/simulation/whatif' },
  { key: 'capacity', label: '產能規劃模擬', path: '/simulation/capacity' },
];

/* ================================================================
   What-If 情境模擬
   ================================================================ */
const WhatIfPage: React.FC = () => {
  const [params, setParams] = useState({ demand: 1580, defectRate: 2.8, oee: 87, leadTime: 14 });

  const calcOutput = () => {
    const effectiveCap = 2000 * (params.oee / 100);
    const goodOutput = Math.round(params.demand * (1 - params.defectRate / 100));
    const onTimeRisk = params.leadTime > 14 ? '高' : params.leadTime > 10 ? '中' : '低';
    const cost = goodOutput * 11000 * (1 + (params.defectRate - 2) * 0.01);
    return { effectiveCap: Math.round(effectiveCap), goodOutput, onTimeRisk, cost: Math.round(cost) };
  };

  const result = calcOutput();

  const slider = (key: keyof typeof params, label: string, min: number, max: number, step: number, unit: string) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{params[key]}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={params[key]}
        onChange={e => setParams(p => ({ ...p, [key]: Number(e.target.value) }))}
        style={{ width: '100%', accentColor: '#3b82f6' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🎮 What-If 情境模擬</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>調整關鍵參數，即時計算對產出、成本、交期的影響</p>
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>參數調整</h3></div>
          <div style={{ marginTop: 16 }}>
            {slider('demand', '需求量', 800, 2500, 10, ' 件')}
            {slider('defectRate', '不良率', 0.5, 8, 0.1, '%')}
            {slider('oee', 'OEE 設備效率', 60, 99, 1, '%')}
            {slider('leadTime', '供應前置時間', 3, 30, 1, ' 天')}
          </div>
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>模擬結果</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {[
              { label: '有效產能（件/月）', value: result.effectiveCap.toLocaleString(), color: 'var(--accent)' },
              { label: '預計良品產出', value: result.goodOutput.toLocaleString() + ' 件', color: result.goodOutput >= params.demand ? 'var(--success)' : 'var(--danger)' },
              { label: '交期風險', value: result.onTimeRisk, color: result.onTimeRisk === '低' ? 'var(--success)' : result.onTimeRisk === '中' ? 'var(--warning)' : 'var(--danger)' },
              { label: '月度成本預估', value: '$' + (result.cost / 1e6).toFixed(2) + 'M', color: 'var(--text-primary)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>AI 場景評估</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {result.goodOutput >= params.demand
                ? `✅ 在當前參數下，產能可滿足需求。OEE ${params.oee}% 可維持良好利潤水準。`
                : `⚠️ 當前設定下產能不足以滿足需求，良品缺口 ${(params.demand - result.goodOutput).toLocaleString()} 件。建議提高 OEE 或降低不良率。`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   主頁面
   ================================================================ */
const SimulationPage: React.FC = () => {
  const subRoute = useSimSubRoute();
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
      {subRoute === 'whatif' ? <WhatIfPage /> : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>產能規劃模擬開發中</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>此功能將在下一個版本上線</div>
        </div>
      )}
    </div>
  );
};

export default SimulationPage;
