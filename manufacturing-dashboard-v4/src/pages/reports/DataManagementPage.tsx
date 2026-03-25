/**
 * DataManagementPage.tsx — 資料管理頁面
 *
 * 提供：模組狀態卡片、下載範本、上傳匯入、重置功能。
 */
import React, { useState, useCallback, useRef } from 'react';
import { useData } from '../../data/DataContext';
import { moduleLabels, moduleIcons, type ModuleId, type AllModuleData } from '../../data/defaultData';
import { generateModuleTemplate, generateAllTemplates } from '../../utils/templateUtils';
import { parseExcelFile, mergeImportResults, type ImportResult } from '../../utils/importUtils';

const allModules: ModuleId[] = ['overview', 'inventory', 'procurement', 'supplier', 'cost', 'production'];

const DataManagementPage: React.FC = () => {
  const { data, updateModule, resetModule, resetAll, isCustomData, lastUpdated } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [pendingMerge, setPendingMerge] = useState<Partial<Record<ModuleId, AllModuleData[ModuleId]>> | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /** 處理檔案上傳 */
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);
    setImportResults(null);
    setPendingMerge(null);

    try {
      const results = await parseExcelFile(file);
      setImportResults(results);

      const successResults = results.filter(r => r.success);
      if (successResults.length > 0) {
        const merged = mergeImportResults(results, data);
        setPendingMerge(merged);
      } else {
        setMessage({ type: 'error', text: '所有工作表解析失敗，請檢查 Excel 格式是否正確。' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `檔案讀取失敗：${err instanceof Error ? err.message : '未知錯誤'}` });
    } finally {
      setImporting(false);
      // 重置 input 讓同一檔案可再次上傳
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [data]);

  /** 確認匯入 */
  const handleConfirmImport = useCallback(() => {
    if (!pendingMerge) return;

    let count = 0;
    for (const [moduleId, moduleData] of Object.entries(pendingMerge)) {
      updateModule(moduleId as ModuleId, moduleData as AllModuleData[ModuleId]);
      count++;
    }

    setMessage({ type: 'success', text: `已成功匯入 ${count} 個模組的資料！` });
    setImportResults(null);
    setPendingMerge(null);
  }, [pendingMerge, updateModule]);

  /** 取消匯入 */
  const handleCancelImport = useCallback(() => {
    setImportResults(null);
    setPendingMerge(null);
  }, []);

  /** 拖放處理 */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      // 透過建立假 event 觸發上傳
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 style={s.title}>📂 資料管理</h1>
        <p style={s.subtitle}>上傳 Excel 更新儀表板資料，或下載範本檔案</p>
      </div>

      {/* 訊息提示 */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* 模組狀態卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {allModules.map(moduleId => {
          const isCustom = isCustomData(moduleId);
          const updated = lastUpdated[moduleId];
          return (
            <div key={moduleId} className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{moduleIcons[moduleId]}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{moduleLabels[moduleId]}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {updated ? `最後更新：${updated}` : '使用預設資料'}
                    </div>
                  </div>
                </div>
                <span className="badge" style={{
                  background: isCustom ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)',
                  color: isCustom ? 'var(--success)' : 'var(--text-muted)',
                  fontSize: 11,
                }}>
                  {isCustom ? '已匯入' : '預設'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => generateModuleTemplate(moduleId)} style={s.smallBtn}>
                  📥 下載範本
                </button>
                {isCustom && (
                  <button onClick={() => { resetModule(moduleId); setMessage({ type: 'success', text: `${moduleLabels[moduleId]} 已重置為預設資料` }); }} style={{ ...s.smallBtn, color: 'var(--warning)' }}>
                    ↩️ 重置
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="main-grid">
        {/* 上傳匯入區 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={s.chartTitle}>上傳 Excel 匯入資料</h3></div>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              marginTop: 16, padding: 40, border: '2px dashed var(--glass-border)',
              borderRadius: 12, textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {importing ? '解析中...' : '點擊或拖放 Excel 檔案至此'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              支援 .xlsx / .xls 格式，系統會自動辨識模組
            </div>
          </div>

          {/* 解析結果 */}
          {importResults && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>解析結果</div>
              {importResults.map((result, i) => (
                <div key={i} style={{
                  padding: '10px 14px', marginBottom: 8, borderRadius: 8,
                  background: result.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${result.success ? 'var(--success)' : 'var(--danger)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {result.success ? '✓' : '✗'} {result.sheetName}
                      {result.moduleId && ` → ${moduleLabels[result.moduleId]}`}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.rowCount} 筆</span>
                  </div>
                  {result.errors.map((err, j) => (
                    <div key={j} style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{err}</div>
                  ))}
                  {result.warnings.map((warn, j) => (
                    <div key={j} style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>{warn}</div>
                  ))}
                </div>
              ))}

              {pendingMerge && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button onClick={handleConfirmImport} style={s.primaryBtn}>
                    ✓ 確認匯入 {Object.keys(pendingMerge).length} 個模組
                  </button>
                  <button onClick={handleCancelImport} style={s.secondaryBtn}>
                    取消
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 批次操作 */}
        <div className="glass-panel">
          <div className="chart-header"><h3 style={s.chartTitle}>批次操作</h3></div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button onClick={generateAllTemplates} style={s.actionBtn}>
              📥 下載所有模組範本（合併檔案）
            </button>
            <button onClick={() => {
              resetAll();
              setMessage({ type: 'success', text: '所有模組已重置為預設資料' });
            }} style={{ ...s.actionBtn, borderColor: 'var(--warning)', color: 'var(--warning)' }}>
              ↩️ 全部重置為預設資料
            </button>
          </div>
          <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>使用說明</div>
            <ol style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
              <li>點擊「下載範本」取得 Excel 範本檔案</li>
              <li>開啟範本，修改第 5 列以下的資料數值</li>
              <li>請勿修改前 4 列（標題、說明、空白、表頭）</li>
              <li>儲存後上傳至此頁面</li>
              <li>確認解析結果無誤後，點擊「確認匯入」</li>
              <li>各分析頁面將自動使用匯入的資料</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },
  chartTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  smallBtn: {
    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--glass-border)',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 500,
  },
  primaryBtn: {
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
    background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: 'white',
  },
  secondaryBtn: {
    padding: '10px 20px', borderRadius: 8, border: '1px solid var(--glass-border)',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
  },
  actionBtn: {
    padding: '12px 20px', borderRadius: 10, border: '1px solid var(--glass-border)',
    background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    textAlign: 'left' as const,
  },
};

export default DataManagementPage;
