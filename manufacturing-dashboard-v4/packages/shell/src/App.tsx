/**
 * App.tsx - Shell 主應用程式
 *
 * 包含：
 * - 側邊欄導航
 * - 頂部工具列
 * - 主內容區域（Single-SPA 微前端容器）
 */
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import './styles/global.css';

/** 導航項目類型 */
interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  group: string;
}

/** 側邊欄折疊狀態 */
interface SidebarState {
  collapsed: boolean;
  activeGroup: string;
}

/** 主題模式 */
type ThemeMode = 'dark' | 'light';

const App: React.FC = () => {
  // 主題狀態
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // 側邊欄狀態
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    collapsed: false,
    activeGroup: '工廠總覽',
  });

  // 當前年份（用於版權）
  const currentYear = new Date().getFullYear();

  /** 切換主題 */
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      document.body.classList.toggle('light-mode', newTheme === 'light');
      return newTheme;
    });
  }, []);

  /** 切換側邊欄折疊 */
  const toggleSidebar = useCallback(() => {
    setSidebarState(prev => ({
      ...prev,
      collapsed: !prev.collapsed,
    }));
  }, []);

  /** 處理導航點擊 */
  const handleNavClick = useCallback((group: string) => {
    setSidebarState(prev => ({
      ...prev,
      activeGroup: group,
    }));
  }, []);

  return (
    <div className="app-layout">
      {/* 側邊欄 */}
      <Sidebar
        collapsed={sidebarState.collapsed}
        activeGroup={sidebarState.activeGroup}
        onNavClick={handleNavClick}
        onToggleCollapse={toggleSidebar}
      />

      {/* 主內容區 */}
      <main
        className={`main-content ${sidebarState.collapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* 頂部工具列 */}
        <TopBar
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={toggleSidebar}
        />

        {/* 頁面內容 - Single-SPA 微前端容器 */}
        <div className="page-content">
          <div id="single-spa-container">
            {/* Single-SPA 會在這裡掛載微前端應用 */}
            <div className="micro-frontend-loading">
              <div className="spinner" />
              <span style={{ marginLeft: '12px' }}>載入中...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
