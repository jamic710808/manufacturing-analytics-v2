import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { allAlerts, AlertLevel } from '../data/alertData';
import { pathToModuleId } from '../utils/buildPageContext';
import { getReportData, ReportId } from '../data/reportData';
import { generatePDF, generateExcel, downloadBlob } from '../utils/exportUtils';
import html2canvas from 'html2canvas';

interface TopBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onOpenAI: () => void;
}

interface HealthStatus {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'danger';
}

interface DropdownPos {
  top: number;
  right: number;
}

const getBreadcrumb = (pathname: string): string => {
  const map: Record<string, string> = {
    '/overview': '管理駕駛艙',
    '/health': '工廠健康度',
    '/alert': '異常預警中心',
    '/inventory': '庫存分析',
    '/inventory/efficiency': '庫存效能儀表板',
    '/inventory/risk': '庫存風險分析',
    '/inventory/safety': '安全庫存建議',
    '/inventory/batch': '批次追蹤分析',
    '/procurement': '採購分析',
    '/procurement/spend': '採購支出分析',
    '/procurement/price': '價格與降本',
    '/procurement/delivery': '採購時效與交期',
    '/procurement/optimize': '採購優化建議',
    '/supplier': '供應商管理',
    '/supplier/score': '供應商評分卡',
    '/supplier/risk': '供應鏈風險矩陣',
    '/supplier/capacity': '產能與風險評估',
    '/supplier/compliance': '合規與開發',
    '/production': '生產與品質',
    '/production/yield': '生產數據與良率',
    '/production/oee': 'OEE 設備效率',
    '/production/cpk': '製程能力分析',
    '/production/quality': '品質異常與停機',
    '/production/iqc': '三大品質檢驗',
  };
  return map[pathname] ?? '儀表板';
};

const healthIndicators: HealthStatus[] = [
  { label: 'OEE', value: 87, status: 'good' },
  { label: '品質', value: 96, status: 'good' },
  { label: 'OTD', value: 78, status: 'warning' },
  { label: '庫存', value: 92, status: 'good' },
];

const LEVEL_ORDER: Record<AlertLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const LEVEL_COLOR: Record<AlertLevel, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6',
};
const LEVEL_LABEL: Record<AlertLevel, string> = {
  critical: '緊急', high: '高', medium: '中', low: '低',
};

const MODULE_TO_REPORT: Record<string, ReportId> = {
  overview: 'overview', inventory: 'inventory',
  production: 'production', cost: 'cost', supplier: 'supplier',
};
const PAGE_LABELS: Record<string, string> = {
  overview: '管理駕駛艙', inventory: '庫存分析', procurement: '採購分析',
  supplier: '供應商管理', production: '生產與品質', cost: '成本分析',
};

const NOTIF_READ_KEY = 'mfgDashReadAlerts';

const TopBar: React.FC<TopBarProps> = ({ theme, onToggleTheme, onToggleSidebar, onOpenAI }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useData();

  // ── 通知中心 ───────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPos, setNotifPos] = useState<DropdownPos>({ top: 0, right: 0 });
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem(NOTIF_READ_KEY);
      return new Set(s ? JSON.parse(s) : []);
    } catch { return new Set(); }
  });

  // ── 匯出報告 ───────────────────────────────────────────────────
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPos, setExportPos] = useState<DropdownPos>({ top: 0, right: 0 });
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'png' | null>(null);

  // 觸發按鈕 ref（用於計算 portal 座標）
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  // Dropdown 內容 ref（用於 outside-click 判斷）
  const notifDropRef = useRef<HTMLDivElement>(null);
  const exportDropRef = useRef<HTMLDivElement>(null);

  // outside-click 關閉（portal 渲染在 body，需分開判斷）
  useEffect(() => {
    if (!notifOpen && !exportOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inNotif = notifBtnRef.current?.contains(target) || notifDropRef.current?.contains(target);
      const inExport = exportBtnRef.current?.contains(target) || exportDropRef.current?.contains(target);
      if (!inNotif && !inExport) {
        setNotifOpen(false);
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen, exportOpen]);

  // ── 通知中心邏輯 ───────────────────────────────────────────────
  const activeAlerts = allAlerts
    .filter(a => a.status === 'active')
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
    .slice(0, 6);

  const unreadCount = allAlerts.filter(a =>
    (a.level === 'critical' || a.level === 'high') &&
    a.status === 'active' &&
    !readIds.has(a.id)
  ).length;

  const markRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };
  const markAllRead = () => {
    const ids = allAlerts.filter(a => a.status === 'active').map(a => a.id);
    setReadIds(prev => {
      const next = new Set([...prev, ...ids]);
      try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const openNotif = () => {
    if (notifBtnRef.current) {
      const r = notifBtnRef.current.getBoundingClientRect();
      setNotifPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setNotifOpen(v => !v);
    setExportOpen(false);
  };

  // ── 匯出報告邏輯 ───────────────────────────────────────────────
  const moduleId = pathToModuleId(location.pathname);
  const exportLabel = moduleId ? (PAGE_LABELS[moduleId] ?? '儀表板') : '儀表板';

  const openExport = () => {
    if (exporting) return;
    if (exportBtnRef.current) {
      const r = exportBtnRef.current.getBoundingClientRect();
      setExportPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setExportOpen(v => !v);
    setNotifOpen(false);
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'png') => {
    setExporting(format);
    setExportOpen(false);
    const today = new Date().toISOString().slice(0, 10);
    const slug = moduleId ?? 'dashboard';
    try {
      if (format === 'png') {
        const el = document.querySelector('main') as HTMLElement | null;
        if (!el) return;
        const canvas = await html2canvas(el, { scale: 0.9, useCORS: true, logging: false });
        await new Promise<void>(resolve => {
          canvas.toBlob(blob => {
            if (blob) downloadBlob(blob, `截圖_${slug}_${today}.png`);
            resolve();
          }, 'image/png');
        });
      } else {
        const reportId = moduleId ? MODULE_TO_REPORT[moduleId] : undefined;
        const sections = getReportData(reportId ? [reportId] : ['overview'], data);
        const dateRange = { start: '2025-01-01', end: today };
        if (format === 'pdf') {
          const blob = await generatePDF(sections, dateRange);
          downloadBlob(blob, `報告_${slug}_${today}.pdf`);
        } else {
          const blob = generateExcel(sections, dateRange);
          downloadBlob(blob, `報告_${slug}_${today}.xlsx`);
        }
      }
    } catch (e) {
      console.error('匯出失敗', e);
    } finally {
      setExporting(null);
    }
  };

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'good': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
    }
  };

  // ── Portal 內容 ────────────────────────────────────────────────

  const notifDropdown = notifOpen ? ReactDOM.createPortal(
    <div
      ref={notifDropRef}
      style={{ ...portalBase, top: notifPos.top, right: notifPos.right, width: 320 }}
    >
      {/* 頭部 */}
      <div style={ddHeader}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>🔔 通知中心</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={markAllRead}
            style={ghostBtn}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >全部已讀</button>
          <button onClick={() => setNotifOpen(false)} style={{ ...ghostBtn, fontSize: 15, lineHeight: 1 }}>✕</button>
        </div>
      </div>

      {/* 清單 */}
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {activeAlerts.length === 0
          ? <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>✅ 沒有待處理警示</div>
          : activeAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => { markRead(alert.id); navigate('/alert'); setNotifOpen(false); }}
              style={{
                display: 'flex', gap: 10, padding: '10px 14px',
                borderBottom: '1px solid var(--glass-border)',
                cursor: 'pointer', opacity: readIds.has(alert.id) ? 0.42 : 1,
                transition: 'background 0.15s, opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                background: LEVEL_COLOR[alert.level],
                boxShadow: `0 0 6px ${LEVEL_COLOR[alert.level]}99`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {alert.title}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{alert.time}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{alert.module}</span>
                  {!readIds.has(alert.id) && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: LEVEL_COLOR[alert.level] + '22', color: LEVEL_COLOR[alert.level], fontWeight: 700 }}>
                      {LEVEL_LABEL[alert.level]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* 頁腳 */}
      <div
        onClick={() => { navigate('/alert'); setNotifOpen(false); }}
        style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        查看全部警示 →
      </div>
    </div>,
    document.body
  ) : null;

  const exportDropdown = exportOpen ? ReactDOM.createPortal(
    <div
      ref={exportDropRef}
      style={{ ...portalBase, top: exportPos.top, right: exportPos.right, width: 180 }}
    >
      <div style={{ ...ddHeader, padding: '9px 14px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
          📤 匯出 · {exportLabel}
        </span>
      </div>
      {(['pdf', 'excel', 'png'] as const).map(fmt => {
        const labels = { pdf: '📄 匯出 PDF', excel: '📊 匯出 Excel', png: '🖼 截圖（PNG）' };
        return (
          <button
            key={fmt}
            disabled={exporting !== null}
            onClick={() => handleExport(fmt)}
            style={{
              display: 'block', width: '100%', padding: '10px 14px',
              textAlign: 'left', fontSize: 12, fontWeight: 500,
              color: exporting !== null ? 'var(--text-muted)' : 'var(--text-primary)',
              background: 'transparent', border: 'none',
              borderBottom: '1px solid var(--glass-border)',
              cursor: exporting !== null ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!exporting) e.currentTarget.style.background = 'var(--bg-surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {labels[fmt]}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <header className="topbar" style={styles.topbar}>
        {/* 左側 */}
        <div style={styles.left}>
          <button onClick={onToggleSidebar} className="btn btn-ghost" style={styles.iconBtn} title="切換側邊欄">☰</button>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbMuted}>首頁</span>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>{getBreadcrumb(location.pathname)}</span>
          </div>
        </div>

        {/* 中間：健康度 */}
        <div style={styles.center}>
          <div style={styles.healthBar}>
            {healthIndicators.map(ind => (
              <div key={ind.label} style={styles.healthItem}>
                <span style={styles.healthLabel}>{ind.label}</span>
                <div style={styles.healthProgress}>
                  <div style={{ ...styles.healthFill, width: `${ind.value}%`, backgroundColor: getStatusColor(ind.status) }} />
                </div>
                <span style={{ ...styles.healthValue, color: getStatusColor(ind.status) }}>{ind.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右側 */}
        <div style={styles.right}>
          <button onClick={onToggleTheme} className="btn btn-ghost" style={styles.iconBtn} title={theme === 'dark' ? '切換淺色主題' : '切換深色主題'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* 🔔 通知 */}
          <button
            ref={notifBtnRef}
            className="btn btn-ghost"
            style={{ ...styles.iconBtn, position: 'relative' }}
            title="通知中心"
            onClick={openNotif}
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* 📤 匯出 */}
          <button
            ref={exportBtnRef}
            className="btn btn-ghost"
            style={{ ...styles.iconBtn, opacity: exporting ? 0.6 : 1 }}
            title={exporting ? '匯出中…' : '匯出報告'}
            onClick={openExport}
          >
            {exporting ? '⏳' : '📤'}
          </button>

          {/* 🤖 AI */}
          <button
            onClick={onOpenAI}
            className="btn btn-ghost"
            style={{ ...styles.iconBtn, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', color: 'var(--purple)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-sm)' }}
            title="AI 製造分析師"
          >🤖</button>

          <div style={styles.userAvatar}>👤</div>
        </div>
      </header>

      {/* Portal dropdowns — 掛在 document.body，不受 TopBar stacking context 影響 */}
      {notifDropdown}
      {exportDropdown}
    </>
  );
};

// ── Portal dropdown 基礎樣式（position: fixed 逃出所有 stacking context）
const portalBase: React.CSSProperties = {
  position: 'fixed',
  zIndex: 9999,
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  overflow: 'hidden',
};

const ddHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '11px 14px', borderBottom: '1px solid var(--glass-border)',
};

const ghostBtn: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-muted)', background: 'none',
  border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4,
  transition: 'color 0.15s',
};

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 'var(--topbar-height)', padding: '0 var(--content-padding)',
    background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--glass-border)',
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconBtn: { padding: '8px 12px', fontSize: '18px' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  breadcrumbMuted: { color: 'var(--text-muted)' },
  breadcrumbSep: { color: 'var(--text-muted)' },
  breadcrumbCurrent: { color: 'var(--text-primary)', fontWeight: 500 },
  center: { display: 'flex', alignItems: 'center' },
  healthBar: {
    display: 'flex', alignItems: 'center', gap: '24px',
    padding: '8px 16px', background: 'var(--glass-bg)',
    borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)',
  },
  healthItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  healthLabel: { fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  healthProgress: { width: '60px', height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' },
  healthFill: { height: '100%', borderRadius: '3px', transition: 'width var(--transition-normal)' },
  healthValue: { fontSize: '13px', fontWeight: 700, minWidth: '36px' },
  right: { display: 'flex', alignItems: 'center', gap: '8px' },
  badge: {
    position: 'absolute', top: '2px', right: '2px',
    minWidth: '16px', height: '16px', padding: '0 4px',
    fontSize: '10px', fontWeight: 700, color: 'white',
    background: 'var(--danger)', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--accent)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '16px', cursor: 'pointer', marginLeft: '8px',
  },
};

export default TopBar;
