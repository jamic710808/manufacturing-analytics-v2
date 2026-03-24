/**
 * page-procurement - Single-SPA Entry Point
 * 採購分析頁面
 *
 * V4 新功能：
 * - 採購金額趨勢
 * - 供應商分佈分析
 * - 交期達成率追蹤
 * - 採購效率指標
 */
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import ProcurementPage from './ProcurementPage';
import './styles/procurement.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ProcurementPage,
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
