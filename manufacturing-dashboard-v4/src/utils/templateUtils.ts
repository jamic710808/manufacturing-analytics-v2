/**
 * templateUtils.ts — Excel 範本生成工具
 *
 * 生成各模組的 Excel 範例檔案（含表頭 + 範例資料），
 * 使用者下載後可修改數值再上傳匯入。
 */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { defaultData, moduleLabels, type ModuleId } from '../data/defaultData';

interface SheetDef {
  sheetName: string;
  title: string;
  instruction: string;
  headers: string[];
  dataMapper: () => (string | number)[][];
}

// ── 各模組工作表定義 ────────────────────────────────────

const sheetDefs: Record<ModuleId, SheetDef[]> = {
  overview: [
    {
      sheetName: '總覽KPI',
      title: '工廠總覽 — KPI 指標',
      instruction: '請填入 KPI 數值，系統將自動更新總覽頁面。trend 為正表示上升，負表示下降。',
      headers: ['指標ID', '指標名稱', '數值', '單位', '趨勢(%)', '趨勢說明'],
      dataMapper: () => defaultData.overview.kpis.map(k => [k.id, k.label, k.value, k.unit, k.trend, k.trendLabel]),
    },
    {
      sheetName: '總覽警訊',
      title: '工廠總覽 — 異常警訊',
      instruction: '請填入異常警訊，等級可為 P1（緊急）、P2（警告）、P3（注意）。',
      headers: ['警訊ID', '等級', '標題', '說明', '時間', '位置'],
      dataMapper: () => defaultData.overview.alerts.map(a => [a.id, a.level, a.title, a.description, a.time, a.location]),
    },
  ],

  inventory: [
    {
      sheetName: '庫存類別',
      title: '庫存分析 — 類別分佈',
      instruction: '請填入各類別庫存金額（NTD），系統將自動計算佔比。',
      headers: ['類別名稱', '庫存金額(NTD)'],
      dataMapper: () => defaultData.inventory.categories.map(c => [c.name, c.value]),
    },
    {
      sheetName: '倉庫明細',
      title: '庫存分析 — 倉庫利用率',
      instruction: '請填入倉庫資訊，容量與已使用為棧板數，週轉率為次/年。狀態：good / warning。',
      headers: ['倉庫名稱', '總容量(棧板)', '已使用(棧板)', '週轉率(次/年)', '狀態'],
      dataMapper: () => defaultData.inventory.warehouses.map(w => [w.name, w.capacity, w.used, w.turnover, w.status]),
    },
  ],

  procurement: [
    {
      sheetName: '採購品類',
      title: '採購分析 — 品類支出',
      instruction: '請填入各品類採購金額與預算（NTD）。',
      headers: ['品類名稱', '採購金額(NTD)', '年度預算(NTD)', '供應商數', '主要供應商'],
      dataMapper: () => defaultData.procurement.categories.map(c => [c.name, c.amount, c.budget, c.suppliers, c.topSupplier]),
    },
    {
      sheetName: '延遲訂單',
      title: '採購分析 — 延遲 PO',
      instruction: '請填入延遲交付的 PO 明細。',
      headers: ['PO編號', '供應商', '品名', '承諾交期', '預計到貨', '延遲天數', '延遲原因', '影響生產(是/否)'],
      dataMapper: () => defaultData.procurement.delayedOrders.map(o => [o.po, o.supplier, o.item, o.promiseDate, o.eta, o.delay, o.reason, o.impact ? '是' : '否']),
    },
  ],

  supplier: [
    {
      sheetName: '供應商評分',
      title: '供應商分析 — 評分卡',
      instruction: '請填入供應商各維度分數（0~100），系統自動計算綜合評分。',
      headers: ['代碼', '供應商名稱', '國家', '品類', '交期OTD(%)', '品質(%)', '價格(%)', '服務(%)', '合作年數', '年採購額(M)'],
      dataMapper: () => defaultData.supplier.suppliers.map(s => [s.code, s.name, s.country, s.category, s.otd, s.quality, s.price, s.service, s.years, s.volume]),
    },
  ],

  cost: [
    {
      sheetName: 'BOM成本',
      title: '成本分析 — BOM 明細',
      instruction: '請填入 BOM 項目的成本資訊。類別：直接材料 / 直接人工 / 製造費用。',
      headers: ['層級', '料號', '品名規格', '用量', '單位成本(NTD)', '合計成本(NTD)', '佔比(%)', '成本類別'],
      dataMapper: () => defaultData.cost.bomItems.map(b => [b.level, b.code, b.name, b.qty, b.unitCost, b.totalCost, b.percentage, b.category]),
    },
    {
      sheetName: '成本差異',
      title: '成本分析 — 差異追蹤',
      instruction: '正值為有利差異，負值為不利差異。',
      headers: ['差異類型', '差異金額(元/件)', '主要原因', '責任部門', '改善措施'],
      dataMapper: () => defaultData.cost.variances.map(v => [v.type, v.amount, v.reason, v.dept, v.action]),
    },
  ],

  production: [
    {
      sheetName: 'OEE設備效率',
      title: '生產與品質 — OEE',
      instruction: '請填入各設備的可用率、生產性、品質率（%），系統自動計算 OEE。狀態：excellent / good / warning / critical。',
      headers: ['設備ID', '設備名稱', '可用率(%)', '生產性(%)', '品質率(%)', 'OEE(%)', '狀態'],
      dataMapper: () => defaultData.production.oeeData.map(e => [e.id, e.equipmentName, e.availability, e.performance, e.quality, e.oee, e.status]),
    },
    {
      sheetName: '產品良率',
      title: '生產與品質 — 良率',
      instruction: '請填入各產品的目標良率與實際良率（%），產出量（件），不良率（%）。',
      headers: ['產品ID', '產品名稱', '目標良率(%)', '實際良率(%)', '產出量(件)', '不良率(%)'],
      dataMapper: () => defaultData.production.yieldData.map(y => [y.id, y.productName, y.targetYield, y.actualYield, y.output, y.defectRate]),
    },
  ],
};

// ── 範本生成函式 ────────────────────────────────────────

/** 建立一個工作表（含標題、說明、表頭、範例資料） */
function buildSheet(def: SheetDef): XLSX.WorkSheet {
  const rows: (string | number)[][] = [];

  // 第 1 列：標題
  rows.push([def.title]);
  // 第 2 列：填寫說明
  rows.push([def.instruction]);
  // 第 3 列：空白
  rows.push([]);
  // 第 4 列：表頭
  rows.push(def.headers);
  // 第 5+ 列：範例資料
  rows.push(...def.dataMapper());

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // 設定欄寬
  ws['!cols'] = def.headers.map(() => ({ wch: 18 }));

  return ws;
}

/** 生成單一模組的 Excel 範本 */
export function generateModuleTemplate(moduleId: ModuleId): void {
  const defs = sheetDefs[moduleId];
  if (!defs || defs.length === 0) return;

  const wb = XLSX.utils.book_new();
  defs.forEach(def => {
    const ws = buildSheet(def);
    XLSX.utils.book_append_sheet(wb, ws, def.sheetName);
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${moduleLabels[moduleId]}_範本.xlsx`);
}

/** 生成所有模組的合併 Excel 範本 */
export function generateAllTemplates(): void {
  const wb = XLSX.utils.book_new();

  (Object.keys(sheetDefs) as ModuleId[]).forEach(moduleId => {
    sheetDefs[moduleId].forEach(def => {
      const ws = buildSheet(def);
      XLSX.utils.book_append_sheet(wb, ws, def.sheetName);
    });
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, '製造業儀表板_全模組範本.xlsx');
}
