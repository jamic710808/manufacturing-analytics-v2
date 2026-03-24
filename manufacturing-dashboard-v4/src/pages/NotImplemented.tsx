import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NotImplemented: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.icon}>🚧</div>
      <h2 style={styles.title}>頁面開發中</h2>
      <p style={styles.path}>{location.pathname}</p>
      <p style={styles.desc}>此功能模組尚未實作，請等待後續版本更新。</p>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/overview')}
        style={{ marginTop: '24px' }}
      >
        返回管理駕駛艙
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '400px',
    textAlign: 'center',
    gap: '16px',
  },
  icon: {
    fontSize: '64px',
    lineHeight: 1,
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  path: {
    fontSize: '13px',
    fontFamily: 'monospace',
    padding: '4px 12px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--accent)',
  },
  desc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '360px',
  },
};

export default NotImplemented;
