/**
 * page-overview - Single-SPA Entry Point
 * 工廠總覽頁面
 *
 * V4 新功能：
 * - 異常警訊 Top 5
 * - 工廠健康度分數
 * - 即時 OEE/品質/OTD/庫存 指標卡
 */
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import OverviewPage from './OverviewPage';
import './styles/overview.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: OverviewPage,
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
