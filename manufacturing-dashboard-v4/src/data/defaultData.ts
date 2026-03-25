/**
 * defaultData.ts — 7 大模組預設範例資料
 *
 * 從各頁面元件提取硬編碼資料，作為單一真相來源。
 * 使用者匯入新資料前，各頁面顯示此處的預設值。
 */

// ── 共用類型 ──────────────────────────────────────────

/** 總覽模組 */
export interface OverviewKPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  trendLabel: string;
}

export interface OverviewAlert {
  id: string;
  level: 'P1' | 'P2' | 'P3';
  title: string;
  description: string;
  time: string;
  location: string;
}

export interface OverviewTrend {
  name: string;
  value: number;
}

export interface OverviewData {
  kpis: OverviewKPI[];
  alerts: OverviewAlert[];
  trendData: OverviewTrend[];
}

/** 庫存模組 */
export interface InventoryCategory {
  name: string;
  value: number;
}

export interface InventoryWarehouse {
  name: string;
  capacity: number;
  used: number;
  turnover: number;
  status: string;
}

export interface InventoryData {
  categories: InventoryCategory[];
  warehouses: InventoryWarehouse[];
  totalValue: number;
  turnoverRate: number;
  avgDays: number;
  utilization: number;
}

/** 採購模組 */
export interface ProcurementOrder {
  po: string;
  supplier: string;
  item: string;
  promiseDate: string;
  eta: string;
  delay: number;
  reason: string;
  impact: boolean;
}

export interface ProcurementCategory {
  name: string;
  amount: number;
  budget: number;
  suppliers: number;
  topSupplier: string;
}

export interface ProcurementData {
  categories: ProcurementCategory[];
  delayedOrders: ProcurementOrder[];
  totalAmount: number;
  budgetRate: number;
  activeSuppliers: number;
  pendingPO: number;
  otdRate: number;
  avgLeadTime: number;
}

/** 供應商模組 */
export interface SupplierScore {
  code: string;
  name: string;
  country: string;
  category: string;
  otd: number;
  quality: number;
  price: number;
  service: number;
  years: number;
  volume: number;
}

export interface SupplierData {
  suppliers: SupplierScore[];
  totalCount: number;
  avgScore: number;
  excellentCount: number;
  improvementCount: number;
}

/** 成本模組 */
export interface CostBomItem {
  level: string;
  code: string;
  name: string;
  qty: string;
  unitCost: number;
  totalCost: number;
  percentage: number;
  category: string;
}

export interface CostVariance {
  type: string;
  amount: number;
  reason: string;
  dept: string;
  action: string;
}

export interface CostData {
  bomItems: CostBomItem[];
  variances: CostVariance[];
  standardCost: number;
  materialRatio: number;
  laborRatio: number;
  overheadRatio: number;
}

/** 生產模組 */
export interface ProductionOEE {
  id: string;
  equipmentName: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface ProductionYield {
  id: string;
  productName: string;
  targetYield: number;
  actualYield: number;
  output: number;
  defectRate: number;
}

export interface ProductionData {
  oeeData: ProductionOEE[];
  yieldData: ProductionYield[];
  overallOEE: number;
  avgYield: number;
  totalOutput: number;
  defectRate: number;
}

/** 全模組資料 */
export interface AllModuleData {
  overview: OverviewData;
  inventory: InventoryData;
  procurement: ProcurementData;
  supplier: SupplierData;
  cost: CostData;
  production: ProductionData;
}

export type ModuleId = keyof AllModuleData;

// ── 預設資料 ──────────────────────────────────────────

export const defaultData: AllModuleData = {
  // ---- 總覽 ----
  overview: {
    kpis: [
      { id: 'oee', label: 'OEE', value: 87.3, unit: '%', trend: 2.5, trendLabel: '較上月' },
      { id: 'quality', label: '品質達成率', value: 96.2, unit: '%', trend: 0.8, trendLabel: '較上月' },
      { id: 'otd', label: 'OTD 達成率', value: 78.5, unit: '%', trend: -3.2, trendLabel: '較上月' },
      { id: 'inventory', label: '庫存週轉率', value: 8.4, unit: '次', trend: 1.1, trendLabel: '較上月' },
    ],
    alerts: [
      { id: '1', level: 'P1', title: '供應商交期延誤', description: '供應商 A-1234 原料短缺', time: '10分鐘前', location: '原料倉庫' },
      { id: '2', level: 'P2', title: '良率異常下降', description: 'SMT 線良率降至 94.2%', time: '35分鐘前', location: 'SMT-01' },
      { id: '3', level: 'P2', title: '設備維護提醒', description: '沖壓機 P-203 需要保養', time: '1小時前', location: '沖壓車間' },
      { id: '4', level: 'P3', title: '庫存水位警告', description: '物料 M-5678 低於安全庫存', time: '2小時前', location: '半成品倉' },
      { id: '5', level: 'P3', title: '訂單逾期風險', description: '訂單 PO-2024-0892 可能延誤', time: '3小時前', location: '生管課' },
    ],
    trendData: [
      { name: '一月', value: 82 },
      { name: '二月', value: 85 },
      { name: '三月', value: 84 },
      { name: '四月', value: 88 },
      { name: '五月', value: 86 },
      { name: '六月', value: 89 },
      { name: '七月', value: 87 },
    ],
  },

  // ---- 庫存 ----
  inventory: {
    categories: [
      { name: '原料', value: 4200000 },
      { name: '半成品', value: 3100000 },
      { name: '成品', value: 2800000 },
      { name: '包裝材', value: 1200000 },
      { name: '間接物料', value: 1268000 },
    ],
    warehouses: [
      { name: '原料倉 A', capacity: 1000, used: 820, turnover: 9.2, status: 'good' },
      { name: '原料倉 B', capacity: 800, used: 540, turnover: 7.8, status: 'good' },
      { name: '半成品區', capacity: 600, used: 510, turnover: 8.5, status: 'warning' },
      { name: '成品倉', capacity: 1200, used: 780, turnover: 12.1, status: 'good' },
      { name: '包裝材倉', capacity: 400, used: 180, turnover: 5.3, status: 'good' },
    ],
    totalValue: 12568000,
    turnoverRate: 8.4,
    avgDays: 43,
    utilization: 78,
  },

  // ---- 採購 ----
  procurement: {
    categories: [
      { name: '電子原料', amount: 18500000, budget: 20000000, suppliers: 42, topSupplier: '供應商 A' },
      { name: '包裝材料', amount: 9200000, budget: 9000000, suppliers: 28, topSupplier: '供應商 B' },
      { name: '生產設備', amount: 6800000, budget: 8000000, suppliers: 15, topSupplier: '供應商 F' },
      { name: '間接物料', amount: 5800000, budget: 6000000, suppliers: 38, topSupplier: '供應商 G' },
      { name: '物流服務', amount: 5380000, budget: 5500000, suppliers: 33, topSupplier: '供應商 E' },
    ],
    delayedOrders: [
      { po: 'PO-2025-0312', supplier: '供應商 C', item: 'PCB 空板 V3', promiseDate: '2025-03-18', eta: '2025-03-22', delay: 4, reason: '原料短缺', impact: true },
      { po: 'PO-2025-0298', supplier: '供應商 D', item: '散熱模組 H2', promiseDate: '2025-03-15', eta: '2025-03-20', delay: 5, reason: '運輸延誤', impact: true },
      { po: 'PO-2025-0287', supplier: '供應商 G', item: '標準包裝盒', promiseDate: '2025-03-10', eta: '2025-03-13', delay: 3, reason: '產能不足', impact: false },
      { po: 'PO-2025-0275', supplier: '供應商 B', item: '導電膠帶 5mm', promiseDate: '2025-03-08', eta: '2025-03-10', delay: 2, reason: '品檢重工', impact: false },
    ],
    totalAmount: 45700000,
    budgetRate: 96.2,
    activeSuppliers: 156,
    pendingPO: 28,
    otdRate: 94.2,
    avgLeadTime: 12,
  },

  // ---- 供應商 ----
  supplier: {
    suppliers: [
      { code: 'S-001', name: '供應商 A', country: '台灣', category: '電子原料', otd: 98.5, quality: 99.2, price: 97.8, service: 96.5, years: 8, volume: 28 },
      { code: 'S-002', name: '供應商 B', country: '日本', category: '包裝材料', otd: 96.2, quality: 98.5, price: 99.1, service: 97.2, years: 12, volume: 18.5 },
      { code: 'S-003', name: '供應商 C', country: '中國', category: '生產設備', otd: 88.2, quality: 97.2, price: 98.5, service: 93.1, years: 5, volume: 22 },
      { code: 'S-004', name: '供應商 D', country: '韓國', category: '間接物料', otd: 93.5, quality: 96.8, price: 97.2, service: 95.8, years: 6, volume: 12 },
      { code: 'S-005', name: '供應商 E', country: '中國', category: '電子原料', otd: 85.1, quality: 91.2, price: 96.5, service: 88.5, years: 3, volume: 15 },
      { code: 'S-006', name: '供應商 F', country: '美國', category: '物流服務', otd: 97.8, quality: 98.1, price: 95.2, service: 98.8, years: 7, volume: 8.5 },
    ],
    totalCount: 156,
    avgScore: 92.4,
    excellentCount: 45,
    improvementCount: 12,
  },

  // ---- 成本 ----
  cost: {
    bomItems: [
      { level: 'L1', code: 'M-0021', name: '電阻 470Ω', qty: '8 pcs', unitCost: 0.72, totalCost: 5.76, percentage: 0.05, category: '直接材料' },
      { level: 'L1', code: 'M-PCB-01', name: 'PCB 主板 V3', qty: '1 片', unitCost: 1800, totalCost: 1800, percentage: 16.4, category: '直接材料' },
      { level: 'L1', code: 'M-IC-08', name: '主控 IC', qty: '1 顆', unitCost: 3200, totalCost: 3200, percentage: 29.1, category: '直接材料' },
      { level: 'L1', code: 'M-MOSFET', name: 'MOSFET 模組', qty: '2 顆', unitCost: 450, totalCost: 900, percentage: 8.2, category: '直接材料' },
      { level: 'L2', code: 'LH-001', name: '生產作業工時', qty: '0.5 hr', unitCost: 2400, totalCost: 1200, percentage: 10.9, category: '直接人工' },
      { level: 'L2', code: 'LH-002', name: '品質檢驗工時', qty: '0.125 hr', unitCost: 2400, totalCost: 300, percentage: 2.7, category: '直接人工' },
      { level: 'L3', code: 'OH-001', name: '設備折舊攤提', qty: '1 件', unitCost: 800, totalCost: 800, percentage: 7.3, category: '製造費用' },
      { level: 'L3', code: 'OH-002', name: '廠房租金攤提', qty: '1 件', unitCost: 400, totalCost: 400, percentage: 3.6, category: '製造費用' },
    ],
    variances: [
      { type: '材料用量差異', amount: -320, reason: '製程報廢率 2.8%（標準 2.0%）', dept: '生產', action: '改善生產製程，降低報廢' },
      { type: '材料價格差異', amount: 180, reason: '電子元件漲價 2.1%', dept: '採購', action: '尋找替代供應商' },
      { type: '人工效率差異', amount: -150, reason: '換線時間增加、設備故障', dept: '生產', action: '導入 SMED 快速換線' },
      { type: '製費分攤差異', amount: 80, reason: '產能利用率提升（88% vs 85%）', dept: '工程', action: '維持現有產能水準' },
      { type: '良率損失', amount: 210, reason: 'IQC 不良品轉換損耗', dept: '品管', action: '加強進料管制標準' },
    ],
    standardCost: 11000,
    materialRatio: 76.4,
    laborRatio: 13.6,
    overheadRatio: 10.0,
  },

  // ---- 生產 ----
  production: {
    oeeData: [
      { id: '1', equipmentName: '射出成型機 #1', availability: 92.5, performance: 95.2, quality: 98.1, oee: 86.4, status: 'good' },
      { id: '2', equipmentName: '射出成型機 #2', availability: 88.3, performance: 91.5, quality: 97.8, oee: 79.0, status: 'warning' },
      { id: '3', equipmentName: 'CNC 加工中心 #1', availability: 95.1, performance: 94.3, quality: 99.2, oee: 88.9, status: 'excellent' },
      { id: '4', equipmentName: 'CNC 加工中心 #2', availability: 78.2, performance: 89.1, quality: 96.5, oee: 67.3, status: 'critical' },
      { id: '5', equipmentName: '包裝線 #1', availability: 94.8, performance: 97.2, quality: 99.5, oee: 91.6, status: 'excellent' },
      { id: '6', equipmentName: '自動組裝線 #1', availability: 91.5, performance: 93.8, quality: 98.7, oee: 84.6, status: 'good' },
    ],
    yieldData: [
      { id: '1', productName: '產品 A - 外殼件', targetYield: 98, actualYield: 97.8, output: 45000, defectRate: 2.2 },
      { id: '2', productName: '產品 B - 機構件', targetYield: 97, actualYield: 96.5, output: 32000, defectRate: 3.5 },
      { id: '3', productName: '產品 C - 電子件', targetYield: 99, actualYield: 99.2, output: 28000, defectRate: 0.8 },
      { id: '4', productName: '產品 D - 包裝材', targetYield: 99.5, actualYield: 99.1, output: 85000, defectRate: 0.9 },
      { id: '5', productName: '產品 E - 組裝件', targetYield: 96, actualYield: 94.8, output: 18000, defectRate: 5.2 },
    ],
    overallOEE: 87.3,
    avgYield: 96.2,
    totalOutput: 1256800,
    defectRate: 1.8,
  },
};

/** 模組中文名稱對應 */
export const moduleLabels: Record<ModuleId, string> = {
  overview: '工廠總覽',
  inventory: '庫存分析',
  procurement: '採購分析',
  supplier: '供應商分析',
  cost: '成本分析',
  production: '生產與品質',
};

/** 模組圖示對應 */
export const moduleIcons: Record<ModuleId, string> = {
  overview: '🏭',
  inventory: '📦',
  procurement: '🛒',
  supplier: '🚚',
  cost: '💰',
  production: '⚙️',
};
