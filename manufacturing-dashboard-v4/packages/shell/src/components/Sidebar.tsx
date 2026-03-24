/**
 * Sidebar.tsx - 側邊欄導航元件
 *
 * 功能：
 * - 群組化導航選單
 * - 折疊/展開狀態
 * - 當前頁面指示
 */
import React from 'react';

interface SidebarProps {
  collapsed: boolean;
  activeGroup: string;
  onNavClick: (group: string) => void;
  onToggleCollapse: () => void;
}

/** 導航群組與項目 */
const navigationGroups = [
  {
    group: '工廠總覽',
    items: [
      { id: 'overview', label: '管理駕駛艙', icon: '📊', path: '/overview' },
      { id: 'health', label: '工廠健康度', icon: '🏭', path: '/health' },
      { id: 'alert', label: '異常預警中心', icon: '🚨', path: '/alert' },
    ],
  },
  {
    group: '庫存分析',
    items: [
      { id: 'inv-efficiency', label: '庫存效能儀表板', icon: '📦', path: '/inventory/efficiency' },
      { id: 'inv-risk', label: '庫存風險分析', icon: '⚠️', path: '/inventory/risk' },
      { id: 'inv-safety', label: '安全庫存建議', icon: '🛡️', path: '/inventory/safety' },
      { id: 'inv-batch', label: '批次追蹤分析', icon: '🔍', path: '/inventory/batch' },
    ],
  },
  {
    group: '採購分析',
    items: [
      { id: 'procurement-spend', label: '採購支出分析', icon: '💰', path: '/procurement/spend' },
      { id: 'procurement-price', label: '價格與降本', icon: '📉', path: '/procurement/price' },
      { id: 'procurement-delivery', label: '採購時效與交期', icon: '📅', path: '/procurement/delivery' },
      { id: 'procurement-optimize', label: '採購優化建議', icon: '⚡', path: '/procurement/optimize' },
    ],
  },
  {
    group: '供應商分析',
    items: [
      { id: 'supplier-score', label: '供應商評分卡', icon: '🏆', path: '/supplier/score' },
      { id: 'supplier-risk', label: '供應鏈風險矩陣', icon: '⚡', path: '/supplier/risk' },
      { id: 'supplier-capacity', label: '產能與風險評估', icon: '📈', path: '/supplier/capacity' },
      { id: 'supplier-compliance', label: '合規與開發', icon: '📋', path: '/supplier/compliance' },
    ],
  },
  {
    group: '成本分析',
    items: [
      { id: 'cost-bom', label: 'BOM 成本結構', icon: '🏗️', path: '/cost/bom' },
      { id: 'cost-structure', label: '成本組成結構', icon: '📊', path: '/cost/structure' },
      { id: 'cost-variance', label: '成本差異追蹤', icon: '📉', path: '/cost/variance' },
      { id: 'cost-optimize', label: '成本優化建議', icon: '💡', path: '/cost/optimize' },
    ],
  },
  {
    group: '生產與品質',
    items: [
      { id: 'production-yield', label: '生產數據與良率', icon: '📈', path: '/production/yield' },
      { id: 'production-oee', label: 'OEE 設備效率', icon: '⚙️', path: '/production/oee' },
      { id: 'production-cpk', label: '製程能力分析', icon: '🎯', path: '/production/cpk' },
      { id: 'production-quality', label: '品質異常與停機', icon: '🔧', path: '/production/quality' },
      { id: 'production-iqc', label: '三大品質檢驗', icon: '✅', path: '/production/iqc' },
    ],
  },
  {
    group: 'AI 分析',
    items: [
      { id: 'ai-anomaly', label: 'AI 異常偵測總覽', icon: '🤖', path: '/ai/anomaly' },
      { id: 'ai-demand', label: '需求預測與安全庫存', icon: '📊', path: '/ai/demand' },
      { id: 'ai-recommend', label: 'AI 建議與模型監控', icon: '💡', path: '/ai/recommend' },
    ],
  },
  {
    group: '情境模擬',
    items: [
      { id: 'sim-whatif', label: '情境模擬器', icon: '🔮', path: '/simulation/whatif' },
      { id: 'sim-vsm', label: '價值流分析', icon: '📉', path: '/simulation/vsm' },
    ],
  },
  {
    group: '駕駛艙與標竿',
    items: [
      { id: 'cockpit-iron', label: '核心三角儀表', icon: '🔺', path: '/cockpit/iron' },
      { id: 'cockpit-benchmark', label: '標竿對比', icon: '🎯', path: '/cockpit/benchmark' },
      { id: 'cockpit-cashflow', label: '資金佔用分析', icon: '💵', path: '/cockpit/cashflow' },
    ],
  },
  {
    group: '報告與設定',
    items: [
      { id: 'report-generator', label: '報告生成器', icon: '📄', path: '/report/generator' },
      { id: 'report-task', label: '異常任務與討論', icon: '💬', path: '/report/task' },
      { id: 'report-settings', label: '系統設定', icon: '⚙️', path: '/report/settings' },
    ],
  },
  {
    group: '知識庫',
    items: [
      { id: 'kb-dax', label: 'DAX 知識庫', icon: '📚', path: '/kb/dax' },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  activeGroup,
  onNavClick,
  onToggleCollapse,
}) => {
  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        transition: 'width var(--transition-normal)',
      }}
    >
      {/* Logo 區 */}
      <div className="sidebar-header" style={styles.header}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>🏭</span>
          {!collapsed && <span style={styles.title}>製造業 V4</span>}
        </div>
        <button
          onClick={onToggleCollapse}
          className="btn btn-ghost"
          style={styles.collapseBtn}
          title={collapsed ? '展開側邊欄' : '折疊側邊欄'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* 導航選單 */}
      <nav style={styles.nav}>
        {navigationGroups.map(group => (
          <div key={group.group} style={styles.group}>
            {/* 群組標題 */}
            <button
              onClick={() => onNavClick(group.group)}
              style={{
                ...styles.groupTitle,
                opacity: activeGroup === group.group ? 1 : 0.6,
              }}
            >
              {!collapsed && <span>{group.group}</span>}
              {collapsed && <span title={group.group}>{group.items[0]?.icon}</span>}
            </button>

            {/* 群組項目 */}
            {!collapsed && activeGroup === group.group && (
              <div style={styles.items}>
                {group.items.map(item => (
                  <a
                    key={item.id}
                    href={item.path}
                    style={styles.item}
                    onClick={e => {
                      e.preventDefault();
                      window.history.pushState(null, '', item.path);
                    }}
                  >
                    <span style={styles.itemIcon}>{item.icon}</span>
                    <span style={styles.itemLabel}>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 底部版權 */}
      <div style={styles.footer}>
        {!collapsed && (
          <span style={styles.copyright}>
            © {currentYear} Manufacturing Analytics
          </span>
        )}
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 8px',
    borderBottom: '1px solid var(--glass-border)',
    marginBottom: '16px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '28px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  },
  collapseBtn: {
    padding: '8px',
    fontSize: '16px',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 8px',
  },
  group: {
    marginBottom: '8px',
  },
  groupTitle: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'left',
  },
  items: {
    marginLeft: '8px',
    marginTop: '4px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
  },
  itemIcon: {
    fontSize: '16px',
    width: '24px',
    textAlign: 'center',
  },
  itemLabel: {
    whiteSpace: 'nowrap',
  },
  footer: {
    padding: '16px 8px',
    borderTop: '1px solid var(--glass-border)',
    textAlign: 'center',
  },
  copyright: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
};

export default Sidebar;
