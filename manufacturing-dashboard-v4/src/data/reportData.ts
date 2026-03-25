/**
 * reportData.ts — 報告生成專用資料模組
 *
 * 集中各頁面核心指標，供報告生成器統一取用。
 * 報告資料從 Context（AllModuleData）動態帶入。
 */

import type { AllModuleData } from './defaultData';

// ── 類型定義 ──────────────────────────────────────────

export interface KpiItem {
  label: string;
  value: string | number;
  unit: string;
  trend?: number;
  trendLabel?: string;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface ReportSection {
  title: string;
  kpis: KpiItem[];
  tables: { name: string; headers: string[]; rows: TableRow[] }[];
}

export type ReportId = 'overview' | 'inventory' | 'production' | 'cost' | 'supplier' | 'ai';

// ── 從 AllModuleData 動態建構 ReportSection ─────────────

/** 從 overview 資料建立 ReportSection */
function buildOverviewSection(d: AllModuleData['overview']): ReportSection {
  return {
    title: '經營總覽報告',
    kpis: d.kpis.map(k => ({
      label: k.label,
      value: k.value,
      unit: k.unit,
      trend: k.trend,
      trendLabel: k.trendLabel,
    })),
    tables: [
      {
        name: '異常警訊 Top 5',
        headers: ['等級', '標題', '說明', '時間', '位置'],
        rows: d.alerts.slice(0, 5).map(a => ({
          等級: a.level,
          標題: a.title,
          說明: a.description,
          時間: a.time,
          位置: a.location,
        })),
      },
    ],
  };
}

/** 從 inventory 資料建立 ReportSection */
function buildInventorySection(d: AllModuleData['inventory']): ReportSection {
  const totalValue = d.categories.reduce((s, c) => s + c.value, 0);
  return {
    title: '庫存分析報告',
    kpis: [
      { label: '總庫存金額', value: totalValue.toLocaleString(), unit: 'NTD' },
      { label: '庫存週轉率', value: d.turnoverRate, unit: '次/年' },
      { label: '平均庫存天數', value: d.avgDays, unit: '天' },
      { label: '倉庫利用率', value: d.utilization, unit: '%' },
    ],
    tables: [
      {
        name: '庫存類別分佈',
        headers: ['類別', '金額 (NTD)', '佔比'],
        rows: d.categories.map(c => ({
          類別: c.name,
          '金額 (NTD)': c.value.toLocaleString(),
          佔比: `${((c.value / totalValue) * 100).toFixed(1)}%`,
        })),
      },
      {
        name: '倉庫利用率明細',
        headers: ['倉庫名稱', '總容量', '已使用', '利用率', '週轉率', '狀態'],
        rows: d.warehouses.map(w => {
          const rate = (w.used / w.capacity) * 100;
          let 狀態 = '正常';
          if (rate >= 85) 狀態 = '注意';
          if (rate >= 95) 狀態 = '警告';
          return {
            倉庫名稱: w.name,
            總容量: w.capacity,
            已使用: w.used,
            利用率: `${rate.toFixed(1)}%`,
            週轉率: w.turnover,
            狀態,
          };
        }),
      },
    ],
  };
}

/** 從 production 資料建立 ReportSection */
function buildProductionSection(d: AllModuleData['production']): ReportSection {
  return {
    title: '生產效能報告',
    kpis: [
      { label: '整體 OEE', value: d.overallOEE, unit: '%' },
      { label: '平均良率', value: d.avgYield, unit: '%' },
      { label: '總產出量', value: d.totalOutput.toLocaleString(), unit: '件' },
      { label: '不良率', value: d.defectRate, unit: '%' },
    ],
    tables: [
      {
        name: 'OEE 設備效率',
        headers: ['設備名稱', '可用率 %', '生產性 %', '品質率 %', 'OEE %', '狀態'],
        rows: d.oeeData.map(o => ({
          設備名稱: o.equipmentName,
          '可用率 %': o.availability,
          '生產性 %': o.performance,
          '品質率 %': o.quality,
          'OEE %': o.oee,
          狀態: o.status === 'excellent' ? '優秀' : o.status === 'good' ? '良好' : o.status === 'warning' ? '注意' : '警告',
        })),
      },
      {
        name: '產品良率明細',
        headers: ['產品名稱', '目標良率 %', '實際良率 %', '產出量', '不良率 %'],
        rows: d.yieldData.map(y => ({
          產品名稱: y.productName,
          '目標良率 %': y.targetYield,
          '實際良率 %': y.actualYield,
          產出量: y.output.toLocaleString(),
          '不良率 %': y.defectRate.toFixed(1),
        })),
      },
    ],
  };
}

/** 從 cost 資料建立 ReportSection */
function buildCostSection(d: AllModuleData['cost']): ReportSection {
  return {
    title: '成本分析報告',
    kpis: [
      { label: '標準成本（每件）', value: d.standardCost.toLocaleString(), unit: 'NTD' },
      { label: '直接材料佔比', value: d.materialRatio, unit: '%' },
      { label: '直接人工佔比', value: d.laborRatio, unit: '%' },
      { label: '製造費用佔比', value: d.overheadRatio, unit: '%' },
    ],
    tables: [
      {
        name: 'BOM 成本分解',
        headers: ['成本項目', '金額 (NTD)', '佔比', '類別'],
        rows: d.bomItems.map(b => ({
          成本項目: b.name,
          '金額 (NTD)': b.totalCost.toLocaleString(),
          佔比: `${b.percentage}%`,
          類別: b.category,
        })),
      },
    ],
  };
}

/** 從 supplier 資料建立 ReportSection */
function buildSupplierSection(d: AllModuleData['supplier']): ReportSection {
  return {
    title: '供應商評估報告',
    kpis: [
      { label: '供應商總數', value: d.totalCount, unit: '家' },
      { label: '平均綜合評分', value: d.avgScore, unit: '分' },
      { label: '優秀供應商（≥95）', value: d.excellentCount, unit: '家' },
      { label: '待改進（<85）', value: d.improvementCount, unit: '家' },
    ],
    tables: [
      {
        name: '供應商評分明細',
        headers: ['編號', '名稱', '國家', '類別', '交期 %', '品質 %', '價格 %', '服務 %', '合作年數', '年採購額 (M)'],
        rows: d.suppliers.map(s => ({
          編號: s.code,
          名稱: s.name,
          國家: s.country,
          類別: s.category,
          '交期 %': s.otd,
          '品質 %': s.quality,
          '價格 %': s.price,
          '服務 %': s.service,
          合作年數: s.years,
          '年採購額 (M)': s.volume,
        })),
      },
    ],
  };
}

/** 從 procurement 資料建立 ReportSection */
function buildProcurementSection(d: AllModuleData['procurement']): ReportSection {
  return {
    title: '採購分析報告',
    kpis: [
      { label: '總採購金額', value: d.totalAmount.toLocaleString(), unit: 'NTD' },
      { label: '預算執行率', value: d.budgetRate, unit: '%' },
      { label: '活躍供應商', value: d.activeSuppliers, unit: '家' },
      { label: '待執行訂單', value: d.pendingPO, unit: '筆' },
    ],
    tables: [
      {
        name: '採購類別分佈',
        headers: ['類別', '金額 (NTD)', '佔比'],
        rows: d.categories.map(c => ({
          類別: c.name,
          '金額 (NTD)': c.amount.toLocaleString(),
          佔比: `${((c.amount / d.totalAmount) * 100).toFixed(1)}%`,
        })),
      },
      {
        name: '延遲訂單 Top 5',
        headers: ['供應商', '品項', '原交期', '延遲天數', '影響'],
        rows: d.delayedOrders.slice(0, 5).map(o => ({
          供應商: o.supplier,
          品項: o.item,
          原交期: o.promiseDate,
          延遲天數: o.delay,
          影響: o.impact ? '高' : '低',
        })),
      },
    ],
  };
}

// ── 對外匯出 ─────────────────────────────────────────

// ai 報告無 Context 對應，單獨处理
type ContextualReportId = Exclude<ReportId, 'ai'>;

const sectionBuilders: Record<ContextualReportId, (d: AllModuleData[ContextualReportId]) => ReportSection> = {
  overview: buildOverviewSection as any,
  inventory: buildInventorySection as any,
  production: buildProductionSection as any,
  cost: buildCostSection as any,
  supplier: buildSupplierSection as any,
};

/** 取得指定報告模組的資料（需傳入 Context 中的 AllModuleData） */
export function getReportData(ids: ReportId[], allData: AllModuleData): ReportSection[] {
  return ids
    .filter(id => id !== 'ai')
    .map(id => {
      const builder = sectionBuilders[id as ContextualReportId];
      if (!builder) return null;
      try {
        return builder(allData[id as ContextualReportId] as any);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ReportSection[];
}

/** 取得所有可用報告 ID */
export function getAllReportIds(): ReportId[] {
  return (Object.keys(sectionBuilders)) as ReportId[];
}

/** 取得 AI 報告（僅靜態資料，無 Context 對應） */
export function getAiReport(): ReportSection {
  return {
    title: 'AI 預測報告',
    kpis: [
      { label: '需求預測準確率', value: 92.1, unit: '%' },
      { label: '異常偵測數', value: 14, unit: '件' },
      { label: '優化建議數', value: 8, unit: '項' },
      { label: '預估節省成本', value: '2.3M', unit: 'NTD' },
    ],
    tables: [
      {
        name: 'AI 優化建議',
        headers: ['優先順序', '類別', '建議內容', '預估效益', '狀態'],
        rows: [
          { 優先順序: 1, 類別: '庫存', 建議內容: '降低包裝材安全庫存水位 15%', 預估效益: '節省 180K/年', 狀態: '待執行' },
          { 優先順序: 2, 類別: '生產', 建議內容: 'CNC #2 排程調整為夜班優先', 預估效益: '提升 OEE 5%', 狀態: '評估中' },
          { 優先順序: 3, 類別: '採購', 建議內容: '供應商 E 改為備援供應商', 預估效益: '降低風險', 狀態: '待決策' },
          { 優先順序: 4, 類別: '品質', 建議內容: 'SMT 線增加 AOI 檢測站', 預估效益: '良率提升 1.5%', 狀態: '規劃中' },
          { 優先順序: 5, 類別: '成本', 建議內容: '電子元件合併採購批量 +20%', 預估效益: '節省 350K/年', 狀態: '待執行' },
        ],
      },
    ],
  };
}
