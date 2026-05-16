import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../data/DataContext';
import { pathToModuleId, buildPageContext } from '../../utils/buildPageContext';

// ── Types ──────────────────────────────────────────────────────────────────
type ApiFormat = 'openai' | 'anthropic';
type CorsProxyMode = 'off' | 'local' | 'custom' | 'vercel';

const CUSTOM_SENTINEL = '__custom__';

interface Provider {
  name: string;
  baseUrl: string;
  models: string[];
  defaultModel: string;
  apiFormat: ApiFormat;
  allowCustomModel?: boolean;
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
  corsProxyMode: CorsProxyMode;
  corsProxyUrl: string;
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
    allowCustomModel: true,
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

// ── 追加問題庫（智能 Quick Reply）──────────────────────────────────────────
interface FollowupEntry { keywords: string[]; questions: string[] }

const PAGE_FOLLOWUPS: Record<string, FollowupEntry[]> = {
  '/overview': [
    { keywords: ['OEE', '設備效能', '稼動率'], questions: ['OEE 三大損失（可用率/效率/品質率）如何分解？', '哪條產線 OEE 最低，需要優先改善？'] },
    { keywords: ['品質', '不良率', '良率', '缺陷'], questions: ['不良品的主要根因是什麼？', '如何建立有效的品質預警機制？'] },
    { keywords: ['庫存', '缺料', '斷料', '備料'], questions: ['哪些關鍵物料庫存最緊張？', '如何科學設定安全庫存水位？'] },
    { keywords: ['成本', '費用', '超支'], questions: ['成本節約的最大槓桿在哪個環節？', '如何區分結構性成本與臨時性超支？'] },
    { keywords: ['供應商', '交期', 'OTD'], questions: ['交期最差的供應商有哪些替代方案？', '如何評估供應商替換的成本效益？'] },
  ],
  '/production': [
    { keywords: ['良率', '不良', 'Cpk', '製程能力'], questions: ['製程能力不足的根本原因為何？', '如何設計 SPC 管制計劃？'] },
    { keywords: ['OEE', '設備', '停機', '維護'], questions: ['停機最頻繁的設備是哪台？', '預防保養計劃是否需要調整頻率？'] },
    { keywords: ['產能', '瓶頸', '排程'], questions: ['如何找出並消除生產瓶頸？', '排程優化可以帶來多少產能提升？'] },
    { keywords: ['換線', '換模', '準備時間'], questions: ['換線時間壓縮的 SMED 方法如何導入？', '哪個品項換線最耗時？'] },
  ],
  '/supplier': [
    { keywords: ['評分', '績效', '風險'], questions: ['風險最高的供應商如何制定應急備援計劃？', '供應商評分如何量化轉化為採購決策？'] },
    { keywords: ['交期', 'OTD', '延誤'], questions: ['交期延誤的系統性原因是什麼？', '如何在合約中加入有效的交期 KPI 約束？'] },
    { keywords: ['品質', '退貨', '不合格', '來料'], questions: ['來料不合格的根因是什麼？', '如何優化供應商入料品質保證流程？'] },
  ],
  '/inventory': [
    { keywords: ['周轉率', '呆滯', '滯銷'], questions: ['呆滯庫存如何處置最具效益？', '周轉率低的根本原因是需求預測還是備料策略？'] },
    { keywords: ['缺料', '斷料', '安全庫存'], questions: ['如何計算科學的安全庫存水位？', '哪些物料需要優先補貨？'] },
    { keywords: ['庫存金額', '資金', '佔用'], questions: ['降低庫存金額對現金流的改善幅度有多大？', '哪個品項的庫存佔用資金最多？'] },
  ],
  '/cost': [
    { keywords: ['直接材料', '原物料', '材料成本'], questions: ['如何通過設計改善降低材料成本？', '材料價格波動如何對沖風險？'] },
    { keywords: ['人工', '人力', '工資', '勞動'], questions: ['人工效率提升有哪些具體方案？', '自動化替代的 ROI 如何評估？'] },
    { keywords: ['製造費用', '間接費用', '固定成本'], questions: ['固定成本的最優攤銷策略是什麼？', '如何識別並削減非必要製造費用？'] },
  ],
  '/procurement': [
    { keywords: ['供應商', '詢比價', '議價'], questions: ['如何建立更有效的詢比價流程？', '哪些品項有更大的議價空間？'] },
    { keywords: ['採購金額', '支出', '成本節約'], questions: ['集中採購的效益如何量化？', '哪些品類適合策略性備貨降低成本？'] },
  ],
  '/alert': [
    { keywords: ['異常', '預警', '警報'], questions: ['這個異常的根因分析（RCA）應該從哪裡開始？', '類似異常歷史上發生過幾次？'] },
    { keywords: ['重複', '慢性', '系統性'], questions: ['如何建立防止慢性異常的機制？', '這類問題的永久改善對策是什麼？'] },
  ],
};

const GENERIC_FOLLOWUPS = [
  '針對上述分析，請給出 3 個優先行動建議',
  '這個問題的根本原因（Root Cause）是什麼？',
  '如何建立可追蹤的改善 KPI？',
  '最快可以見效的改善措施是什麼？',
  '有哪些國際製造業最佳實踐可以參考？',
];

function getFollowupQuestions(pageRoot: string, assistantContent: string): string[] {
  const bank = PAGE_FOLLOWUPS[pageRoot] ?? [];
  const matched: string[] = [];
  for (const entry of bank) {
    if (entry.keywords.some(kw => assistantContent.includes(kw))) {
      matched.push(...entry.questions);
    }
  }
  const unique = [...new Set(matched)];
  if (unique.length >= 3) return unique.slice(0, 3);
  const generics = GENERIC_FOLLOWUPS.filter(q => !unique.includes(q));
  return [...unique, ...generics].slice(0, 3);
}

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
  const def: AICfg = {
    provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, useStream: true,
    corsProxyMode: 'vercel', corsProxyUrl: '',
    maxTokens: 4096, savedKeys: {}, savedBaseUrls: {},
  };
  try {
    const s = localStorage.getItem(CFG_KEY);
    if (s) {
      const p = JSON.parse(s);
      // 向後相容：舊版 boolean useCorsProxy → 新版 string mode
      if (!p.corsProxyMode && p.useCorsProxy === true) p.corsProxyMode = 'local';
      return { ...def, ...p };
    }
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
  const [formCustomModelInput, setFormCustomModelInput] = useState('');
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formStream, setFormStream] = useState(cfg.useStream);
  const [formCorsProxyMode, setFormCorsProxyMode] = useState<CorsProxyMode>(cfg.corsProxyMode);
  const [formCorsProxyUrl, setFormCorsProxyUrl] = useState(cfg.corsProxyUrl);

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
  const dynamicSystemPrompt = pageCtx
    ? `${SYSTEM_PROMPT}\n\n## 當前頁面即時數據（分析請以此為依據）\n${pageCtx}`
    : SYSTEM_PROMPT;
  const dynamicSystemPromptRef = useRef(dynamicSystemPrompt);
  useEffect(() => { dynamicSystemPromptRef.current = dynamicSystemPrompt; }, [dynamicSystemPrompt]);

  // ── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, type: 'ok' | 'err' | 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Clear messages ─────────────────────────────────────────────────────
  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingText('');
    showToast('🗑️ 對話紀錄已清除', 'info');
  }, [showToast]);

  // ── 依代理模式包裝原始端點 URL ─────────────────────────────────────────
  const wrapWithProxy = (originalUrl: string, mode: CorsProxyMode, customUrl: string) => {
    if (mode === 'local')   return `http://localhost:8080/proxy?url=${encodeURIComponent(originalUrl)}`;
    if (mode === 'vercel')  return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
    if (mode === 'custom' && customUrl) return `${customUrl.replace(/\/$/, '')}?url=${encodeURIComponent(originalUrl)}`;
    return originalUrl;
  };

  // ── Settings helpers ───────────────────────────────────────────────────
  // 解析 formModel + formCustomModelInput → 實際模型名稱
  const resolveModel = (model: string, customInput: string) =>
    model === CUSTOM_SENTINEL ? customInput : model;

  const openSettings = () => {
    const p = cfg.provider;
    const prov = PROVIDERS[p];
    const isCustomModel = prov?.allowCustomModel && !prov.models.includes(cfg.model);
    setFormProvider(p);
    setFormKey(cfg.savedKeys[p] ?? '');
    setFormModel(isCustomModel ? CUSTOM_SENTINEL : cfg.model);
    setFormCustomModelInput(isCustomModel ? cfg.model : '');
    setFormEndpoint(cfg.savedBaseUrls[p] ?? PROVIDERS[p]?.baseUrl ?? '');
    setFormStream(cfg.useStream);
    setFormCorsProxyMode(cfg.corsProxyMode);
    setFormCorsProxyUrl(cfg.corsProxyUrl);
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
    setFormCustomModelInput('');
    setTestStatus(null);
  };

  const saveSettings = () => {
    const resolvedModel = resolveModel(formModel, formCustomModelInput);
    if (!resolvedModel && formProvider !== 'custom') {
      showToast('⚠️ 請填寫模型名稱', 'err');
      return;
    }
    const next: AICfg = {
      ...cfg,
      provider: formProvider,
      model: resolvedModel,
      useStream: formStream,
      corsProxyMode: formCorsProxyMode,
      corsProxyUrl: formCorsProxyUrl,
      savedKeys: { ...cfg.savedKeys, [formProvider]: formKey },
      savedBaseUrls: { ...cfg.savedBaseUrls, [formProvider]: formEndpoint },
    };
    setCfg(next);
    saveCfg(next);
    setShowSettings(false);
    showToast('✅ AI 設定已儲存', 'ok');
  };

  const testConnection = async () => {
    const resolvedModel = resolveModel(formModel, formCustomModelInput);
    if (!formKey || !resolvedModel) {
      setTestStatus({ text: '❌ 請填寫 API Key 及模型', type: 'err' });
      return;
    }
    setTestStatus({ text: '🔄 連線測試中…', type: 'testing' });
    try {
      const base = (formEndpoint || (PROVIDERS[formProvider]?.baseUrl ?? '')).replace(/\/+$/, '');
      const rawUrl = `${base}/chat/completions`;
      const fetchUrl = wrapWithProxy(rawUrl, formCorsProxyMode, formCorsProxyUrl);
      const res = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${formKey}` },
        body: JSON.stringify({ model: resolvedModel, messages: [{ role: 'user', content: 'ping' }], max_tokens: 5, stream: false }),
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
      const proxyMode = c.corsProxyMode;
      const proxyUrl = c.corsProxyUrl;

      if (prov.apiFormat === 'anthropic') {
        const fetchUrl = wrapWithProxy(`${base}/v1/messages`, proxyMode, proxyUrl);
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
        const fetchUrl = wrapWithProxy(`${base}/chat/completions`, proxyMode, proxyUrl);
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

  // 目前最後一條 assistant 訊息（用於 follow-up）
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

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
            <button className="ai-icon-btn" onClick={clearMessages} title="清除對話">🗑️</button>
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
                <>
                  <select value={formModel} onChange={e => setFormModel(e.target.value)}>
                    {(PROVIDERS[formProvider]?.models ?? []).map(m => <option key={m} value={m}>{m}</option>)}
                    {PROVIDERS[formProvider]?.allowCustomModel && (
                      <option value={CUSTOM_SENTINEL}>自訂（手動填入）…</option>
                    )}
                  </select>
                  {PROVIDERS[formProvider]?.allowCustomModel && formModel === CUSTOM_SENTINEL && (
                    <input
                      type="text"
                      value={formCustomModelInput}
                      onChange={e => setFormCustomModelInput(e.target.value)}
                      placeholder="例如 meta-llama/llama-4-maverick"
                      style={{ marginTop: 4 }}
                    />
                  )}
                </>
              )}
            </div>
            <div className="ai-fld" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <input type="checkbox" id="chk-stream" checked={formStream} onChange={e => setFormStream(e.target.checked)} />
              <label htmlFor="chk-stream" style={{ marginBottom: 0, cursor: 'pointer' }}>串流輸出</label>
            </div>
            <div className="ai-fld">
              <label>CORS 代理</label>
              <select value={formCorsProxyMode} onChange={e => setFormCorsProxyMode(e.target.value as CorsProxyMode)}>
                <option value="off">關閉（直連）</option>
                <option value="vercel">Vercel 代理（本站 /api/proxy）</option>
                <option value="local">本機代理（:8080）</option>
                <option value="custom">自訂代理 URL</option>
              </select>
            </div>
            {formCorsProxyMode === 'custom' && (
              <div className="ai-fld">
                <label>代理 URL</label>
                <input
                  type="text"
                  value={formCorsProxyUrl}
                  onChange={e => setFormCorsProxyUrl(e.target.value)}
                  placeholder="https://your-app.vercel.app/api/proxy"
                />
              </div>
            )}
            {formCorsProxyMode === 'local' && (
              <div style={{ fontSize: 11, color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 2 }}>
                ⚠️ 請先執行 <code>python mfg_cors_proxy.py</code>，請求將由 localhost:8080 轉發
              </div>
            )}
            {formCorsProxyMode === 'vercel' && (
              <div style={{ fontSize: 11, color: 'var(--success, #10b981)', background: 'rgba(16,185,129,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 2 }}>
                ✅ 使用本站 /api/proxy Serverless Function 轉發，無需額外設定
              </div>
            )}
            {formCorsProxyMode === 'custom' && formCorsProxyUrl && (
              <div style={{ fontSize: 11, color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 2 }}>
                ⚠️ 自訂代理需支援 <code>?url=</code> 查詢參數轉發
              </div>
            )}
            {testStatus && <div className={`ai-test-status ${testStatus.type}`}>{testStatus.text}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13, padding: '8px 0' }} onClick={testConnection}>連線測試</button>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 13, padding: '8px 0' }} onClick={saveSettings}>儲存設定</button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13, padding: '8px 10px', color: 'var(--danger, #ef4444)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => { clearMessages(); setShowSettings(false); }}
                title="清除對話紀錄"
              >
                🗑️ 清除對話
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 10px' }} onClick={() => setShowSettings(false)}>✕</button>
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

        {/* Quick questions：初始問題 or 追加問題 */}
        {!isStreaming && (
          messages.length === 0 ? (
            <div className="ai-qr">
              {pageQuestions.map((q, i) => (
                <button key={i} className="ai-qr-btn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          ) : lastAssistantMsg ? (
            <div className="ai-qr ai-qr-followup">
              <div className="ai-qr-followup-label">💬 繼續追問</div>
              {getFollowupQuestions(pageRoot, lastAssistantMsg.content).map((q, i) => (
                <button key={i} className="ai-qr-btn ai-qr-btn--followup" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          ) : null
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
