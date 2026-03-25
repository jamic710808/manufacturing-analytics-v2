/**
 * importUtils.ts — Excel 匯入解析工具
 *
 * 解析上傳的 .xlsx 檔案，辨識模組 → 驗證結構 → 轉換為應用資料格式。
 */
import * as XLSX from 'xlsx';
import type {
  ModuleId, AllModuleData,
  OverviewData, InventoryData, ProcurementData,
  SupplierData, CostData, ProductionData,
} from '../data/defaultData';
import { defaultData } from '../data/defaultData';

// ── 匯入結果介面 ──────────────────────────────────────

export interface ImportResult {
  success: boolean;
  moduleId: ModuleId | null;
  sheetName: string;
  data: Partial<AllModuleData[ModuleId]> | null;
  errors: string[];
  warnings: string[];
  rowCount: number;
}

// ── 工作表辨識 ─────────────────────────────────────────

/** 根據工作表名稱辨識模組 */
function detectModule(sheetName: string): { moduleId: ModuleId; subType: string } | null {
  const name = sheetName.toLowerCase();

  if (name.includes('總覽') || name.includes('kpi') || name.includes('警訊')) {
    return { moduleId: 'overview', subType: name.includes('警訊') ? 'alerts' : 'kpis' };
  }
  if (name.includes('庫存') || name.includes('倉庫')) {
    return { moduleId: 'inventory', subType: name.includes('倉庫') ? 'warehouses' : 'categories' };
  }
  if (name.includes('採購') || name.includes('延遲') || name.includes('po')) {
    return { moduleId: 'procurement', subType: name.includes('延遲') || name.includes('po') ? 'orders' : 'categories' };
  }
  if (name.includes('供應商')) {
    return { moduleId: 'supplier', subType: 'suppliers' };
  }
  if (name.includes('bom') || name.includes('成本')) {
    return { moduleId: 'cost', subType: name.includes('差異') ? 'variances' : 'bom' };
  }
  if (name.includes('oee') || name.includes('設備') || name.includes('良率') || name.includes('生產') || name.includes('產品')) {
    return { moduleId: 'production', subType: name.includes('良率') || name.includes('產品') ? 'yield' : 'oee' };
  }

  return null;
}

// ── 輔助驗證 ──────────────────────────────────────────

function toNum(val: unknown, fallback = 0): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(/[,%$]/g, ''));
    return isNaN(n) ? fallback : n;
  }
  return fallback;
}

function toStr(val: unknown, fallback = ''): string {
  if (val == null) return fallback;
  return String(val).trim();
}

/** 讀取工作表資料列（跳過前 3 列：標題/說明/空白） */
function readDataRows(ws: XLSX.WorkSheet): Record<string, unknown>[] {
  // 先嘗試找到表頭列（第 4 列，index 3）
  const allRows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

  if (allRows.length < 4) return [];

  // 取第 4 列作為表頭
  const headerRow = allRows[3] as (string | number | undefined)[];
  const headers = headerRow.map(h => toStr(h));

  // 從第 5 列開始讀資料
  const dataRows: Record<string, unknown>[] = [];
  for (let i = 4; i < allRows.length; i++) {
    const row = allRows[i] as (string | number | undefined)[];
    if (!row || row.every(cell => cell == null || cell === '')) continue;

    const obj: Record<string, unknown> = {};
    headers.forEach((h, ci) => {
      if (h) obj[h] = row[ci];
    });
    dataRows.push(obj);
  }

  return dataRows;
}

// ── 各模組解析器 ──────────────────────────────────────

function parseOverviewKpis(rows: Record<string, unknown>[]): Partial<OverviewData> {
  const kpis = rows.map((r, i) => ({
    id: toStr(r['指標ID']) || `kpi-${i}`,
    label: toStr(r['指標名稱']),
    value: toNum(r['數值']),
    unit: toStr(r['單位']),
    trend: toNum(r['趨勢(%)']),
    trendLabel: toStr(r['趨勢說明']),
  }));
  return { kpis };
}

function parseOverviewAlerts(rows: Record<string, unknown>[]): Partial<OverviewData> {
  const alerts = rows.map((r, i) => ({
    id: toStr(r['警訊ID']) || `alert-${i}`,
    level: toStr(r['等級'], 'P3') as 'P1' | 'P2' | 'P3',
    title: toStr(r['標題']),
    description: toStr(r['說明']),
    time: toStr(r['時間']),
    location: toStr(r['位置']),
  }));
  return { alerts };
}

function parseInventoryCategories(rows: Record<string, unknown>[]): Partial<InventoryData> {
  const categories = rows.map(r => ({
    name: toStr(r['類別名稱']),
    value: toNum(r['庫存金額(NTD)']),
  }));
  const totalValue = categories.reduce((sum, c) => sum + c.value, 0);
  return { categories, totalValue };
}

function parseInventoryWarehouses(rows: Record<string, unknown>[]): Partial<InventoryData> {
  const warehouses = rows.map(r => ({
    name: toStr(r['倉庫名稱']),
    capacity: toNum(r['總容量(棧板)']),
    used: toNum(r['已使用(棧板)']),
    turnover: toNum(r['週轉率(次/年)']),
    status: toStr(r['狀態'], 'good'),
  }));
  return { warehouses };
}

function parseProcurementCategories(rows: Record<string, unknown>[]): Partial<ProcurementData> {
  const categories = rows.map(r => ({
    name: toStr(r['品類名稱']),
    amount: toNum(r['採購金額(NTD)']),
    budget: toNum(r['年度預算(NTD)']),
    suppliers: toNum(r['供應商數']),
    topSupplier: toStr(r['主要供應商']),
  }));
  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);
  return { categories, totalAmount };
}

function parseProcurementOrders(rows: Record<string, unknown>[]): Partial<ProcurementData> {
  const delayedOrders = rows.map(r => ({
    po: toStr(r['PO編號']),
    supplier: toStr(r['供應商']),
    item: toStr(r['品名']),
    promiseDate: toStr(r['承諾交期']),
    eta: toStr(r['預計到貨']),
    delay: toNum(r['延遲天數']),
    reason: toStr(r['延遲原因']),
    impact: toStr(r['影響生產(是/否)']) === '是',
  }));
  return { delayedOrders };
}

function parseSuppliers(rows: Record<string, unknown>[]): Partial<SupplierData> {
  const suppliers = rows.map(r => ({
    code: toStr(r['代碼']),
    name: toStr(r['供應商名稱']),
    country: toStr(r['國家']),
    category: toStr(r['品類']),
    otd: toNum(r['交期OTD(%)']),
    quality: toNum(r['品質(%)']),
    price: toNum(r['價格(%)']),
    service: toNum(r['服務(%)']),
    years: toNum(r['合作年數']),
    volume: toNum(r['年採購額(M)']),
  }));
  const avgScore = suppliers.length > 0
    ? suppliers.reduce((sum, s) => sum + (s.otd + s.quality + s.price + s.service) / 4, 0) / suppliers.length
    : 0;
  return {
    suppliers,
    totalCount: suppliers.length,
    avgScore: Math.round(avgScore * 10) / 10,
    excellentCount: suppliers.filter(s => (s.otd + s.quality + s.price + s.service) / 4 >= 95).length,
    improvementCount: suppliers.filter(s => (s.otd + s.quality + s.price + s.service) / 4 < 85).length,
  };
}

function parseCostBom(rows: Record<string, unknown>[]): Partial<CostData> {
  const bomItems = rows.map(r => ({
    level: toStr(r['層級']),
    code: toStr(r['料號']),
    name: toStr(r['品名規格']),
    qty: toStr(r['用量']),
    unitCost: toNum(r['單位成本(NTD)']),
    totalCost: toNum(r['合計成本(NTD)']),
    percentage: toNum(r['佔比(%)']),
    category: toStr(r['成本類別']),
  }));
  return { bomItems };
}

function parseCostVariances(rows: Record<string, unknown>[]): Partial<CostData> {
  const variances = rows.map(r => ({
    type: toStr(r['差異類型']),
    amount: toNum(r['差異金額(元/件)']),
    reason: toStr(r['主要原因']),
    dept: toStr(r['責任部門']),
    action: toStr(r['改善措施']),
  }));
  return { variances };
}

function parseProductionOEE(rows: Record<string, unknown>[]): Partial<ProductionData> {
  const oeeData = rows.map((r, i) => ({
    id: toStr(r['設備ID']) || `${i + 1}`,
    equipmentName: toStr(r['設備名稱']),
    availability: toNum(r['可用率(%)']),
    performance: toNum(r['生產性(%)']),
    quality: toNum(r['品質率(%)']),
    oee: toNum(r['OEE(%)']),
    status: toStr(r['狀態'], 'good') as ProductionData['oeeData'][0]['status'],
  }));
  const overallOEE = oeeData.length > 0
    ? Math.round(oeeData.reduce((sum, e) => sum + e.oee, 0) / oeeData.length * 10) / 10
    : 0;
  return { oeeData, overallOEE };
}

function parseProductionYield(rows: Record<string, unknown>[]): Partial<ProductionData> {
  const yieldData = rows.map((r, i) => ({
    id: toStr(r['產品ID']) || `${i + 1}`,
    productName: toStr(r['產品名稱']),
    targetYield: toNum(r['目標良率(%)']),
    actualYield: toNum(r['實際良率(%)']),
    output: toNum(r['產出量(件)']),
    defectRate: toNum(r['不良率(%)']),
  }));
  const avgYield = yieldData.length > 0
    ? Math.round(yieldData.reduce((sum, y) => sum + y.actualYield, 0) / yieldData.length * 10) / 10
    : 0;
  const totalOutput = yieldData.reduce((sum, y) => sum + y.output, 0);
  return { yieldData, avgYield, totalOutput };
}

// ── 主解析函式 ─────────────────────────────────────────

/** 解析上傳的 Excel 檔案，回傳各工作表的解析結果 */
export async function parseExcelFile(file: File): Promise<ImportResult[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const results: ImportResult[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const detected = detectModule(sheetName);

    if (!detected) {
      results.push({
        success: false,
        moduleId: null,
        sheetName,
        data: null,
        errors: [`無法辨識工作表「${sheetName}」屬於哪個模組`],
        warnings: [],
        rowCount: 0,
      });
      continue;
    }

    const { moduleId, subType } = detected;
    const rows = readDataRows(ws);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (rows.length === 0) {
      warnings.push(`工作表「${sheetName}」沒有資料列`);
    }

    // 根據模組 + 子類型解析
    let parsed: Partial<AllModuleData[ModuleId]> | null = null;

    try {
      switch (moduleId) {
        case 'overview':
          parsed = subType === 'alerts' ? parseOverviewAlerts(rows) : parseOverviewKpis(rows);
          break;
        case 'inventory':
          parsed = subType === 'warehouses' ? parseInventoryWarehouses(rows) : parseInventoryCategories(rows);
          break;
        case 'procurement':
          parsed = subType === 'orders' ? parseProcurementOrders(rows) : parseProcurementCategories(rows);
          break;
        case 'supplier':
          parsed = parseSuppliers(rows);
          break;
        case 'cost':
          parsed = subType === 'variances' ? parseCostVariances(rows) : parseCostBom(rows);
          break;
        case 'production':
          parsed = subType === 'yield' ? parseProductionYield(rows) : parseProductionOEE(rows);
          break;
      }
    } catch (err) {
      errors.push(`解析「${sheetName}」時發生錯誤：${err instanceof Error ? err.message : '未知錯誤'}`);
    }

    results.push({
      success: errors.length === 0,
      moduleId,
      sheetName,
      data: parsed,
      errors,
      warnings,
      rowCount: rows.length,
    });
  }

  return results;
}

/** 將多個 ImportResult 合併為各模組的完整資料（與預設資料合併） */
export function mergeImportResults(
  results: ImportResult[],
  currentData: AllModuleData,
): Partial<Record<ModuleId, AllModuleData[ModuleId]>> {
  const merged: Partial<Record<ModuleId, AllModuleData[ModuleId]>> = {};

  for (const result of results) {
    if (!result.success || !result.moduleId || !result.data) continue;

    const moduleId = result.moduleId;
    // 以現有資料為基底，覆蓋匯入的部分
    const existing = merged[moduleId] ?? { ...currentData[moduleId] };
    merged[moduleId] = { ...existing, ...result.data } as AllModuleData[ModuleId];
  }

  return merged;
}
