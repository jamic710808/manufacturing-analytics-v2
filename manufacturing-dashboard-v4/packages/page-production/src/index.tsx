/**
 * page-production - Single-SPA Entry Point
 * 生產與品質分析頁面
 *
 * V4 新功能：
 * - OEE 設備效率儀表板
 * - 生產數據與良率分析
 * - 製程能力分析 (Cpk)
 * - 品質異常與停機追蹤
 */
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import ProductionPage from './ProductionPage';
import './styles/production.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ProductionPage,
  errorBoundary(err, props) {
    return (
      <div className="error-boundary">
        <h2>載入錯誤</h2>
        <p>頁面元件發生錯誤，請重新整理。</p>
        <pre style={{ fontSize: '12px', color: 'var(--danger)' }}>
          {err?.message}
        </pre>
      </div>
    );
  },
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;

export default lifecycles;
