import React, { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import AIChatPanel from '../components/ai/AIChatPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

type ThemeMode = 'dark' | 'light';

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAIPanelOpen] = useState(false);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.body.classList.toggle('light-mode', next === 'light');
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar theme={theme} onToggleTheme={toggleTheme} onToggleSidebar={toggleSidebar} onOpenAI={() => setAIPanelOpen(true)} />
        <div className="page-content">
          {children}
        </div>
        <div className="page-footer-copyright">
          © 2026 KENLIU(劉炳祥) 版權所有 · 設計與開發由 Claude Code 及 MiniMax 協同製作
        </div>
      </main>

      <AIChatPanel isOpen={aiPanelOpen} onClose={() => setAIPanelOpen(false)} />
    </div>
  );
};

export default MainLayout;
