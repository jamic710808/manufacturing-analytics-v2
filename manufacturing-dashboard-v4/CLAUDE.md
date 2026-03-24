# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 專案資訊

**專案名稱**：製造業分析儀表板 V4
**當前版本**：V4.1
**最後更新**：2026-03-25
**GitHub**：https://github.com/jamic710808/manufacturing-analytics-v2

---

## 記憶提示（ Memory Hints ）

### 重要歷史紀錄

| 日期 | 版本 | 事件 |
|------|------|------|
| 2026-03-23 | V4.0 | 完成所有頁面開發（React + Vite 架構） |
| 2026-03-24 | V4.1 | 新增駕駛艙、標竿管理、報告生成器、系統設定、價值流分析 |
| 2026-03-25 | - | 修復 Sidebar emoji 雙重顯示、推送至 GitHub、建立 vercel.json |

### 已完成的 V4.1 功能

- **駕駛艙**（`/dashboard/cockpit`）— 6 KPI 卡片、產能趨勢、即時告警
- **標竿管理**（`/dashboard/benchmark`）— 四層級對比柱狀圖
- **報告生成器**（`/reports/generator`）— 6 種報告類型、日期設定、格式選擇
- **系統設定**（`/reports/settings`）— 自動重新整理、貨幣、主題、語言
- **價值流分析**（`/simulation/value`）— 6 階段流程、瓶頸識別

### 已修復的 Bug

1. `DashboardPage.tsx:134` — `}}}` 語法錯誤（已修正為 `}}`）
2. `Sidebar.tsx` — emoji 雙重顯示（已移除 label 中的 emoji，僅保留 icon 欄位）

---

## 專案架構

**技術棧**：React 18 + TypeScript 5 + Vite 5 + React Router v6

```
manufacturing-dashboard-v4/
├── src/
│   ├── App.tsx              # 路由設定（lazy loading）
│   ├── main.tsx             # 入口
│   ├── components/
│   │   └── Sidebar.tsx     # 側邊導覽列（11 個群組、36 個路由）
│   └── pages/
│       ├── dashboard/
│       │   └── DashboardPage.tsx   # 駕駛艙 + 標竿管理
│       ├── reports/
│       │   └── ReportsPage.tsx      # 報告生成 + 系統設定
│       ├── simulation/
│       │   └── SimulationPage.tsx   # 價值流分析 + What-If
│       └── kb/
│           └── KBPage.tsx          # DAX 知識庫
├── vercel.json               # Vercel 部署設定
├── index.html
└── package.json
```

---

## 常用指令

```bash
cd C:\Users\jamic\製造業分析\manufacturing-dashboard-v4

# 啟動開發環境（port 3002）
npm run dev

# 建置生產版本
npm run build

# 型別檢查
npm run lint
```

---

## 部署

### GitHub 推送
```bash
git add . && git commit -m "訊息" && git push origin main
```

### Vercel 部署
1. 前往 [vercel.com](https://vercel.com) → Add New Project → 選擇此倉庫
2. 或使用 CLI：`npx vercel --prod`

**注意**：大型 PDF 檔案（>50MB）會觸發 GitHub LFS 警告，但推送仍會成功。

---

## 開發注意事項

### React Router 子路由模式

使用 `useLocation()` + 正規表達式匹配：
```tsx
const match = location.pathname.match(/^\/dashboard\/?(.*)$/);
const subRoute = match ? (match[1] || 'cockpit') : 'cockpit';
```

### Glass-morphism UI 樣式

統一的 `.glass-panel` 樣式系統，使用 CSS 變數：
- `var(--glass-bg)` — 玻璃背景
- `var(--glass-border)` — 邊框
- `var(--accent)` — 主色調
- `var(--text-primary)` / `var(--text-secondary)` — 文字顏色

### Sidebar 導航群組

共 11 個群組，emoji 應只出現在 `icon` 欄位，`label` 僅放中文名稱。

---

## 文件

| 檔案 | 說明 |
|------|------|
| `修改紀錄_V4.md` | 版本變更歷程 |
| `使用說明書_報告與設定.md` | 報告生成器與系統設定操作手冊 |
| `檢討報告_V4.md` | V4 開發過程技術檢討 |
