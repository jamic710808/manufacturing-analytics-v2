import React from 'react';
import { useLocation } from 'react-router-dom';

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

/** 根據路徑取得麵包屑標籤 */
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

const TopBar: React.FC<TopBarProps> = ({ theme, onToggleTheme, onToggleSidebar, onOpenAI }) => {
  const location = useLocation();

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'good': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
    }
  };

  return (
    <header className="topbar" style={styles.topbar}>
      {/* 左側：功能按鈕 + 麵包屑 */}
      <div style={styles.left}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost"
          style={styles.iconBtn}
          title="切換側邊欄"
        >
          ☰
        </button>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbMuted}>首頁</span>
          <span style={styles.breadcrumbSep}>/</span>
          <span style={styles.breadcrumbCurrent}>{getBreadcrumb(location.pathname)}</span>
        </div>
      </div>

      {/* 中間：系統健康度 */}
      <div style={styles.center}>
        <div style={styles.healthBar}>
          {healthIndicators.map(indicator => (
            <div key={indicator.label} style={styles.healthItem}>
              <span style={styles.healthLabel}>{indicator.label}</span>
              <div style={styles.healthProgress}>
                <div
                  style={{
                    ...styles.healthFill,
                    width: `${indicator.value}%`,
                    backgroundColor: getStatusColor(indicator.status),
                  }}
                />
              </div>
              <span style={{ ...styles.healthValue, color: getStatusColor(indicator.status) }}>
                {indicator.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 右側：工具按鈕 */}
      <div style={styles.right}>
        <button
          onClick={onToggleTheme}
          className="btn btn-ghost"
          style={styles.iconBtn}
          title={theme === 'dark' ? '切換淺色主題' : '切換深色主題'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-ghost" style={{ ...styles.iconBtn, position: 'relative' }} title="通知中心">
          🔔
          <span style={styles.badge}>3</span>
        </button>
        <button className="btn btn-ghost" style={styles.iconBtn} title="匯出報告">📤</button>
        <button
          onClick={onOpenAI}
          className="btn btn-ghost"
          style={{ ...styles.iconBtn, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', color: 'var(--purple)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-sm)' }}
          title="AI 製造分析師"
        >
          🤖
        </button>
        <div style={styles.userAvatar}>👤</div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'var(--topbar-height)',
    padding: '0 var(--content-padding)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--glass-border)',
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
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '8px 16px',
    background: 'var(--glass-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-border)',
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
