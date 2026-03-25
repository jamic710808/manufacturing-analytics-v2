# 資料匯入系統 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 7 大模組的 Excel 範例檔案 + 上傳匯入機制，讓使用者可透過上傳 Excel 即時更新儀表板資料。

**Architecture:** 使用 React Context 作為全局資料存儲（持久化至 localStorage），SheetJS 解析上傳的 .xlsx 並驗證結構後更新 Context，各頁面從 Context 讀取資料而非硬編碼。報告生成同步使用最新匯入資料。

**Tech Stack:** React Context API, SheetJS (xlsx), file-saver, TypeScript

---

## 檔案結構

| 操作 | 檔案路徑 | 職責 |
|------|---------|------|
| Create | `src/data/defaultData.ts` | 7 大模組預設範例資料（取代各頁面硬編碼） |
| Create | `src/data/DataContext.tsx` | React Context + Provider，含 localStorage 持久化 |
| Create | `src/utils/templateUtils.ts` | 生成各模組 Excel 範例檔案（含表頭 + 範例資料） |
| Create | `src/utils/importUtils.ts` | 解析上傳 Excel → 驗證結構 → 轉換為應用資料格式 |
| Create | `src/pages/reports/DataManagementPage.tsx` | 資料管理 UI（上傳、下載範本、重置） |
| Modify | `src/pages/reports/ReportsPage.tsx` | 新增「資料管理」子分頁 |
| Modify | `src/data/reportData.ts` | 改為從 Context/defaultData 讀取 |
| Modify | `src/App.tsx` | 包裝 DataProvider |
| Modify | `src/pages/overview/OverviewPage.tsx` | 從 Context 讀取資料 |
| Modify | `src/pages/inventory/InventoryPage.tsx` | 從 Context 讀取資料 |
| Modify | `src/pages/procurement/ProcurementPage.tsx` | 從 Context 讀取資料 |
| Modify | `src/pages/supplier/SupplierPage.tsx` | 從 Context 讀取資料 |
| Modify | `src/pages/cost/CostPage.tsx` | 從 Context 讀取資料 |
| Modify | `src/pages/production/ProductionPage.tsx` | 從 Context 讀取資料 |

---

## Chunk 1: 資料層基礎設施

### Task 1: 建立 7 大模組預設資料 (defaultData.ts)

**Files:**
- Create: `src/data/defaultData.ts`

- [ ] **Step 1: 定義所有模組的 TypeScript 介面**

```typescript
// 各模組介面定義
export interface OverviewKPI {
  label: string; value: number; unit: string; trend: number; trendLabel: string;
}
export interface OverviewAlert {
  level: 'P1' | 'P2' | 'P3'; title: string; description: string; time: string; location: string;
}
export interface OverviewData { kpis: OverviewKPI[]; alerts: OverviewAlert[]; }

export interface InventoryCategory { name: string; value: number; }
export interface InventoryWarehouse {
  name: string; capacity: number; used: number; turnover: number; status: string;
}
export interface InventoryData {
  categories: InventoryCategory[]; warehouses: InventoryWarehouse[];
  totalValue: number; turnoverRate: number; avgDays: number; utilization: number;
}

export interface ProcurementOrder {
  poNo: string; vendor: string; item: string; qty: number;
  amount: number; orderDate: string; dueDate: string; status: string;
}
export interface ProcurementData {
  orders: ProcurementOrder[];
  totalOrders: number; onTimeRate: number; avgLeadTime: number; totalAmount: number;
}

export interface SupplierScore {
  code: string; name: string; country: string; category: string;
  otd: number; quality: number; price: number; service: number; years: number; volume: number;
}
export interface SupplierData {
  suppliers: SupplierScore[];
  totalCount: number; avgScore: number; excellentCount: number; improvementCount: number;
}

export interface CostBomItem {
  item: string; amount: number; percentage: number; category: string;
}
export interface CostData {
  bomItems: CostBomItem[];
  standardCost: number; materialRatio: number; laborRatio: number; overheadRatio: number;
}

export interface ProductionOEE {
  equipmentName: string; availability: number; performance: number; quality: number; oee: number; status: string;
}
export interface ProductionYield {
  productName: string; targetYield: number; actualYield: number; output: number; defectRate: number;
}
export interface ProductionData {
  oeeData: ProductionOEE[]; yieldData: ProductionYield[];
  overallOEE: number; avgYield: number; totalOutput: number; defectRate: number;
}

export interface AllModuleData {
  overview: OverviewData;
  inventory: InventoryData;
  procurement: ProcurementData;
  supplier: SupplierData;
  cost: CostData;
  production: ProductionData;
}
```

- [ ] **Step 2: 填入各模組的範例資料**

從現有各頁面元件中提取硬編碼資料，整合至 `defaultData` 常數。每個模組的資料量：
- Overview: 4 KPI + 5 Alerts
- Inventory: 5 類別 + 5 倉庫
- Procurement: 8 筆採購單
- Supplier: 6 家供應商
- Cost: 11 筆 BOM 項目
- Production: 6 設備 OEE + 5 產品良率

- [ ] **Step 3: 匯出預設資料與類型**

```typescript
export const defaultData: AllModuleData = { ... };
export type ModuleId = keyof AllModuleData;
```

---

### Task 2: 建立 DataContext

**Files:**
- Create: `src/data/DataContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 建立 DataContext + Provider**

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { defaultData, type AllModuleData, type ModuleId } from './defaultData';

const STORAGE_KEY = 'mfg-dashboard-data';

interface DataContextType {
  data: AllModuleData;
  updateModule: (moduleId: ModuleId, moduleData: Partial<AllModuleData[ModuleId]>) => void;
  resetModule: (moduleId: ModuleId) => void;
  resetAll: () => void;
  isCustomData: (moduleId: ModuleId) => boolean;
  lastUpdated: Record<ModuleId, string | null>;
}

// Provider 實作：useState + localStorage 持久化
```

- [ ] **Step 2: 實作 localStorage 持久化**

- 初始化時從 localStorage 讀取
- 每次 updateModule 時寫入 localStorage
- resetModule / resetAll 清除對應 key
- lastUpdated 記錄各模組最後更新時間

- [ ] **Step 3: 在 App.tsx 包裝 DataProvider**

```typescript
// App.tsx
import { DataProvider } from './data/DataContext';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        {/* ... existing routes */}
      </BrowserRouter>
    </DataProvider>
  );
}
```

- [ ] **Step 4: 確認 TypeScript 編譯通過**

Run: `npx tsc --noEmit`
Expected: EXIT 0

---

## Chunk 2: Excel 範本生成與匯入解析

### Task 3: 建立 Excel 範本生成工具 (templateUtils.ts)

**Files:**
- Create: `src/utils/templateUtils.ts`

- [ ] **Step 1: 建立各模組工作表結構定義**

每個模組的 Excel 範本包含：
- 第 1 列：模組標題
- 第 2 列：說明文字（填寫指引）
- 第 3 列：空白
- 第 4 列：欄位表頭（中文）
- 第 5+ 列：範例資料

```typescript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { defaultData } from '../data/defaultData';

interface SheetDef {
  sheetName: string;
  title: string;
  instruction: string;
  headers: string[];
  dataMapper: (data: any) => (string | number)[][];
}
```

- [ ] **Step 2: 定義 7 個模組的工作表結構**

```typescript
// 範例：庫存模組
{
  sheetName: '庫存類別',
  title: '庫存類別分佈',
  instruction: '請填入各類別庫存金額，系統將自動計算佔比',
  headers: ['類別名稱', '庫存金額 (NTD)'],
  dataMapper: (data) => data.inventory.categories.map(c => [c.name, c.value])
}
```

每個模組可能有 1~3 個工作表（對應子頁面）。

- [ ] **Step 3: 實作範本生成函式**

```typescript
/** 生成單一模組的 Excel 範本 */
export function generateModuleTemplate(moduleId: ModuleId): void

/** 生成所有模組的合併 Excel 範本 */
export function generateAllTemplates(): void
```

每個函式：建立 Workbook → 加入工作表 → 設定欄寬 → 觸發下載

- [ ] **Step 4: 確認 TypeScript 編譯通過**

Run: `npx tsc --noEmit`

---

### Task 4: 建立 Excel 匯入解析工具 (importUtils.ts)

**Files:**
- Create: `src/utils/importUtils.ts`

- [ ] **Step 1: 定義匯入結果介面**

```typescript
export interface ImportResult {
  success: boolean;
  moduleId: ModuleId | null;
  data: Partial<AllModuleData[ModuleId]> | null;
  errors: string[];
  warnings: string[];
  rowCount: number;
}
```

- [ ] **Step 2: 實作工作表辨識邏輯**

根據工作表名稱或第 1 列標題自動辨識是哪個模組：
- 含「庫存」→ inventory
- 含「採購」→ procurement
- 含「供應商」→ supplier
- 含「成本」/ 含「BOM」→ cost
- 含「生產」/ 含「OEE」/ 含「良率」→ production
- 含「總覽」/ 含「KPI」→ overview

- [ ] **Step 3: 實作各模組的欄位解析與驗證**

```typescript
/** 解析上傳的 Excel 檔案 */
export async function parseExcelFile(file: File): Promise<ImportResult[]>
```

解析流程：
1. 用 SheetJS 讀取 ArrayBuffer
2. 遍歷每個工作表
3. 跳過標題/說明列（前 3 列）
4. 讀取表頭列（第 4 列）做欄位對應
5. 讀取資料列，轉換為對應介面
6. 驗證必填欄位、數值範圍
7. 回傳 ImportResult

- [ ] **Step 4: 實作數值驗證**

```typescript
function validateNumeric(value: any, field: string, min?: number, max?: number): string | null
function validateRequired(value: any, field: string): string | null
```

- 百分比欄位：0~100
- 金額/數量欄位：≥ 0
- 必填欄位不可為空

- [ ] **Step 5: 確認 TypeScript 編譯通過**

Run: `npx tsc --noEmit`

---

## Chunk 3: 資料管理 UI + 頁面串接

### Task 5: 建立資料管理頁面 (DataManagementPage.tsx)

**Files:**
- Create: `src/pages/reports/DataManagementPage.tsx`
- Modify: `src/pages/reports/ReportsPage.tsx`

- [ ] **Step 1: 建立資料管理 UI 元件**

頁面分為三區：
1. **模組狀態卡片** — 顯示每個模組的資料來源（預設/自訂）、最後更新時間
2. **下載範本區** — 按模組下載 Excel 範本，或一次下載全部
3. **上傳匯入區** — 拖放/選擇 .xlsx 檔案，顯示解析結果

- [ ] **Step 2: 實作檔案上傳元件**

```tsx
// 支援拖放 + 點擊選擇
<input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
```

上傳流程：
1. 讀取 File → parseExcelFile()
2. 顯示解析結果（成功筆數、警告、錯誤）
3. 使用者確認後 → updateModule() 更新 Context

- [ ] **Step 3: 實作模組狀態卡片**

```tsx
// 7 個模組卡片，每個顯示：
// - 模組名稱 + icon
// - 狀態 badge（預設資料 / 已匯入自訂資料）
// - 最後更新時間
// - 操作按鈕（下載範本 / 重置為預設）
```

- [ ] **Step 4: 在 ReportsPage 加入「資料管理」分頁**

```typescript
const subTabs = [
  { key: 'generator', label: '📋 報告生成', path: '/reports/generator' },
  { key: 'data', label: '📂 資料管理', path: '/reports/data' },
  { key: 'settings', label: '⚙️ 系統設定', path: '/reports/settings' },
];
```

- [ ] **Step 5: 確認 TypeScript 編譯通過**

Run: `npx tsc --noEmit`

---

### Task 6: 串接各頁面讀取 Context 資料

**Files:**
- Modify: `src/pages/overview/OverviewPage.tsx`
- Modify: `src/pages/inventory/InventoryPage.tsx`
- Modify: `src/pages/procurement/ProcurementPage.tsx`
- Modify: `src/pages/supplier/SupplierPage.tsx`
- Modify: `src/pages/cost/CostPage.tsx`
- Modify: `src/pages/production/ProductionPage.tsx`
- Modify: `src/data/reportData.ts`

- [ ] **Step 1: 修改各頁面的 useEffect 資料初始化**

修改模式（以 OverviewPage 為例）：

```typescript
// Before:
useEffect(() => {
  setTimeout(() => {
    setKpis([...hardcoded data...]);
    setLoading(false);
  }, 800);
}, []);

// After:
import { useData } from '../../data/DataContext';

const { data } = useData();
useEffect(() => {
  setTimeout(() => {
    setKpis(data.overview.kpis);
    setAlerts(data.overview.alerts);
    setLoading(false);
  }, 400);
}, [data.overview]);
```

對 6 個主要頁面重複此修改。

- [ ] **Step 2: 更新 reportData.ts 使用 Context 資料**

reportData.ts 的 `getReportData()` 改為接受 `AllModuleData` 參數，從中生成報告區段：

```typescript
export function getReportData(ids: ReportId[], moduleData: AllModuleData): ReportSection[]
```

- [ ] **Step 3: 更新 ReportsPage 傳入 Context 資料**

```typescript
const { data } = useData();
const sections = getReportData(selectedReports, data);
```

- [ ] **Step 4: 完整 TypeScript 編譯 + Vite 建置驗證**

Run: `npx tsc --noEmit && npx vite build`
Expected: EXIT 0, no errors

---

## Chunk 4: 驗收與清理

### Task 7: 端到端驗證

- [ ] **Step 1: 驗證預設資料載入**
  - 啟動 dev server
  - 各頁面確認與修改前顯示一致

- [ ] **Step 2: 驗證範本下載**
  - 進入資料管理頁面
  - 下載每個模組的 Excel 範本
  - 確認範本含表頭 + 範例資料

- [ ] **Step 3: 驗證資料匯入**
  - 修改範本中的數值
  - 上傳修改後的 Excel
  - 確認對應頁面的資料已更新
  - 確認報告生成使用更新後的資料

- [ ] **Step 4: 驗證持久化**
  - 匯入資料後重新整理頁面
  - 確認資料仍保留（localStorage）
  - 測試重置功能

- [ ] **Step 5: 生產建置**

Run: `npx vite build`
Expected: 建置成功，無錯誤
