import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../data/DataContext';
import { pathToModuleId, buildPageContext } from '../../utils/buildPageContext';

// ── Types ──────────────────────────────────────────────────────────────────
type ApiFormat = 'openai' | 'anthropic';

interface Provider {
  name: string;
  baseUrl: string;
  models: string[];
  defaultModel: string;
  apiFormat: ApiFormat;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
}

interface AICfg {
  provider: string;
  model: string;
  temperature: number;
  useStream: boolean;
  useCorsProxy: boolean;
  maxTokens: number;
  savedKeys: Record<string, string>;
  savedBaseUrls: Record<string, string>;
}

export interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Provider config ────────────────────────────────────────────────────────
const PROVIDERS: Record<string, Provider> = {
  openai: {
    name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiFormat: 'openai',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'],
    defaultModel: 'gpt-4o-mini',
  },
  anthropic: {
    name: 'Anthropic', baseUrl: 'https://api.anthropic.com', apiFormat: 'anthropic',
    models: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    defaultModel: 'claude-sonnet-4-6',
  },
  deepseek: {
    name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', apiFormat: 'openai',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
  },
  minimax: {
    name: 'MiniMax', baseUrl: 'https://api.minimaxi.com/v1', apiFormat: 'openai',
    models: ['MiniMax-M2.7', 'MiniMax-M2.5', 'MiniMax-M2.1'],
    defaultModel: 'MiniMax-M2.7',
  },
  siliconflow: {
    name: '硅基流動', baseUrl: 'https://api.siliconflow.cn/v1', apiFormat: 'openai',
    models: ['Qwen/Qwen2.5-72B-Instruct', 'deepseek-ai/DeepSeek-V3', 'THUDM/glm-4-9b-chat'],
    defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
  },
  openrouter: {
    name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', apiFormat: 'openai',
    models: ['anthropic/claude-sonnet-4-6', 'openai/gpt-4o', 'deepseek/deepseek-chat', 'google/gemini-2.5-flash'],
    defaultModel: 'deepseek/deepseek-chat',
  },
  ollama: {
    name: 'Ollama（本地）', baseUrl: 'http://localhost:11434/v1', apiFormat: 'openai',
    models: ['llama3.3', 'qwen2.5:72b', 'deepseek-r1:70b', 'gemma3:27b'],
    defaultModel: 'llama3.3',
  },
  custom: {
    name: '自訂端點', baseUrl: '', apiFormat: 'openai',
    models: [], defaultModel: '',
  },
};

// ── System prompt（製造業情境）──────────────────────────────────────────────
const SYSTEM_PROMPT = `你是一位專業的製造業數據分析師，專注於生產效率、供應鏈管理、品質控制及成本優化。
分析時請注意：
1. 以繁體中文回覆，語氣專業但易懂
2. 優先指出重要異常（OEE 下降、品質問題、庫存風險、供應商延誤）
3. 提供具體的數字依據（百分比、金額、趨勢）
4. 給出可執行的改善建議（標記 ⚠️ 表示風險、💡 表示建議）
5. 回覆結構清晰，善用條列或小標題
6. 【標籤】格式用於標示重點類別
用戶正在查看製造業分析儀表板，請根據提供的頁面數據給予深入洞察。`;

// ── 各頁面快速問題 ─────────────────────────────────────────────────────────
const PAGE_QUESTIONS: Record<string, string[]> = {
  '/overview':    ['整體工廠健康度有哪些需要關注的指標？', 'OEE、OTD、品質三大指標哪項最需要改善？', '本月生產效率與上月相比有何變化？'],
  '/health':      ['工廠健康度分數下降的主要原因是什麼？', '哪些設備健康度最差，需要優先維護？', '健康度指標如何影響整體生產績效？'],
  '/alert':       ['目前最緊急的異常預警有哪些？', '異常預警的重複性問題如何根本解決？', '過去一週發生最多次的異常類型是什麼？'],
  '/inventory':   ['目前庫存水位是否存在斷料風險？', '哪些料號的庫存周轉率最低？', '安全庫存設定是否需要調整？'],
  '/procurement': ['採購支出有哪些異常需要關注？', '哪些供應商的交期表現最差？', '如何優化採購成本結構？'],
  '/supplier':    ['評分最低的供應商有哪些改善建議？', '供應鏈風險矩陣中哪些供應商處於高風險區？', '如何提升整體供應商 OTD 表現？'],
  '/production':  ['今日生產良率是否達標？異常原因為何？', 'OEE 最低的設備是哪台？如何改善？', '製程能力 Cpk 不足的原因為何？'],
  '/cost':        ['製造成本結構中哪個環節超支最嚴重？', '如何降低直接材料成本？', '固定成本與變動成本比例是否合理？'],
  '/ai':          ['目前 AI 偵測到哪些關鍵異常？', '需求預測的準確率是否可以進一步提升？', 'AI 智能建議的優先順序如何決定？'],
  '/simulation':  ['情境模擬的結果對生產決策有何影響？', '哪種情境下獲利最高？', '如何將模擬結果轉化為實際行動計劃？'],
  '/reports':     ['報告中最值得管理層關注的關鍵發現是什麼？', '哪個模組的績效改善空間最大？', '請整合各分析模組給出本月總結建議'],
};
const DEFAULT_QUESTIONS = ['這個頁面最重要的指標是什麼？', '目前有哪些需要立即關注的問題？', '請提供 3 個改善建議'];

// ── Markdown renderer ──────────────────────────────────────────────────────
function renderMd(raw: string): string {
  return raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/【([^】]+)】/g, '<span class="ai-tag">【$1】</span>')
    .replace(/^### (.+)$/gm, '<h4 class="ai-h">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="ai-h">$1</h3>')
    .replace(/^# (.+)$/gm, '<h3 class="ai-h">$1</h3>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="ai-code">$1</code>')
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>(?:\n|$))+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

// ── LocalStorage ───────────────────────────────────────────────────────────
const CFG_KEY = 'mfgDashAICfg_v4';

function loadCfg(): AICfg {
  const def: AICfg = { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, useStream: true, useCorsProxy: false, maxTokens: 4096, savedKeys: {}, savedBaseUrls: {} };
  try {
    const s = localStorage.getItem(CFG_KEY);
    if (s) return { ...def, ...JSON.parse(s) };
  } catch {}
  return def;
}

function saveCfg(c: AICfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(c));
}

// ── Component ──────────────────────────────────────────────────────────────
const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { data, lastUpdated } = useData();
  const [cfg, setCfg] = useState<AICfg>(loadCfg);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [toast, setToast] = useState<{ text: string; type: 'ok' | 'err' | 'info' } | null>(null);
  const [testStatus, setTestStatus] = useState<{ text: string; type: 'ok' | 'err' | 'testing' } | null>(null);

  // Settings form (uncommitted values)
  const [formProvider, setFormProvider] = useState(cfg.provider);
  const [formKey, setFormKey] = useState('');
  const [formModel, setFormModel] = useState(cfg.model);
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formStream, setFormStream] = useState(cfg.useStream);
  const [formCorsProxy, setFormCorsProxy] = useState(cfg.useCorsProxy);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cfgRef = useRef(cfg);
  const messagesRef = useRef(messages);

  useEffect(() => { cfgRef.current = cfg; }, [cfg]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingText]);

  const currentProvider = PROVIDERS[cfg.provider] ?? PROVIDERS.openai;
  const apiKey = cfg.savedKeys[cfg.provider] ?? '';

  const pageRoot = '/' + (location.pathname.split('/')[1] ?? '');
  const pageQuestions = PAGE_QUESTIONS[pageRoot] ?? DEFAULT_QUESTIONS;

  // ── 頁面數據上下文 ──────────────────────────────────────────────────────
  const moduleId = pathToModuleId(location.pathname);
  const pageCtx = moduleId ? buildPageContext(data, moduleId) : '';
  const dataUpdatedAt = moduleId ? lastUpdated[moduleId] : null;
  // 動態 System Prompt：基礎提示 + 當前頁面即時數據
  const dynamicSystemPrompt = pageCtx
    ? `${SYSTEM_PROMPT}\n\n## 當前頁面即時數據（分析請以此為依據）\n${pageCtx}`
    : SYSTEM_PROMPT;
  // 用 ref 確保 async 函式讀到最新值
  const dynamicSystemPromptRef = useRef(dynamicSystemPrompt);
  useEffect(() => { dynamicSystemPromptRef.current = dynamicSystemPrompt; }, [dynamicSystemPrompt]);

  // ── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, type: 'ok' | 'err' | 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Settings form ──────────────────────────────────────────────────────
  // 將目標 URL 轉為代理 URL（繞過 CORS）
  const toProxyUrl = (url: string, useProxy: boolean) =>
    useProxy ? `http://localhost:8080/proxy?url=${encodeURIComponent(url)}` : url;

  const openSettings = () => {
    const p = cfg.provider;
    setFormProvider(p);
    setFormKey(cfg.savedKeys[p] ?? '');
    setFormModel(cfg.model);
    setFormEndpoint(cfg.savedBaseUrls[p] ?? PROVIDERS[p]?.baseUrl ?? '');
    setFormStream(cfg.useStream);
    setFormCorsProxy(cfg.useCorsProxy);
    setTestStatus(null);
    setShowSettings(true);
  };

  const handleProviderChange = (id: string) => {
    setCfg(prev => ({
      ...prev,
      savedKeys: { ...prev.savedKeys, [formProvider]: formKey },
      savedBaseUrls: { ...prev.savedBaseUrls, [formProvider]: formEndpoint },
    }));
    setFormProvider(id);
    setFormKey(cfg.savedKeys[id] ?? '');
    setFormEndpoint(cfg.savedBaseUrls[id] ?? PROVIDERS[id]?.baseUrl ?? '');
    setFormModel(PROVIDERS[id]?.defaultModel ?? '');
    setTestStatus(null);
  };

  const saveSettings = () => {
    const next: AICfg = {
      ...cfg,
      provider: formProvider,
      model: formModel,
      useStream: formStream,
      useCorsProxy: formCorsProxy,
      savedKeys: { ...cfg.savedKeys, [formProvider]: formKey },
      savedBaseUrls: { ...cfg.savedBaseUrls, [formProvider]: formEndpoint },
    };
    setCfg(next);
    saveCfg(next);
    setShowSettings(false);
    showToast('✅ AI 設定已儲存', 'ok');
  };

  const testConnection = async () => {
    if (!formKey || !formModel) {
      setTestStatus({ text: '❌ 請填寫 API Key 及模型', type: 'err' });
      return;
    }
    setTestStatus({ text: '🔄 連線測試中…', type: 'testing' });
    try {
      const base = (formEndpoint || (PROVIDERS[formProvider]?.baseUrl ?? '')).replace(/\/+$/, '');
      const rawUrl = `${base}/chat/completions`;
      const fetchUrl = toProxyUrl(rawUrl, formCorsProxy);
      const res = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${formKey}` },
        body: JSON.stringify({ model: formModel, messages: [{ role: 'user', content: 'ping' }], max_tokens: 5, stream: false }),
      });
      if (res.ok) {
        setTestStatus({ text: '✅ 連線成功！模型回應正常。', type: 'ok' });
      } else {
        const err = await res.text();
        setTestStatus({ text: `❌ 錯誤 ${res.status}：${err.slice(0, 120)}`, type: 'err' });
      }
    } catch (e: any) {
      setTestStatus({ text: `❌ 網路錯誤：${e.message}`, type: 'err' });
    }
  };

  // ── Stream readers ─────────────────────────────────────────────────────
  const readOpenAIStream = async (res: Response, onChunk: (t: string) => void): Promise<{ content: string; thinking: string }> => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = '', thinking = '', buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        try {
          const delta = JSON.parse(line.slice(6)).choices?.[0]?.delta;
          if (delta?.reasoning_content) thinking += delta.reasoning_content;
          if (delta?.content) { full += delta.content; onChunk(full); }
        } catch {}
      }
    }
    return { content: full, thinking };
  };

  const readAnthropicStream = async (res: Response, onChunk: (t: string) => void): Promise<{ content: string; thinking: string }> => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = '', thinking = '', buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const ev = JSON.parse(line.slice(6));
          if (ev.type === 'content_block_delta') {
            if (ev.delta?.type === 'thinking_delta') thinking += ev.delta.thinking ?? '';
            if (ev.delta?.type === 'text_delta') { full += ev.delta.text ?? ''; onChunk(full); }
          }
        } catch {}
      }
    }
    return { content: full, thinking };
  };

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const c = cfgRef.current;
    const key = c.savedKeys[c.provider] ?? '';

    if (!key) {
      showToast('⚠️ 請先在設定中填入 API Key', 'err');
      openSettings();
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const history = [...messagesRef.current, userMsg];
    setMessages(history);
    setInputText('');
    setIsStreaming(true);
    setStreamingText('');

    const abort = new AbortController();
    abortRef.current = abort;
    const prov = PROVIDERS[c.provider] ?? PROVIDERS.openai;
    const base = (c.savedBaseUrls[c.provider] ?? prov.baseUrl).replace(/\/+$/, '');

    const buildMsgs = () => history.map(m => ({ role: m.role, content: m.content }));

    try {
      let result: { content: string; thinking: string };

      const sysPrompt = dynamicSystemPromptRef.current;
      const proxy = c.useCorsProxy;

      if (prov.apiFormat === 'anthropic') {
        const fetchUrl = toProxyUrl(`${base}/v1/messages`, proxy);
        const res = await fetch(fetchUrl, {
          method: 'POST', signal: abort.signal,
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: c.model, system: sysPrompt, messages: buildMsgs(), temperature: c.temperature, max_tokens: c.maxTokens, stream: c.useStream }),
        });
        if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
        if (c.useStream) {
          result = await readAnthropicStream(res, t => setStreamingText(t));
        } else {
          const data = await res.json();
          result = { content: data.content?.map((x: any) => x.text ?? '').join('') ?? '', thinking: '' };
        }
      } else {
        const fetchUrl = toProxyUrl(`${base}/chat/completions`, proxy);
        const res = await fetch(fetchUrl, {
          method: 'POST', signal: abort.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({ model: c.model, messages: [{ role: 'system', content: sysPrompt }, ...buildMsgs()], temperature: c.temperature, max_tokens: c.maxTokens, stream: c.useStream }),
        });
        if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
        if (c.useStream) {
          result = await readOpenAIStream(res, t => setStreamingText(t));
        } else {
          const data = await res.json();
          result = { content: data.choices?.[0]?.message?.content ?? '', thinking: '' };
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.content,
        thinking: result.thinking || undefined,
      }]);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `❌ 請求失敗：${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); }
  };

  return (
    <>
      {isOpen && <div className="ai-overlay" onClick={onClose} />}

      <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ai-panel-hdr">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ai-panel-title">🤖 AI 製造分析師</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
              <span className="ai-panel-subtitle">{currentProvider.name} · {cfg.model}</span>
              {pageCtx ? (
                <span className="ai-data-badge ai-data-badge--loaded" title={dataUpdatedAt ? `數據更新：${dataUpdatedAt}` : '使用預設範例數據'}>
                  📊 數據已載入
                </span>
              ) : (
                <span className="ai-data-badge ai-data-badge--none">— 無頁面數據</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className="ai-icon-btn" onClick={openSettings} title="設定">⚙️</button>
            <button className="ai-icon-btn" onClick={() => { setMessages([]); setStreamingText(''); }} title="清除對話">🗑️</button>
            <button className="ai-icon-btn" onClick={onClose} title="關閉">✕</button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="ai-settings">
            <div className="ai-settings-title">⚙️ AI 設定</div>
            <div className="ai-prov-tabs">
              {Object.entries(PROVIDERS).map(([id, p]) => (
                <button key={id} className={`ai-prov-tab ${formProvider === id ? 'act' : ''}`} onClick={() => handleProviderChange(id)}>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="ai-fld">
              <label>Endpoint</label>
              <input type="text" value={formEndpoint} onChange={e => setFormEndpoint(e.target.value)} placeholder={PROVIDERS[formProvider]?.baseUrl ?? ''} />
            </div>
            <div className="ai-fld">
              <label>API Key</label>
              <input type="password" value={formKey} onChange={e => setFormKey(e.target.value)} placeholder="sk-..." />
            </div>
            <div className="ai-fld">
              <label>模型</label>
              {formProvider === 'custom' ? (
                <input type="text" value={formModel} onChange={e => setFormModel(e.target.value)} placeholder="gpt-4o" />
              ) : (
                <select value={formModel} onChange={e => setFormModel(e.target.value)}>
                  {(PROVIDERS[formProvider]?.models ?? []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div className="ai-fld" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 0 }}>
                <input type="checkbox" id="chk-stream" checked={formStream} onChange={e => setFormStream(e.target.checked)} />
                <label htmlFor="chk-stream" style={{ marginBottom: 0, cursor: 'pointer' }}>串流輸出</label>
              </div>
              <div className="ai-fld" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 0 }}>
                <input type="checkbox" id="chk-cors" checked={formCorsProxy} onChange={e => setFormCorsProxy(e.target.checked)} />
                <label htmlFor="chk-cors" style={{ marginBottom: 0, cursor: 'pointer', color: formCorsProxy ? 'var(--warning)' : undefined }}>
                  繞過 CORS 代理
                </label>
              </div>
            </div>
            {formCorsProxy && (
              <div style={{ fontSize: 11, color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 2 }}>
                ⚠️ 請先執行 <code>python mfg_cors_proxy.py</code>，請求將由 localhost:8080 轉發
              </div>
            )}
            {testStatus && <div className={`ai-test-status ${testStatus.type}`}>{testStatus.text}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13, padding: '8px 0' }} onClick={testConnection}>連線測試</button>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 13, padding: '8px 0' }} onClick={saveSettings}>儲存設定</button>
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 12px' }} onClick={() => setShowSettings(false)}>✕</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="ai-messages">
          {messages.length === 0 && !isStreaming && (
            <div className="ai-empty">
              <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>AI 製造分析師</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                你好！我可以協助分析製造數據、<br />解讀異常、給出優化建議。
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`ai-msg ${msg.role}`}>
              {msg.thinking && (
                <div className="ai-thinking">
                  <div className="ai-thinking-hd">🧠 思考過程</div>
                  <div className="ai-thinking-bd">{msg.thinking}</div>
                </div>
              )}
              <div
                className="ai-bubble"
                dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? renderMd(msg.content) : msg.content }}
              />
            </div>
          ))}

          {isStreaming && (
            <div className="ai-msg assistant">
              {streamingText
                ? <div className="ai-bubble" dangerouslySetInnerHTML={{ __html: renderMd(streamingText) }} />
                : <div className="ai-bubble"><div className="ai-dots"><span /><span /><span /></div></div>
              }
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length === 0 && !isStreaming && (
          <div className="ai-qr">
            {pageQuestions.map((q, i) => (
              <button key={i} className="ai-qr-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
        )}

        {/* Footer input */}
        <div className="ai-footer">
          <div className="ai-input-row">
            <textarea
              className="ai-input"
              placeholder="輸入問題… (Enter 送出，Shift+Enter 換行)"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={isStreaming}
            />
            {isStreaming
              ? <button className="ai-send-btn" onClick={() => abortRef.current?.abort()} title="停止">⏹</button>
              : <button className="ai-send-btn" onClick={() => sendMessage(inputText)} disabled={!inputText.trim()} title="送出">▶</button>
            }
          </div>
          <div className="ai-foot-note">⚡ {currentProvider.name} · {cfg.model}</div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={`ai-toast show ${toast.type}`}>{toast.text}</div>}
    </>
  );
};

export default AIChatPanel;
