# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 專案架構：Single-SPA 微前端

本專案採用 **Single-SPA 微前端架構**，由一個 Shell 與多個獨立的 Page 微前端組成。

### 套件結構

```
manufacturing-dashboard-v4/
├── packages/
│   ├── shell/              # 主 Shell（port 9000+）
│   │   └── src/
│   │       ├── index.tsx   # Single-SPA 入口
│   │       ├── App.tsx     # Shell 主元件
│   │       └── components/
│   │           └── Sidebar.tsx  # 側邊導覽列（36 個路由）
│   ├── page-overview/       # 工廠總覽頁（port 9001）
│   ├── page-inventory/      # 庫存分析頁（port 9002）
│   ├── page-procurement/    # 採購分析頁（port 9003）
│   └── page-supplier/       # 供應商分析頁（port 9004）
```

### 已實作的頁面（4 個）

| 套件 | 路由 | 功能 |
|------|------|------|
| `page-overview` | `/overview` | KPI 卡片、OEE 趨勢圖、異常警訊、工廠健康度 |
| `page-inventory` | `/inventory` | 庫存分佈圖、呆滯庫存表格 |
| `page-procurement` | `/procurement` | 採購趨勢圖、供應商表現 |
| `page-supplier` | `/supplier` | 供應商評分卡、風險評估 |

### 尚未實作的路由（32 個）

Sidebar.tsx 定義了 36 個路由，但僅實作上述 4 個。其餘路由點擊後無內容。

---

## 常用指令

### 啟動開發環境

```bash
cd C:\Users\jamic\製造業分析\manufacturing-dashboard-v4

# 安裝依賴
npm install

# 啟動所有微前端（各自運行在不同 port）
npm run dev
```

### 個別啟動微前端

```bash
# Shell（port 9000+）
cd packages/shell && npm run dev

# 各 Page 微前端
cd packages/page-overview && npm run dev   # port 9001
cd packages/page-inventory && npm run dev  # port 9002
cd packages/page-procurement && npm run dev # port 9003
cd packages/page-supplier && npm run dev  # port 9004
```

### 建置生產版本

```bash
npm run build
```

---

## 重要技術細節

### React 版本相容性

**關鍵規則**：所有 entry point（`src/index.tsx`）必須使用 React 17 的 API：

```tsx
// ✅ 正確
import ReactDOM from 'react-dom';

// ❌ 錯誤（會導致 ReactDOM.render is not a function）
import ReactDOM from 'react-dom/client';
```

**原因**：`single-spa-react` v4.6.1 內部呼叫 `ReactDOM.render()`（React 17 API），與 React 18 的 `createRoot` API 不相容。

受影響的檔案：
- `packages/page-overview/src/index.tsx`
- `packages/page-inventory/src/index.tsx`
- `packages/page-procurement/src/index.tsx`
- `packages/page-supplier/src/index.tsx`

### Vite Dev 模式行為

Vite 在 dev 模式下會將所有依賴 bundling 到記憶體中（約 9.6 MB），而非磁碟。這是**正常行為**，不是錯誤。

驗證頁面是否正確執行，應使用瀏覽器 snapshot 或 DevTools，而非檢查磁碟檔案大小。

---

## 已知 Bug

### 已修復

1. **Duplicate key "name"**（InventoryPage.tsx:66）
   - 陣列中物件有重複的 `name` 屬性
   - 已移除重複項目

2. **ReactDOM.render is not a function**
   - 所有 entry point 已改用 `import ReactDOM from 'react-dom'`

### 尚未修復

- 其餘 32 個路由無實際內容（需實作對應的 Page 微前端）

---

## 添加新頁面的步驟

1. 在 `packages/` 下建立新套件（如 `page-xxx`）
2. 使用 `single-spa-react` 設定 entry point
3. 實作頁面元件（如 `XxxPage.tsx`）
4. 在 `Sidebar.tsx` 中新增路由定義
5. 在 workspace 的 `package.json` 中加入 `xxx` 到 `packages` 陣列
