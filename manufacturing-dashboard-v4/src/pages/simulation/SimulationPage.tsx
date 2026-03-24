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
  { key: 'value', label: '價值流分析', path: '/simulation/value' },
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
   產能規劃模擬
   ================================================================ */
const CapacityPage: React.FC = () => {
  const [params, setParams] = useState({ lines: 5, shifts: 2, utilization: 85, overtime: 0 });

  const calcCapacity = () => {
    const baseCap = params.lines * params.shifts * 8 * 60 * params.utilization / 100;
    const totalCap = baseCap + params.overtime;
    return { baseCap: Math.round(baseCap), totalCap: Math.round(totalCap), available: Math.round(totalCap * 0.9) };
  };

  const result = calcCapacity();

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🏭 產能規劃模擬</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>模擬生產線配置與產能規劃</p>
      </div>
      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>產線參數</h3></div>
          {[
            { key: 'lines' as const, label: '生產線數量', min: 1, max: 20, unit: ' 條' },
            { key: 'shifts' as const, label: '每日班次', min: 1, max: 3, unit: ' 班' },
            { key: 'utilization' as const, label: '設備利用率', min: 50, max: 100, unit: '%' },
            { key: 'overtime' as const, label: '額外加班產能', min: 0, max: 500, unit: ' 件/日' },
          ].map(p => (
            <div key={p.key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{params[p.key]}{p.unit}</span>
              </div>
              <input type="range" min={p.min} max={p.max} step={1} value={params[p.key]}
                onChange={e => setParams(prev => ({ ...prev, [p.key]: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#3b82f6' }} />
            </div>
          ))}
        </div>
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>產能分析</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {[
              { label: '基礎產能', value: result.baseCap.toLocaleString() + ' 件/日' },
              { label: '含加班總產能', value: result.totalCap.toLocaleString() + ' 件/日' },
              { label: '90% 實際可用', value: result.available.toLocaleString() + ' 件/日' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   價值流分析
   ================================================================ */
const ValueStreamPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('產品A');

  const valueStreamSteps = [
    { name: '訂單接收', time: 2, value: 1, type: 'info' },
    { name: '物料採購', time: 120, value: 8, type: 'wait' },
    { name: '生產排程', time: 4, value: 3, type: 'process' },
    { name: '製造加工', time: 48, value: 42, type: 'value' },
    { name: '品質檢驗', time: 6, value: 5, type: 'quality' },
    { name: '包裝出貨', time: 3, value: 2, type: 'info' },
    { name: '物流運輸', time: 72, value: 0, type: 'wait' },
  ];

  const totalTime = valueStreamSteps.reduce((sum, s) => sum + s.time, 0);
  const valueTime = valueStreamSteps.filter(s => s.type === 'value' || s.type === 'quality').reduce((sum, s) => sum + s.time, 0);
  const waitTime = totalTime - valueTime;

  const productOptions = [
    { id: '產品A', name: '產品 A - 機構件', cycle: '4.2天' },
    { id: '產品B', name: '產品 B - 電子件', cycle: '3.8天' },
    { id: '產品C', name: '產品 C - 模組', cycle: '5.1天' },
  ];

  const getStepColor = (type: string) => {
    switch (type) {
      case 'value': return 'var(--success)';
      case 'quality': return 'var(--accent)';
      case 'wait': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>🔄 價值流分析</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>分析從訂單到交付的價值流與等待時間</p>
      </div>

      {/* 價值流地圖 */}
      <div className="glass-panel" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>價值流地圖</h3>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }}>
            {productOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* 流程視覺化 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, overflowX: 'auto', padding: '10px 0' }}>
          {valueStreamSteps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center', minWidth: 90 }}>
                <div style={{ padding: '12px 8px', borderRadius: 8, background: getStepColor(step.type), marginBottom: 6, minHeight: 70 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{step.type === 'wait' ? '⏳' : step.type === 'value' ? '⚙️' : step.type === 'quality' ? '🔍' : '📋'}</div>
                  <div style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{step.name}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{step.time}h</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>加工: {step.value}h</div>
              </div>
              {i < valueStreamSteps.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 30 }}>
                  <div style={{ width: 20, height: 2, background: 'var(--glass-border)' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>→</span>
                  <div style={{ width: 20, height: 2, background: 'var(--glass-border)' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="main-grid">
        {/* 時間分析 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>時間組成</h3></div>
          <div style={{ marginTop: 16 }}>
            {[
              { label: '總週期時間', value: totalTime, color: 'var(--text-primary)' },
              { label: '增值時間', value: valueTime, color: 'var(--success)' },
              { label: '等待時間', value: waitTime, color: 'var(--warning)' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}h</span>
                </div>
                <div style={{ height: 10, background: 'var(--glass-bg)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${(item.value / totalTime) * 100}%`, height: '100%', background: item.color, borderRadius: 5 }} />
                </div>
              </div>
            ))}
            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 8, marginTop: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>價值/總時間比率</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{(valueTime / totalTime * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* 瓶頸識別 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>瓶頸識別</h3></div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {valueStreamSteps.filter(s => s.type === 'wait').map((step, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, borderLeft: '3px solid var(--warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>⏳ {step.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>{step.time}h</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  佔總時間 {(step.time / totalTime * 100).toFixed(1)}%，建議優化此環節
                </div>
              </div>
            ))}
            <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 8, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>💡 優化建議</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                • 物料採購等待時間過長，建議與供應商簽訂 VMI 協議<br/>
                • 物流運輸環節可整合區域配送中心<br/>
                • 生產排程可採用 JIT 模式減少在製品庫存
              </div>
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
      {subRoute === 'whatif' ? <WhatIfPage /> :
       subRoute === 'capacity' ? <CapacityPage /> :
       subRoute === 'value' ? <ValueStreamPage /> :
       <WhatIfPage />}
    </div>
  );
};

export default SimulationPage;
