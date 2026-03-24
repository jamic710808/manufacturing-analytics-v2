/**
 *  Shell Host - Single-SPA Entry Point
 *  製造業分析儀表板 V4
 *
 *  This is the host application that mounts all micro-frontends.
 *  Each page/module is a separate Single-SPA application.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerApplication, start } from 'single-spa';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './styles/global.css';

// Register micro-frontends
registerApplication({
  name: '@mfg-dashboard/page-overview',
  app: () => (window as any).System.import('@mfg-dashboard/page-overview'),
  activeWhen: '/overview',
});

registerApplication({
  name: '@mfg-dashboard/page-inventory',
  app: () => (window as any).System.import('@mfg-dashboard/page-inventory'),
  activeWhen: '/inventory',
});

registerApplication({
  name: '@mfg-dashboard/page-procurement',
  app: () => (window as any).System.import('@mfg-dashboard/page-procurement'),
  activeWhen: '/procurement',
});

registerApplication({
  name: '@mfg-dashboard/page-supplier',
  app: () => (window as any).System.import('@mfg-dashboard/page-supplier'),
  activeWhen: '/supplier',
});

registerApplication({
  name: '@mfg-dashboard/page-production',
  app: () => (window as any).System.import('@mfg-dashboard/page-production'),
  activeWhen: '/production',
});

// Start Single-SPA
start();

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err: any) {
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
