import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getReportData, getAiReport, type ReportId } from '../../data/reportData';
import { generatePDF, generateExcel, downloadBlob } from '../../utils/exportUtils';
import { useData } from '../../data/DataContext';

const DataManagementPage = lazy(() => import('./DataManagementPage'));

const useReportsSubRoute = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/reports\/?(.*)$/);
  return match ? (match[1] || 'generator') : 'generator';
};

const subTabs = [
  { key: 'generator', label: '📋 報告生成', path: '/reports/generator' },
  { key: 'data', label: '📂 資料管理', path: '/reports/data' },
  { key: 'settings', label: '⚙️ 系統設定', path: '/reports/settings' },
];

/* ================================================================
   報告生成器
   ================================================================ */
/** 歷史報告記錄 */
interface ReportRecord {
  id: string;
  name: string;
  format: 'pdf' | 'excel';
  time: string;
  blob: Blob;
}

/** 快速範本定義 */
const quickTemplates: { label: string; ids: ReportId[] }[] = [
  { label: '月度總結', ids: ['overview', 'inventory', 'production'] },
  { label: '季度回顧', ids: ['overview', 'inventory', 'production', 'cost', 'supplier'] },
  { label: '專案報告', ids: ['production', 'cost'] },
  { label: '客戶匯報', ids: ['overview', 'supplier', 'ai'] },
];

const ReportGeneratorPage: React.FC = () => {
  const { data: ctxData } = useData();
  const [selectedReports, setSelectedReports] = useState<ReportId[]>(['overview', 'inventory']);
  const [dateRange, setDateRange] = useState({ start: '2026-03-01', end: '2026-03-25' });
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<ReportRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { id: 'overview' as ReportId, label: '經營總覽報告', desc: '包含所有核心 KPI 與趨勢分析', icon: '📊' },
    { id: 'inventory' as ReportId, label: '庫存分析報告', desc: '庫存水位、週轉率、風險評估', icon: '📦' },
    { id: 'production' as ReportId, label: '生產效能報告', desc: 'OEE、良率、產能分析', icon: '🏭' },
    { id: 'cost' as ReportId, label: '成本分析報告', desc: '成本結構、差異分析、優化建議', icon: '💰' },
    { id: 'supplier' as ReportId, label: '供應商評估報告', desc: '供應商評分、交期、風險', icon: '🚚' },
    { id: 'ai' as ReportId, label: 'AI 預測報告', desc: '需求預測、異常偵測、優化建議', icon: '🤖' },
  ];

  const toggleReport = (id: ReportId) => {
    setSelectedReports(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const applyTemplate = (ids: ReportId[]) => {
    setSelectedReports(ids);
  };

  /** 真正的報告生成 */
  const handleGenerate = useCallback(async () => {
    if (selectedReports.length === 0 || generating) return;
    setGenerating(true);
    setError(null);

    try {
      // AI 報告無 Context 資料，單獨處理
      const aiSections = selectedReports.includes('ai') ? [getAiReport()] : [];
      const contextualSections = getReportData(
        selectedReports.filter(id => id !== 'ai'),
        ctxData
      );
      const sections = [...contextualSections, ...aiSections];
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';

      // PDF 為非同步（需等待字型載入），Excel 為同步
      const blob = format === 'pdf'
        ? await generatePDF(sections, dateRange)
        : generateExcel(sections, dateRange);

      const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
      const sectionNames = sections.map(s => s.title).join(' + ');
      const filename = `Manufacturing_Report_${dateRange.start}_${dateRange.end}.${ext}`;

      // 觸發下載
      downloadBlob(blob, filename);

      // 新增歷史記錄
      const record: ReportRecord = {
        id: `${Date.now()}`,
        name: sectionNames,
        format,
        time: timestamp,
        blob,
      };
      setHistory(prev => [record, ...prev].slice(0, 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : '報告生成失敗');
    } finally {
      setGenerating(false);
    }
  }, [selectedReports, format, dateRange, generating, ctxData]);

  /** 重新下載歷史報告 */
  const handleRedownload = (record: ReportRecord) => {
    const ext = record.format === 'pdf' ? 'pdf' : 'xlsx';
    downloadBlob(record.blob, `Report_${record.id}.${ext}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>📋 報告生成器</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>一鍵生成多元分析報告，支援 PDF / Excel 格式</p>
      </div>

      <div className="main-grid">
        {/* 報告選擇 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>選擇報告類型</h3></div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {reportTypes.map(r => (
              <div key={r.id}
                onClick={() => toggleReport(r.id)}
                style={{ padding: '14px 16px', borderRadius: 10, border: '2px solid', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: selectedReports.includes(r.id) ? 'var(--accent)' : 'var(--glass-border)',
                  background: selectedReports.includes(r.id) ? 'rgba(59,130,246,0.08)' : 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
                {selectedReports.includes(r.id) && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>✓ 已選擇</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 設定與生成 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>報告設定</h3></div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 日期範圍 */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>報告期間</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }} />
                <span style={{ color: 'var(--text-muted)' }}>至</span>
                <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }} />
              </div>
            </div>

            {/* 輸出格式 */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>輸出格式</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['pdf', 'excel'] as const).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: format === f ? 'var(--accent)' : 'var(--glass-bg)',
                      color: format === f ? 'white' : 'var(--text-secondary)' }}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 快速範本 */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>快速範本</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {quickTemplates.map(t => (
                  <span key={t.label}
                    onClick={() => applyTemplate(t.ids)}
                    style={{ padding: '6px 12px', borderRadius: 20, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {t.label} ({t.ids.length})
                  </span>
                ))}
              </div>
            </div>

            {/* 錯誤提示 */}
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* 生成按鈕 */}
            <button onClick={handleGenerate} disabled={generating || selectedReports.length === 0}
              style={{ padding: '14px 24px', borderRadius: 10, border: 'none', cursor: generating ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700,
                background: generating || selectedReports.length === 0 ? 'var(--glass-bg)' : 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                color: selectedReports.length === 0 ? 'var(--text-muted)' : 'white', transition: 'all 0.3s' }}>
              {generating ? '⏳ 生成中...' : `📥 生成 ${selectedReports.length} 份報告 (${format.toUpperCase()})`}
            </button>
          </div>
        </div>
      </div>

      {/* 最近生成的報告 */}
      <div className="glass-panel" style={{ marginTop: 24 }}>
        <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>最近生成的報告</h3></div>
        {history.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            尚未生成任何報告，選擇報告類型後按下「生成」按鈕
          </div>
        ) : (
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>報告名稱</th>
                <th>格式</th>
                <th>生成時間</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {history.map(rec => (
                <tr key={rec.id}>
                  <td>{rec.name}</td>
                  <td><span className="badge badge-info">{rec.format.toUpperCase()}</span></td>
                  <td>{rec.time}</td>
                  <td><span className="badge badge-success">已完成</span></td>
                  <td>
                    <button onClick={() => handleRedownload(rec)}
                      style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: 12 }}>
                      下載
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ================================================================
   系統設定
   ================================================================ */
const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    refreshInterval: 30,
    currency: 'TWD',
    language: 'zh-TW',
    theme: 'dark',
    autoRefresh: true,
    notifications: true,
  });

  const SettingRow: React.FC<{ label: string; desc: string; children: React.ReactNode }> = ({ label, desc, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>⚙️ 系統設定</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>自訂義系統行為與顯示偏好</p>
      </div>

      <div className="main-grid">
        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>一般設定</h3></div>
          <div style={{ marginTop: 8 }}>
            <SettingRow label="自動重新整理" desc="自動更新儀表板資料">
              <button onClick={() => setSettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))}
                style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: settings.autoRefresh ? 'var(--success)' : 'var(--glass-bg)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: settings.autoRefresh ? 24 : 2, transition: 'left 0.2s' }} />
              </button>
            </SettingRow>

            <SettingRow label="重新整理頻率" desc="資料自動更新間隔（秒）">
              <select value={settings.refreshInterval} onChange={e => setSettings(s => ({ ...s, refreshInterval: Number(e.target.value) }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }}>
                <option value={15}>15 秒</option>
                <option value={30}>30 秒</option>
                <option value={60}>1 分鐘</option>
                <option value={300}>5 分鐘</option>
              </select>
            </SettingRow>

            <SettingRow label="貨幣單位" desc="財務數值的顯示貨幣">
              <select value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }}>
                <option value="TWD">新台幣 (TWD)</option>
                <option value="USD">美元 (USD)</option>
                <option value="CNY">人民幣 (CNY)</option>
                <option value="EUR">歐元 (EUR)</option>
              </select>
            </SettingRow>

            <SettingRow label="通知提醒" desc="開啟異常告警通知">
              <button onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: settings.notifications ? 'var(--success)' : 'var(--glass-bg)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: settings.notifications ? 24 : 2, transition: 'left 0.2s' }} />
              </button>
            </SettingRow>
          </div>
        </div>

        <div className="glass-panel">
          <div className="chart-header"><h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>外觀設定</h3></div>
          <div style={{ marginTop: 8 }}>
            <SettingRow label="主題模式" desc="選擇深色或淺色模式">
              <div style={{ display: 'flex', gap: 8 }}>
                {['dark', 'light'].map(t => (
                  <button key={t} onClick={() => setSettings(s => ({ ...s, theme: t }))}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      background: settings.theme === t ? 'var(--accent)' : 'var(--glass-bg)',
                      color: settings.theme === t ? 'white' : 'var(--text-secondary)' }}>
                    {t === 'dark' ? '🌙 深色' : '☀️ 淺色'}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow label="語言" desc="介面顯示語言">
              <select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13 }}>
                <option value="zh-TW">繁體中文</option>
                <option value="zh-CN">簡體中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </SettingRow>

            <div style={{ padding: '16px 0' }}>
              <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 10 }}>
                💾 儲存設定
              </button>
              <button style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                ↩️ 重設預設
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   主頁面
   ================================================================ */
const ReportsPage: React.FC = () => {
  const subRoute = useReportsSubRoute();
  const navigate = useNavigate();

  const tabBarStyle: React.CSSProperties = { display: 'flex', gap: 8, marginBottom: 24, padding: '6px 8px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' };
  const tabBtn: React.CSSProperties = { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', transition: 'all 0.15s ease' };
  const tabBtnActive: React.CSSProperties = { background: 'var(--accent)', color: 'white' };

  return (
    <div>
      <div style={tabBarStyle}>
        {subTabs.map(tab => {
          const active = subRoute === tab.key;
          return (
            <button key={tab.key} onClick={() => navigate(tab.path)} style={{ ...tabBtn, ...(active ? tabBtnActive : {}) }}>
              {tab.label}
            </button>
          );
        })}
      </div>
      {subRoute === 'generator' && <ReportGeneratorPage />}
      {subRoute === 'data' && <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>載入中...</div>}><DataManagementPage /></Suspense>}
      {subRoute === 'settings' && <SettingsPage />}
    </div>
  );
};

export default ReportsPage;
