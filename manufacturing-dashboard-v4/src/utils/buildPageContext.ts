/**
 * buildPageContext.ts
 * 將各模組數據格式化為 AI 可讀的結構化摘要，注入 System Prompt。
 */
import type {
  AllModuleData, ModuleId,
  OverviewData, InventoryData, ProcurementData,
  SupplierData, CostData, ProductionData,
} from '../data/defaultData';

/** 路由路徑 → 模組 ID */
export function pathToModuleId(pathname: string): ModuleId | null {
  const seg = pathname.split('/')[1] ?? '';
  const map: Record<string, ModuleId> = {
    overview:    'overview',
    health:      'overview',
    alert:       'overview',
    inventory:   'inventory',
    procurement: 'procurement',
    supplier:    'supplier',
    production:  'production',
    cost:        'cost',
  };
  return map[seg] ?? null;
}

/** 入口：根據模組 ID 組裝頁面數據摘要 */
export function buildPageContext(data: AllModuleData, moduleId: ModuleId): string {
  switch (moduleId) {
    case 'overview':    return buildOverview(data.overview);
    case 'inventory':   return buildInventory(data.inventory);
    case 'procurement': return buildProcurement(data.procurement);
    case 'supplier':    return buildSupplier(data.supplier);
    case 'production':  return buildProduction(data.production);
    case 'cost':        return buildCost(data.cost);
    default:            return '';
  }
}

// ── 各模組 Builder ─────────────────────────────────────────────────────────

function buildOverview(d: OverviewData): string {
  const kpiLines = d.kpis.map(k =>
    `  - ${k.label}：${k.value}${k.unit}（${k.trend >= 0 ? '+' : ''}${k.trend}% ${k.trendLabel}）`
  ).join('\n');

  const alertLines = d.alerts.map(a =>
    `  - [${a.level}] ${a.title}：${a.description}（${a.time}，地點：${a.location}）`
  ).join('\n');

  const trendLines = d.trendData.map(t => `${t.name}:${t.value}`).join('、');

  return `### 工廠總覽數據

**關鍵績效指標（KPI）**
${kpiLines}

**當前異常預警（共 ${d.alerts.length} 筆）**
${alertLines}

**OEE 月趨勢**：${trendLines}`;
}

function buildInventory(d: InventoryData): string {
  const catLines = d.categories.map(c =>
    `  - ${c.name}：$${(c.value / 10000).toFixed(1)}萬`
  ).join('\n');

  const whLines = d.warehouses.map(w => {
    const pct = ((w.used / w.capacity) * 100).toFixed(0);
    return `  - ${w.name}：容量 ${w.capacity}，使用 ${w.used}（${pct}%），周轉率 ${w.turnover}，狀態 ${w.status}`;
  }).join('\n');

  return `### 庫存分析數據

**總覽指標**
  - 庫存總值：$${(d.totalValue / 10000).toFixed(0)}萬
  - 庫存周轉率：${d.turnoverRate} 次/月
  - 平均庫存天數：${d.avgDays} 天
  - 倉儲利用率：${d.utilization}%

**庫存分類（金額）**
${catLines}

**倉庫狀態**
${whLines}`;
}

function buildProcurement(d: ProcurementData): string {
  const catLines = d.categories.map(c => {
    const rate = ((c.amount / c.budget) * 100).toFixed(1);
    return `  - ${c.name}：實際 $${(c.amount / 10000).toFixed(0)}萬 / 預算 $${(c.budget / 10000).toFixed(0)}萬（${rate}%），供應商 ${c.suppliers} 家，最大供應商：${c.topSupplier}`;
  }).join('\n');

  const delayLines = d.delayedOrders.length > 0
    ? d.delayedOrders.map(o =>
        `  - ${o.po} | ${o.supplier} | ${o.item}：延遲 ${o.delay} 天（原因：${o.reason}，影響生產：${o.impact ? '是' : '否'}）`
      ).join('\n')
    : '  - 無延遲訂單';

  return `### 採購分析數據

**總覽指標**
  - 採購總金額：$${(d.totalAmount / 10000).toFixed(0)}萬
  - 預算達成率：${d.budgetRate}%
  - 活躍供應商：${d.activeSuppliers} 家
  - 待交 PO：${d.pendingPO} 筆
  - OTD 達成率：${d.otdRate}%
  - 平均前置時間：${d.avgLeadTime} 天

**採購類別明細**
${catLines}

**延遲訂單（${d.delayedOrders.length} 筆）**
${delayLines}`;
}

function buildSupplier(d: SupplierData): string {
  const lines = d.suppliers.map(s => {
    const total = ((s.otd + s.quality + s.price + s.service) / 4).toFixed(1);
    return `  - ${s.code} ${s.name}（${s.country}，${s.category}）：OTD ${s.otd}、品質 ${s.quality}、價格 ${s.price}、服務 ${s.service} → 綜合 ${total}，合作 ${s.years} 年，採購額 $${s.volume}M`;
  }).join('\n');

  return `### 供應商管理數據

**總覽指標**
  - 供應商總數：${d.totalCount} 家
  - 平均評分：${d.avgScore} 分
  - 優秀供應商：${d.excellentCount} 家
  - 需改善供應商：${d.improvementCount} 家

**供應商評分明細**
${lines}`;
}

function buildProduction(d: ProductionData): string {
  const oeeLines = d.oeeData.map(e =>
    `  - ${e.equipmentName}：稼動率 ${e.availability}%、性能 ${e.performance}%、品質 ${e.quality}% → OEE ${e.oee}%（${e.status}）`
  ).join('\n');

  const yieldLines = d.yieldData.map(y => {
    const gap = (y.actualYield - y.targetYield).toFixed(1);
    return `  - ${y.productName}：目標 ${y.targetYield}%、實際 ${y.actualYield}%（差異 ${Number(gap) >= 0 ? '+' : ''}${gap}%），產出 ${y.output.toLocaleString()} 件，不良率 ${y.defectRate}%`;
  }).join('\n');

  return `### 生產與品質數據

**總覽指標**
  - 整體 OEE：${d.overallOEE}%
  - 平均良率：${d.avgYield}%
  - 總產出：${d.totalOutput.toLocaleString()} 件
  - 不良率：${d.defectRate}%

**設備 OEE 明細**
${oeeLines}

**良率分析**
${yieldLines}`;
}

function buildCost(d: CostData): string {
  const bomLines = d.bomItems.map(b =>
    `  - [${b.level}] ${b.code} ${b.name}（${b.qty}）：單價 $${b.unitCost}，合計 $${b.totalCost}，佔比 ${b.percentage}%，類別：${b.category}`
  ).join('\n');

  const varLines = d.variances.map(v => {
    const sign = v.amount >= 0 ? '+' : '';
    return `  - ${v.type}：${sign}$${v.amount}（${v.reason}），責任部門：${v.dept}，行動：${v.action}`;
  }).join('\n');

  return `### 成本分析數據

**成本結構**
  - 標準成本：$${d.standardCost.toLocaleString()}
  - 直接材料：${d.materialRatio}%
  - 直接人工：${d.laborRatio}%
  - 製造費用：${d.overheadRatio}%

**BOM 成本明細**
${bomLines}

**成本差異分析**
${varLines}`;
}
