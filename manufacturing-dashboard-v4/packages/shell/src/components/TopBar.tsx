/**
 * TopBar.tsx - 頂部工具列元件
 *
 * 功能：
 * - 系統健康度指標
 * - 主題切換
 * - 通知中心
 * - 用戶資訊
 */
import React from 'react';

interface TopBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

/** 健康度狀態類型 */
interface HealthStatus {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'danger';
}

const TopBar: React.FC<TopBarProps> = ({
  theme,
  onToggleTheme,
  onToggleSidebar,
}) => {
  /** 系統健康度指標（示例） */
  const healthIndicators: HealthStatus[] = [
    { label: 'OEE', value: 87, status: 'good' },
    { label: '品質', value: 96, status: 'good' },
    { label: 'OTD', value: 78, status: 'warning' },
    { label: '庫存', value: 92, status: 'good' },
  ];

  /** 取得狀態顏色 */
  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'good':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'danger':
        return 'var(--danger)';
    }
  };

  return (
    <header
      className="topbar"
      style={styles.topbar}
    >
      {/* 左側：功能按鈕 */}
      <div style={styles.left}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost"
          style={styles.iconBtn}
          title="切換側邊欄"
        >
          ☰
        </button>

        {/* 麵包屑 */}
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbItem}>首頁</span>
          <span style={styles.breadcrumbSep}>/</span>
          <span style={styles.breadcrumbItem}>工廠總覽</span>
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
              <span
                style={{
                  ...styles.healthValue,
                  color: getStatusColor(indicator.status),
                }}
              >
                {indicator.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 右側：工具按鈕 */}
      <div style={styles.right}>
        {/* 主題切換 */}
        <button
          onClick={onToggleTheme}
          className="btn btn-ghost"
          style={styles.iconBtn}
          title={theme === 'dark' ? '切換淺色主題' : '切換深色主題'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* 通知 */}
        <button
          className="btn btn-ghost"
          style={styles.iconBtn}
          title="通知中心"
        >
          🔔
          <span style={styles.badge}>3</span>
        </button>

        {/* 匯出 */}
        <button
          className="btn btn-ghost"
          style={styles.iconBtn}
          title="匯出報告"
        >
          📤
        </button>

        {/* 用戶頭像 */}
        <div style={styles.userAvatar}>
          👤
        </div>
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
    transition: 'background var(--transition-normal)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBtn: {
    padding: '8px 12px',
    fontSize: '18px',
    position: 'relative',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  breadcrumbItem: {
    color: 'var(--text-primary)',
  },
  breadcrumbSep: {
    color: 'var(--text-muted)',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
  },
  healthBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '8px 16px',
    background: 'var(--glass-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-border)',
  },
  healthItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  healthLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  healthProgress: {
    width: '60px',
    height: '6px',
    background: 'var(--glass-bg)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width var(--transition-normal), background-color var(--transition-normal)',
  },
  healthValue: {
    fontSize: '13px',
    fontWeight: 700,
    minWidth: '36px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    fontSize: '10px',
    fontWeight: 700,
    color: 'white',
    background: 'var(--danger)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    cursor: 'pointer',
    marginLeft: '8px',
  },
};

export default TopBar;
