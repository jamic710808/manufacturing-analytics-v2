import React, { useState } from 'react';

interface KBItem {
  id: string;
  category: string;
  title: string;
  formula: string;
  desc: string;
  example: string;
}

const kbData: KBItem[] = [
  { id: '1', category: 'OEE', title: 'OEE 整體設備效率', formula: 'OEE = 可用率 × 效能率 × 品質率', desc: '衡量設備實際產出佔理論最大產出的比例，世界級水準 ≥ 85%', example: '可用率 92% × 效能率 97% × 品質率 98% = OEE 87.5%' },
  { id: '2', category: 'OEE', title: '可用率（Availability）', formula: 'A = (計劃運行時間 - 停機時間) / 計劃運行時間', desc: '扣除設備停機時間後的實際可用率', example: '(480分 - 45分) / 480分 = 90.6%' },
  { id: '3', category: 'OEE', title: '效能率（Performance）', formula: 'P = 實際產出 / 理論最大產出', desc: '在設備運行期間實際達到的速率相對於理論速率的比例', example: '實際 450件 / 理論 480件 = 93.75%' },
  { id: '4', category: 'OEE', title: '品質率（Quality）', formula: 'Q = 良品數 / 總產出數', desc: '符合品質要求的產品佔總產出的比例', example: '良品 447件 / 總產出 450件 = 99.3%' },
  { id: '5', category: 'Cpk', title: 'Cpk 製程能力指數', formula: 'Cpk = min[(USL - μ) / 3σ, (μ - LSL) / 3σ]', desc: '衡量製程在規格內的實際能力，考慮製程偏移', example: 'USL=10, LSL=4, μ=7.2, σ=0.8 → Cpk = min[1.17, 1.33] = 1.17' },
  { id: '6', category: 'Cpk', title: 'Cp 製程精密度', formula: 'Cp = (USL - LSL) / 6σ', desc: '製程潛在能力，不考慮製程偏移', example: '(10-4) / (6×0.8) = 1.25' },
  { id: '7', category: '庫存', title: '庫存週轉率', formula: '週轉率 = 銷貨成本 / 平均庫存金額', desc: '一年內庫存周轉的次數，越高代表庫存管理越高效', example: '年度銷貨成本 $12M / 平均庫存 $1.43M = 8.4 次/年' },
  { id: '8', category: '庫存', title: '安全庫存', formula: 'SS = Z × σ_d × √LT', desc: 'Z=服務水準係數, σ_d=需求標準差, LT=前置時間（天）', example: '服務水準95%(Z=1.65) × 標準差12 × √7 = 52.4件' },
  { id: '9', category: '庫存', title: '再訂購點（ROP）', formula: 'ROP = 平均日需求 × 前置時間 + 安全庫存', desc: '當庫存降至此水位時應發出採購單', example: '平均日需求50件 × 7天 + 安全庫存53 = 403件' },
  { id: '10', category: 'DSI', title: '庫存供應天數 DSI', formula: 'DSI = 庫存數量 / 平均日需求', desc: '現有庫存可維持的供應天數', example: '庫存4200件 / 平均日需求98件 = 42.9天' },
  { id: '11', category: '採購', title: 'OTD 準時交貨率', formula: 'OTD = 準時到貨 PO 數 / 總 PO 數', desc: '衡量供應商交期達成能力，目標 ≥ 95%', example: '準時 94筆 / 總計 100筆 = 94%' },
  { id: '12', category: '採購', title: '採購降本率', formula: '降本率 = (原始採購成本 - 實際採購成本) / 原始採購成本', desc: '採購議價與優化所達成的成本節省比例', example: '($12.8M - $12.5M) / $12.8M = 2.3%' },
];

const categories = ['全部', ...Array.from(new Set(kbData.map(k => k.category)))];

const KBPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('全部');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = kbData.filter(k =>
    (cat === '全部' || k.category === cat) &&
    (search === '' || k.title.includes(search) || k.formula.includes(search) || k.desc.includes(search))
  );

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>📚 指標知識庫</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>OEE、Cpk、庫存指標、採購指標公式與說明</p>
      </div>
      <div className="glass-panel" style={{ marginBottom: 'var(--content-padding)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="搜尋指標..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: cat === c ? 'var(--accent)' : 'var(--glass-bg)', color: cat === c ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(item => {
          const open = expanded === item.id;
          return (
            <div key={item.id} className="glass-panel" style={{ cursor: 'pointer', padding: '16px 20px' }} onClick={() => setExpanded(open ? null : item.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-info" style={{ flexShrink: 0 }}>{item.category}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.formula}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
              </div>
              {open && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>公式</div>
                    <code style={{ fontSize: 14, color: 'var(--accent)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 6, display: 'block', fontFamily: 'monospace' }}>{item.formula}</code>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>說明</div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>計算範例</div>
                    <div style={{ fontSize: 13, color: 'var(--success)', background: 'var(--success-bg)', padding: '8px 12px', borderRadius: 6 }}>💡 {item.example}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>無符合條件的指標</div>
        )}
      </div>
    </div>
  );
};

export default KBPage;
