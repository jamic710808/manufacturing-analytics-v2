/**
 * page-supplier - Single-SPA Entry Point
 * 供應商管理頁面
 *
 * V4 新功能：
 * - 供應商評分卡
 * - 供應商風險評估
 * - 合作關係分析
 */
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import SupplierPage from './SupplierPage';
import './styles/supplier.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: SupplierPage,
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
