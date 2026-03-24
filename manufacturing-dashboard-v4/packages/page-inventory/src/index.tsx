/**
 * page-inventory - Single-SPA Entry Point
 * 庫存分析頁面
 *
 * V4 新功能：
 * - 庫存週轉率追蹤
 * - 庫存分佈（按類別/倉庫）
 * - 呆滯庫存預警
 * - 庫存健康度儀表板
 */
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import InventoryPage from './InventoryPage';
import './styles/inventory.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: InventoryPage,
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
