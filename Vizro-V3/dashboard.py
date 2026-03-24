"""
製造產業分析儀表板 Vizro V3
=============================
基於 Vizro 框架的製造業分析儀表板，支援多種圖表類型和互動功能。

使用方式:
    python dashboard.py
    # 然後在瀏覽器打開 http://127.0.0.1:8050
"""

import json
import pandas as pd
from pathlib import Path
from vizro import Vizro
import vizro.models as vm
import vizro.plotly.express as px
from vizro.tables import dash_data_table

# ============================================================================
# 數據載入
# ============================================================================

def load_data():
    """從 JSON 檔案載入製造業數據"""
    data_path = Path(__file__).parent / "manufacturing_data_v3.json"

    if data_path.exists():
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return {}

# 載入數據
DATA = load_data()

# 轉換為 DataFrame
df_materials = pd.DataFrame(DATA.get("materials", []))
df_suppliers = pd.DataFrame(DATA.get("suppliers", []))
df_products = pd.DataFrame(DATA.get("products", []))
df_purchase_orders = pd.DataFrame(DATA.get("purchaseOrders", []))
df_production = pd.DataFrame(DATA.get("productionOrders", []))
df_inventory = pd.DataFrame(DATA.get("inventorySnapshots", []))
df_iron_triangle = pd.DataFrame(DATA.get("ironTriangle", []))
df_risk_matrix = pd.DataFrame(DATA.get("riskMatrix", []))
df_value_stream = pd.DataFrame(DATA.get("valueStream", []))

# 計算 KPI
total_materials = len(df_materials)
total_suppliers = len(df_suppliers)
avg_yield = df_production['yieldRate'].mean() * 100 if len(df_production) > 0 else 0
total_inventory_value = df_inventory['value'].sum() if 'value' in df_inventory.columns else 0

# ============================================================================
# 儀表板配置
# ============================================================================

# 首頁 - 總覽
page_overview = vm.Page(
    id="overview",
    title="總覽",
    path="/",
    components=[
        # KPI 文字卡片
        vm.Text(
            id="kpi-materials",
            text=f"## 材料數量\n\n### {total_materials}\n\n項材料",
        ),
        vm.Text(
            id="kpi-suppliers",
            text=f"## 供應商數\n\n### {total_suppliers}\n\n家合格供應商",
        ),
        vm.Text(
            id="kpi-yield",
            text=f"## 平均良率\n\n### {avg_yield:.1f}%\n\n生產良率",
        ),
        vm.Text(
            id="kpi-inventory",
            text=f"## 庫存價值\n\n### ${total_inventory_value:,.0f}\n\n總庫存價值",
        ),

        # 圖表
        vm.Graph(
            id="chart-materials-stock",
            figure=px.bar(
                df_materials.head(10),
                x="name",
                y="stockQty",
                title="材料庫存 (Top 10)",
                color="abcClass",
            ) if len(df_materials) > 0 else None,
        ),
        vm.Graph(
            id="chart-supplier-rating",
            figure=px.bar(
                df_suppliers.head(10),
                x="name",
                y="compositeScore",
                title="供應商評分",
                color="qualityScore",
            ) if len(df_suppliers) > 0 else None,
        ),
        vm.Graph(
            id="chart-inventory-value",
            figure=px.bar(
                df_inventory,
                x="materialId",
                y="value",
                title="庫存價值分布",
                color="type",
            ) if len(df_inventory) > 0 else None,
        ),
    ],
)

# 庫存分析頁面
page_inventory = vm.Page(
    id="inventory",
    title="庫存分析",
    path="/inventory",
    components=[
        vm.Graph(
            id="chart-stock-levels",
            figure=px.bar(
                df_materials,
                x="name",
                y="stockQty",
                title="材料庫存水準",
                color="abcClass",
            ) if len(df_materials) > 0 else None,
        ),
        vm.Graph(
            id="chart-days-stock",
            figure=px.bar(
                df_materials,
                x="name",
                y="daysInStock",
                title="庫存天數",
                color="daysInStock",
            ) if len(df_materials) > 0 else None,
        ),
        vm.Graph(
            id="chart-cost-stock",
            figure=px.scatter(
                df_materials,
                x="stockQty",
                y="unitCost",
                size="monthlyUsage",
                color="category",
                title="庫存成本分析",
            ) if len(df_materials) > 0 else None,
        ),
    ],
)

# 供應商分析頁面
page_suppliers = vm.Page(
    id="suppliers",
    title="供應商分析",
    path="/suppliers",
    components=[
        vm.Graph(
            id="chart-supplier-ontime",
            figure=px.bar(
                df_suppliers,
                x="name",
                y="onTimeDeliveryRate",
                title="交貨準時率",
                color="onTimeDeliveryRate",
            ) if len(df_suppliers) > 0 else None,
        ),
        vm.Graph(
            id="chart-supplier-quality",
            figure=px.bar(
                df_suppliers,
                x="name",
                y="qualityScore",
                title="品質分數",
                color="qualityScore",
            ) if len(df_suppliers) > 0 else None,
        ),
        vm.Graph(
            id="chart-supplier-service",
            figure=px.bar(
                df_suppliers,
                x="name",
                y="serviceScore",
                title="服務分數",
                color="serviceScore",
            ) if len(df_suppliers) > 0 else None,
        ),
    ],
)

# 採購分析頁面
page_procurement = vm.Page(
    id="procurement",
    title="採購分析",
    path="/procurement",
    components=[
        vm.Graph(
            id="chart-purchase-by-supplier",
            figure=px.bar(
                df_purchase_orders,
                x="supplierName",
                y="qty",
                title="供應商採購量",
            ) if len(df_purchase_orders) > 0 else None,
        ),
        vm.Graph(
            id="chart-purchase-by-material",
            figure=px.bar(
                df_purchase_orders,
                x="materialName",
                y="qty",
                title="材料採購量",
            ) if len(df_purchase_orders) > 0 else None,
        ),
        vm.Table(
            id="table-purchase",
            title="採購訂單",
            figure=dash_data_table(data_frame=df_purchase_orders.head(20)) if len(df_purchase_orders) > 0 else None,
        ),
    ],
)

# 生產分析頁面
page_production = vm.Page(
    id="production",
    title="生產分析",
    path="/production",
    components=[
        vm.Graph(
            id="chart-yield",
            figure=px.bar(
                df_production,
                x="productName",
                y="yieldRate",
                title="良率",
                color="yieldRate",
            ) if len(df_production) > 0 else None,
        ),
        vm.Graph(
            id="chart-defect",
            figure=px.bar(
                df_production,
                x="productName",
                y="defectQty",
                title="不良數量",
                color="defectQty",
            ) if len(df_production) > 0 else None,
        ),
        vm.Graph(
            id="chart-production-output",
            figure=px.scatter(
                df_production,
                x="inputQty",
                y="goodOutput",
                size="yieldRate",
                color="productName",
                title="產量與良率關係",
            ) if len(df_production) > 0 else None,
        ),
    ],
)

# 鐵三角分析頁面
page_iron_triangle = vm.Page(
    id="iron-triangle",
    title="營運鐵三角",
    path="/iron-triangle",
    components=[
        vm.Graph(
            id="chart-iron-triangle",
            figure=px.line(
                df_iron_triangle,
                x="month",
                y=["inventoryScore", "supplierScore", "costScore"],
                title="營運鐵三角趨勢",
            ) if len(df_iron_triangle) > 0 else None,
        ),
    ],
)

# 價值流頁面
page_value_stream = vm.Page(
    id="value-stream",
    title="價值流分析",
    path="/value-stream",
    components=[
        vm.Graph(
            id="chart-value-stream",
            figure=px.bar(
                df_value_stream,
                x="name",
                y="valueAddRatio",
                title="價值添加比率",
                color="valueAddRatio",
            ) if len(df_value_stream) > 0 else None,
        ),
        vm.Graph(
            id="chart-cycle-time",
            figure=px.bar(
                df_value_stream,
                x="name",
                y="cycleTime",
                title="週期時間",
                color="cycleTime",
            ) if len(df_value_stream) > 0 else None,
        ),
    ],
)

# 風險矩陣頁面
page_risk = vm.Page(
    id="risk",
    title="風險矩陣",
    path="/risk",
    components=[
        vm.Graph(
            id="chart-risk-matrix",
            figure=px.scatter(
                df_risk_matrix,
                x="probability",
                y="impact",
                color="category",
                title="風險矩陣",
            ) if len(df_risk_matrix) > 0 else None,
        ),
    ],
)

# ============================================================================
# 儀表板組裝
# ============================================================================

# 收集所有頁面
pages = [
    page_overview,
    page_inventory,
    page_suppliers,
    page_procurement,
    page_production,
]

# 添加額外的頁面（如果數據存在）
if len(df_iron_triangle) > 0:
    pages.append(page_iron_triangle)
if len(df_value_stream) > 0:
    pages.append(page_value_stream)
if len(df_risk_matrix) > 0:
    pages.append(page_risk)

dashboard = vm.Dashboard(
    pages=pages,
)

# ============================================================================
# 啟動應用
# ============================================================================

if __name__ == "__main__":
    # 重置 Vizro 實例
    Vizro._reset()

    # 初始化並運行
    Vizro().build(dashboard).run(port=8050)
