#!/usr/bin/env python3
"""
Build script for Manufacturing Dashboard V3.
Reads V2 as base, injects 8 new tabs, sidebar entries, CSS, data generators, and render functions.
"""

# Read V2 file
with open('/home/user/workspace/Manufacturing_Dashboard_V2.html', 'r', encoding='utf-8') as f:
    v2 = f.read()

# ============================================================
# 1. TITLE & VERSION
# ============================================================
v3 = v2.replace(
    '<title>製造業分析儀表板 V2 | Manufacturing Analytics</title>',
    '<title>製造業分析儀表板 V3 | Manufacturing Analytics</title>'
)
v3 = v3.replace(
    '<p>製造業分析儀表板 V2.0</p>',
    '<p>製造業分析儀表板 V3.0</p>'
)

# ============================================================
# 2. ADDITIONAL CSS (before </style>)
# ============================================================
new_css = """
        /* ===== V3 New Tab Styles ===== */
        /* Iron Triangle */
        .iron-triangle-container { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; margin-bottom: 24px; }
        .iron-triangle-svg { width: 400px; height: 380px; flex-shrink: 0; }
        .iron-triangle-svg text { font-family: 'Inter', sans-serif; }
        .vertex-score { cursor: pointer; transition: transform 0.3s; }
        .vertex-score:hover { filter: brightness(1.2); }
        .triangle-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        @media (max-width: 1200px) { .triangle-kpis { grid-template-columns: 1fr; } }

        /* Gauge Widget */
        .gauge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .gauge-widget { padding: 24px; text-align: center; position: relative; }
        .gauge-widget canvas { max-width: 200px; max-height: 200px; margin: 0 auto; }
        .gauge-label { font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; }
        .gauge-value-text { font-size: 1.5rem; font-weight: 700; margin-top: 4px; }
        .gauge-sparkline { display: flex; align-items: end; justify-content: center; gap: 2px; height: 24px; margin-top: 8px; }
        .gauge-sparkline .spark-bar { width: 4px; border-radius: 2px; background: var(--accent); transition: height 0.3s; }
        @media (max-width: 1200px) { .gauge-grid { grid-template-columns: repeat(2, 1fr); } }

        /* Insight Cards */
        .insight-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 24px; }
        .insight-card { padding: 16px; border-left: 3px solid var(--accent); }
        .insight-card .insight-icon { font-size: 1.2rem; margin-bottom: 6px; }
        .insight-card .insight-text { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6; }
        .insight-card .insight-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }

        /* Traffic Light Summary Bar */
        .traffic-summary-bar { display: flex; gap: 12px; margin-bottom: 20px; padding: 12px 16px; border-radius: 12px; align-items: center; }
        .traffic-summary-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; }
        .traffic-dot { width: 12px; height: 12px; border-radius: 50%; }
        .traffic-dot.green { background: var(--success); box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        .traffic-dot.yellow { background: var(--warning); box-shadow: 0 0 8px rgba(245,158,11,0.4); }
        .traffic-dot.red { background: var(--danger); box-shadow: 0 0 8px rgba(239,68,68,0.4); }

        /* Value Stream Map */
        .vsm-container { overflow-x: auto; padding: 20px 0; }
        .vsm-flow { display: flex; align-items: center; gap: 0; min-width: 900px; padding: 0 20px; }
        .vsm-node { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; min-width: 110px; text-align: center; position: relative; transition: all 0.3s; flex-shrink: 0; }
        .vsm-node.bottleneck { border-color: var(--danger); box-shadow: 0 0 16px rgba(239,68,68,0.3); }
        .vsm-node .node-title { font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }
        .vsm-node .node-metric { font-size: 0.7rem; color: var(--text-secondary); line-height: 1.5; }
        .vsm-node .node-metric b { color: var(--text-primary); }
        .vsm-arrow { width: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .vsm-arrow svg { width: 32px; height: 20px; color: var(--text-muted); }
        .vsm-arrow.animated svg { animation: arrowPulse 1.5s ease-in-out infinite; }
        @keyframes arrowPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .vsm-timeline { margin-top: 20px; padding: 16px; border-radius: 12px; }
        .vsm-timeline-bar { height: 8px; border-radius: 4px; background: var(--glass-border); overflow: hidden; display: flex; margin-top: 8px; }
        .vsm-timeline-bar .segment { height: 100%; transition: width 0.5s; }
        .vsm-efficiency { display: flex; gap: 24px; margin-top: 16px; }
        .vsm-efficiency .stat { text-align: center; flex: 1; }
        .vsm-efficiency .stat-value { font-size: 1.5rem; font-weight: 700; }
        .vsm-efficiency .stat-label { font-size: 0.75rem; color: var(--text-secondary); }

        /* What-If Simulator */
        .simulator-controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        .sim-slider-group { padding: 16px; border-radius: 12px; }
        .sim-slider-group label { font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 8px; }
        .sim-slider-group .sim-value { font-size: 1.2rem; font-weight: 700; color: var(--accent); text-align: center; margin-bottom: 4px; }
        .sim-slider-group input[type="range"] { width: 100%; accent-color: var(--accent); cursor: pointer; }
        .sim-summary { padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
        .sim-summary .big-number { font-size: 2rem; font-weight: 700; }
        .sim-summary .sub-text { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
        @media (max-width: 1200px) { .simulator-controls { grid-template-columns: 1fr; } }

        /* Risk Matrix */
        .risk-matrix-container { position: relative; }
        .risk-zone-label { position: absolute; font-size: 0.7rem; color: var(--text-muted); font-weight: 500; pointer-events: none; }

        /* Procurement Quadrant */
        .quadrant-layout { display: grid; grid-template-columns: 3fr 1fr; gap: 20px; margin-bottom: 24px; }
        .quadrant-side { display: flex; flex-direction: column; gap: 12px; }
        .quadrant-stat { padding: 12px; border-radius: 10px; }
        .quadrant-stat .q-label { font-size: 0.75rem; color: var(--text-secondary); }
        .quadrant-stat .q-value { font-size: 1rem; font-weight: 600; margin-top: 2px; }
        .quadrant-stat .q-count { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
        @media (max-width: 1200px) { .quadrant-layout { grid-template-columns: 1fr; } }

        /* Benchmark */
        .benchmark-roadmap { margin-top: 16px; }
        .benchmark-roadmap table { font-size: 0.8rem; }

        /* Waterfall V3 improved */
        .cash-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
"""

v3 = v3.replace('    </style>', new_css + '    </style>')

# ============================================================
# 3. SIDEBAR: Add new group + 8 tabs (before closing </div> of nav-menu)
# ============================================================
new_sidebar_items = """
            <div class="nav-group-title">策略分析 (Strategic)</div>
            <a class="nav-item" data-target="tab-iron-triangle">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z"/></svg>
                <span>15. 核心三角儀表</span>
            </a>
            <a class="nav-item" data-target="tab-cashflow">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.91-1.51 3.14-3.12 3.19z"/></svg>
                <span>16. 資金佔用分析</span>
            </a>
            <a class="nav-item" data-target="tab-risk-matrix">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span>17. 供應鏈風險矩陣</span>
            </a>
            <a class="nav-item" data-target="tab-procurement-quad">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
                <span>18. 採購效率象限</span>
            </a>
            <a class="nav-item" data-target="tab-whatif">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                <span>19. 情境模擬器</span>
            </a>
            <a class="nav-item" data-target="tab-exec-cockpit">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm1-10c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
                <span>20. 管理駕駛艙</span>
            </a>
            <a class="nav-item" data-target="tab-vsm">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"/></svg>
                <span>21. 價值流圖</span>
            </a>
            <a class="nav-item" data-target="tab-benchmark">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                <span>22. 標竿對比</span>
            </a>
"""

# Insert before the closing </div> of nav-menu
v3 = v3.replace(
    """        </div>
    </aside>""",
    new_sidebar_items + """        </div>
    </aside>"""
)

# ============================================================
# 4. TAB PANES: Add 8 new tab panes (before closing dashboard-container div)
# ============================================================
new_tab_panes = """
            <!-- Page 15: Iron Triangle -->
            <div class="tab-pane" id="tab-iron-triangle">
                <div class="iron-triangle-container">
                    <svg class="iron-triangle-svg" id="iron-triangle-svg" viewBox="0 0 400 380"></svg>
                </div>
                <div class="triangle-kpis" id="iron-triangle-kpis"></div>
                <div class="grid-charts">
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">三維得分趨勢 <span class="chart-subtitle">Dimension Scores Trend</span></h3></div><div class="chart-container"><canvas id="chart-triangle-trend"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">三維雷達對比 <span class="chart-subtitle">Radar Comparison</span></h3></div><div class="chart-container"><canvas id="chart-triangle-radar"></canvas></div></div>
                </div>
            </div>

            <!-- Page 16: Cash Flow Impact -->
            <div class="tab-pane" id="tab-cashflow">
                <div class="cash-kpis" id="cashflow-kpis"></div>
                <div class="grid-charts">
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">庫存資金流動瀑布圖 <span class="chart-subtitle">Inventory Cash Flow Waterfall</span></h3></div><div class="chart-container"><canvas id="chart-cash-waterfall"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">資金佔用率 <span class="chart-subtitle">Capital Tied-Up Rate</span></h3></div><div class="chart-container"><canvas id="chart-cash-gauge"></canvas></div></div>
                </div>
                <div class="grid-charts">
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">交期狀況對資金影響 <span class="chart-subtitle">Delivery Status Cash Impact</span></h3></div><div class="chart-container"><canvas id="chart-cash-delivery"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">通用料 vs 專用料 資金佔比 <span class="chart-subtitle">Generic vs Specialized</span></h3></div><div class="chart-container"><canvas id="chart-cash-type"></canvas></div></div>
                </div>
            </div>

            <!-- Page 17: Supply Chain Risk Matrix -->
            <div class="tab-pane" id="tab-risk-matrix">
                <div class="grid-kpi" id="risk-matrix-kpis"></div>
                <div class="grid-charts asym">
                    <div class="glass-panel chart-card" style="min-height:450px"><div class="chart-header"><h3 class="chart-title">風險矩陣氣泡圖 <span class="chart-subtitle">Risk Matrix Bubble Chart</span></h3></div><div class="chart-container"><canvas id="chart-risk-bubble"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">風險趨勢 <span class="chart-subtitle">Risk Trend Sparklines</span></h3></div><div class="chart-container"><canvas id="chart-risk-trends"></canvas></div></div>
                </div>
                <div class="glass-panel chart-card" style="min-height:250px"><div class="chart-header"><h3 class="chart-title">Top 10 高風險項目 <span class="chart-subtitle">High Risk Items</span></h3></div><div class="table-container" id="table-risk-top10"></div></div>
            </div>

            <!-- Page 18: Procurement Quadrant -->
            <div class="tab-pane" id="tab-procurement-quad">
                <div class="grid-kpi" id="procurement-quad-kpis"></div>
                <div class="quadrant-layout">
                    <div class="glass-panel chart-card" style="min-height:450px"><div class="chart-header"><h3 class="chart-title">採購效率散佈圖 <span class="chart-subtitle">Procurement Efficiency Scatter</span></h3></div><div class="chart-container"><canvas id="chart-proc-scatter"></canvas></div></div>
                    <div class="quadrant-side" id="quadrant-stats"></div>
                </div>
                <div class="glass-panel chart-card" style="min-height:250px"><div class="chart-header"><h3 class="chart-title">效率異常項目 (Zone B) <span class="chart-subtitle">Inefficiency Zone Items</span></h3></div><div class="table-container" id="table-proc-anomaly"></div></div>
            </div>

            <!-- Page 19: What-If Simulator -->
            <div class="tab-pane" id="tab-whatif">
                <div class="simulator-controls">
                    <div class="glass-panel sim-slider-group">
                        <label>原料價格變動 Material Price Change</label>
                        <div class="sim-value" id="sim-price-val">0%</div>
                        <input type="range" id="sim-price" min="-30" max="30" value="0" step="1">
                    </div>
                    <div class="glass-panel sim-slider-group">
                        <label>良率變動 Yield Change</label>
                        <div class="sim-value" id="sim-yield-val">0%</div>
                        <input type="range" id="sim-yield" min="-10" max="10" value="0" step="0.5">
                    </div>
                    <div class="glass-panel sim-slider-group">
                        <label>產量變動 Volume Change</label>
                        <div class="sim-value" id="sim-volume-val">0%</div>
                        <input type="range" id="sim-volume" min="-30" max="30" value="0" step="1">
                    </div>
                </div>
                <div class="glass-panel sim-summary" id="sim-summary"></div>
                <div class="grid-charts">
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">單位成本變化 <span class="chart-subtitle">Unit Cost Impact</span></h3></div><div class="chart-container"><canvas id="chart-sim-cost"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">成本結構變化 <span class="chart-subtitle">Cost Structure Shift</span></h3></div><div class="chart-container"><canvas id="chart-sim-structure"></canvas></div></div>
                </div>
                <div class="grid-charts full">
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">利潤影響瀑布 <span class="chart-subtitle">Profit Impact Waterfall</span></h3></div><div class="chart-container"><canvas id="chart-sim-waterfall"></canvas></div></div>
                </div>
            </div>

            <!-- Page 20: Executive Cockpit -->
            <div class="tab-pane" id="tab-exec-cockpit">
                <div class="glass-panel traffic-summary-bar" id="cockpit-traffic"></div>
                <div class="gauge-grid" id="cockpit-gauges"></div>
                <div class="insight-cards" id="cockpit-insights"></div>
            </div>

            <!-- Page 21: Value Stream Map -->
            <div class="tab-pane" id="tab-vsm">
                <div class="grid-kpi" id="vsm-kpis"></div>
                <div class="glass-panel chart-card" style="min-height:auto;padding:24px;">
                    <div class="chart-header"><h3 class="chart-title">價值流程圖 <span class="chart-subtitle">Value Stream Flow</span></h3></div>
                    <div class="vsm-container"><div class="vsm-flow" id="vsm-flow"></div></div>
                </div>
                <div class="glass-panel vsm-timeline" id="vsm-timeline"></div>
                <div class="grid-charts" style="margin-top:24px;">
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">各站點週期時間 <span class="chart-subtitle">Station Cycle Times</span></h3></div><div class="chart-container"><canvas id="chart-vsm-cycle"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">增值 vs 浪費比例 <span class="chart-subtitle">Value-Add vs Waste</span></h3></div><div class="chart-container"><canvas id="chart-vsm-ratio"></canvas></div></div>
                </div>
            </div>

            <!-- Page 22: Benchmark Comparison -->
            <div class="tab-pane" id="tab-benchmark">
                <div class="grid-kpi" id="benchmark-kpis"></div>
                <div class="grid-charts">
                    <div class="glass-panel chart-card" style="min-height:420px"><div class="chart-header"><h3 class="chart-title">標竿雷達對比 <span class="chart-subtitle">Benchmark Radar</span></h3></div><div class="chart-container"><canvas id="chart-bench-radar"></canvas></div></div>
                    <div class="glass-panel chart-card"><div class="chart-header"><h3 class="chart-title">與標竿差距 <span class="chart-subtitle">Gap to Benchmark</span></h3></div><div class="chart-container"><canvas id="chart-bench-gap"></canvas></div></div>
                </div>
                <div class="glass-panel chart-card" style="min-height:250px"><div class="chart-header"><h3 class="chart-title">改善路線圖 <span class="chart-subtitle">Improvement Roadmap</span></h3></div><div class="table-container" id="table-bench-roadmap"></div></div>
            </div>
"""

# Insert before the closing </div> of dashboard-container
v3 = v3.replace(
    """        </div>
    </main>""",
    new_tab_panes + """        </div>
    </main>"""
)

# ============================================================
# 5. JAVASCRIPT: Replace generateSampleDataV2 name, extend data, add render fns
# ============================================================
# First, rename the V2 data generator call but keep it as the base
# The generateSampleDataV2 function stays as is; we wrap it

# Add new JS before the closing </script>
new_js = """

    // ===== V3 Extended Data Generator =====
    const generateSampleDataV3 = () => {
        const base = generateSampleDataV2();

        // Iron Triangle scores (monthly)
        const months12 = [];
        for(let m=0; m<12; m++) months12.push(new Date(2024, m, 1).toISOString().slice(0,7));

        base.ironTriangle = months12.map(m => ({
            month: m,
            inventoryScore: Math.round(70 + Math.random()*20),
            supplierScore: Math.round(75 + Math.random()*20),
            costScore: Math.round(65 + Math.random()*25),
        }));

        // Cash Flow data
        const totalInv = base.materials.reduce((s,m)=>s+m.stockQty*m.unitCost, 0);
        base.cashFlow = {
            lastYearInventory: Math.round(totalInv * 0.85),
            newPurchases: Math.round(totalInv * 0.6),
            productionConsumption: Math.round(totalInv * 0.45),
            staleAccumulation: Math.round(totalInv * 0.08),
            currentInventory: totalInv,
            capitalTiedRate: 0.32,
            cashReleasePotential: Math.round(totalInv * 0.15),
            staleAmount: Math.round(totalInv * 0.08),
            earlyDeliveryCost: Math.round(totalInv * 0.03),
        };

        // Risk Matrix
        base.riskMatrix = [
            { category: '缺料風險', probability: 0.35, impact: 0.85, severity: 'high', trend: [0.3, 0.28, 0.32, 0.35, 0.33, 0.35], items: ['M-IC-01 處理器晶片', 'M-DP-01 顯示面板'] },
            { category: '價格波動', probability: 0.55, impact: 0.6, severity: 'medium', trend: [0.4, 0.45, 0.5, 0.52, 0.55, 0.55], items: ['M-CA-01 MLCC電容', 'M-RE-01 SMD電阻'] },
            { category: '品質退貨', probability: 0.2, impact: 0.7, severity: 'medium', trend: [0.25, 0.22, 0.2, 0.18, 0.2, 0.2], items: ['M-ME-01 鋁合金機殼'] },
            { category: '交期延遲', probability: 0.4, impact: 0.75, severity: 'high', trend: [0.35, 0.38, 0.4, 0.42, 0.4, 0.4], items: ['S004 鴻海金屬機殼', 'S010 華碩精密'] },
            { category: '單一供應商依賴', probability: 0.6, impact: 0.9, severity: 'critical', trend: [0.55, 0.58, 0.6, 0.6, 0.6, 0.6], items: ['M-IC-01 (僅S005)', 'M-PW-01 (僅S007)'] },
        ];

        // Procurement quadrant data (augment PO with cycle days)
        base.purchaseOrders.forEach(po => {
            po.cycleDays = po.actualLeadTime + Math.floor(Math.random()*10);
        });

        // Value Stream Map
        base.valueStream = [
            { name: '原材料採購', cycleTime: 14.0, waitTime: 3.0, valueAddRatio: 0.45, bottleneck: false },
            { name: '入庫檢驗', cycleTime: 1.5, waitTime: 2.0, valueAddRatio: 0.65, bottleneck: false },
            { name: '庫存存放', cycleTime: 0.5, waitTime: 15.0, valueAddRatio: 0.05, bottleneck: true },
            { name: '生產投料', cycleTime: 0.5, waitTime: 1.0, valueAddRatio: 0.70, bottleneck: false },
            { name: '加工製造', cycleTime: 4.0, waitTime: 2.0, valueAddRatio: 0.80, bottleneck: false },
            { name: '品質檢測', cycleTime: 2.0, waitTime: 3.0, valueAddRatio: 0.60, bottleneck: true },
            { name: '成品入庫', cycleTime: 0.5, waitTime: 1.0, valueAddRatio: 0.30, bottleneck: false },
            { name: '出貨', cycleTime: 1.0, waitTime: 0.5, valueAddRatio: 0.50, bottleneck: false },
        ];

        // Benchmark data
        base.benchmark = {
            dimensions: ['庫存週轉', '準交率', '良率', '單位成本', '供應商集中度'],
            company: [72, 88, 96, 78, 65],
            industryAvg: [65, 82, 93, 70, 60],
            industryBest: [90, 97, 99, 92, 85],
        };

        return base;
    };

    // Override the sample data function
    const generateSampleData = generateSampleDataV3;

    // ===== Page 15: 核心三角儀表 =====
    renderMap['tab-iron-triangle'] = () => {
        const d = currentData;
        const pros = filterByDate(d.productionOrders);
        const pos = filterByDate(d.purchaseOrders);

        const staleRatio = d.materials.filter(m=>m.daysInStock>90).length / d.materials.length;
        const avgDelivery = d.suppliers.reduce((s,sup)=>s+sup.onTimeDeliveryRate,0)/d.suppliers.length;
        const totalVar = pros.reduce((s,p)=>s+Math.abs(p.materialVar+p.laborVar+p.overheadVar),0);
        const totalStd = pros.reduce((s,p)=>s+p.stdTotalCost,0);
        const costVarRate = totalStd ? totalVar/totalStd : 0;

        const invScore = Math.round((1-staleRatio)*100);
        const supScore = Math.round(avgDelivery*100);
        const costScore = Math.round((1-costVarRate)*100);
        const overallScore = Math.round((invScore + supScore + costScore)/3);

        const isDark = !document.body.classList.contains('light-mode');
        const textColor = isDark ? '#f8fafc' : '#2c2418';
        const mutedColor = isDark ? '#94a3b8' : '#7a6e5e';

        // SVG Triangle
        const svg = document.getElementById('iron-triangle-svg');
        const scoreColor = (s) => s >= 85 ? '#10b981' : s >= 70 ? '#f59e0b' : '#ef4444';
        svg.innerHTML = `
            <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="rgba(59,130,246,0.1)"/>
                    <stop offset="100%" stop-color="rgba(139,92,246,0.1)"/>
                </linearGradient>
            </defs>
            <polygon points="200,30 50,330 350,330" fill="url(#triGrad)" stroke="${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}" stroke-width="2">
                <animate attributeName="stroke-dashoffset" from="900" to="0" dur="2s" fill="freeze"/>
            </polygon>
            <line x1="200" y1="30" x2="50" y2="330" stroke="rgba(59,130,246,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
            <line x1="50" y1="330" x2="350" y2="330" stroke="rgba(16,185,129,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
            <line x1="350" y1="330" x2="200" y2="30" stroke="rgba(245,158,11,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
            <!-- Vertex: Inventory (top) -->
            <g class="vertex-score" onclick="switchTab('tab-inv-efficiency')">
                <circle cx="200" cy="30" r="32" fill="${scoreColor(invScore)}" opacity="0.2" filter="url(#glow)"/>
                <circle cx="200" cy="30" r="24" fill="${isDark ? '#1e293b' : '#fff8ee'}" stroke="${scoreColor(invScore)}" stroke-width="3"/>
                <text x="200" y="36" text-anchor="middle" fill="${scoreColor(invScore)}" font-size="14" font-weight="700">${invScore}</text>
                <text x="200" y="8" text-anchor="middle" fill="${mutedColor}" font-size="11">庫存效率</text>
            </g>
            <!-- Vertex: Supplier (bottom-left) -->
            <g class="vertex-score" onclick="switchTab('tab-sup-perf')">
                <circle cx="50" cy="330" r="32" fill="${scoreColor(supScore)}" opacity="0.2" filter="url(#glow)"/>
                <circle cx="50" cy="330" r="24" fill="${isDark ? '#1e293b' : '#fff8ee'}" stroke="${scoreColor(supScore)}" stroke-width="3"/>
                <text x="50" y="336" text-anchor="middle" fill="${scoreColor(supScore)}" font-size="14" font-weight="700">${supScore}</text>
                <text x="50" y="370" text-anchor="middle" fill="${mutedColor}" font-size="11">供應商績效</text>
            </g>
            <!-- Vertex: Cost (bottom-right) -->
            <g class="vertex-score" onclick="switchTab('tab-cost-struct')">
                <circle cx="350" cy="330" r="32" fill="${scoreColor(costScore)}" opacity="0.2" filter="url(#glow)"/>
                <circle cx="350" cy="330" r="24" fill="${isDark ? '#1e293b' : '#fff8ee'}" stroke="${scoreColor(costScore)}" stroke-width="3"/>
                <text x="350" y="336" text-anchor="middle" fill="${scoreColor(costScore)}" font-size="14" font-weight="700">${costScore}</text>
                <text x="350" y="370" text-anchor="middle" fill="${mutedColor}" font-size="11">成本控制</text>
            </g>
            <!-- Center: Overall -->
            <circle cx="200" cy="220" r="40" fill="${isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,248,238,0.9)'}" stroke="${scoreColor(overallScore)}" stroke-width="3"/>
            <text x="200" y="215" text-anchor="middle" fill="${scoreColor(overallScore)}" font-size="22" font-weight="700">${overallScore}</text>
            <text x="200" y="237" text-anchor="middle" fill="${mutedColor}" font-size="10">整體健康</text>
        `;

        // KPI Cards
        const totalStockValue = d.materials.reduce((s,m)=>s+m.stockQty*m.unitCost,0);
        const avgTurnoverDays = d.materials.reduce((s,m)=>s+m.daysInStock,0)/d.materials.length;
        document.getElementById('iron-triangle-kpis').innerHTML = `
            <div class="glass-panel kpi-card"><span class="kpi-title">📦 庫存週轉天數</span><span class="kpi-value">${avgTurnoverDays.toFixed(0)} 天</span><span class="kpi-sub">目標 < 60 天</span></div>
            <div class="glass-panel kpi-card kpi-success"><span class="kpi-title">🚚 供應商達交率</span><span class="kpi-value">${fmt.pct(avgDelivery)}</span><span class="kpi-sub">目標 > 95%</span></div>
            <div class="glass-panel kpi-card kpi-warning"><span class="kpi-title">💰 成本差異率</span><span class="kpi-value">${fmt.pct(costVarRate)}</span><span class="kpi-sub">目標 < 3%</span></div>
        `;

        // Trend chart
        if(d.ironTriangle) {
            const months = d.ironTriangle.map(t=>t.month);
            destroyChart('chart-triangle-trend');
            const ctx = document.getElementById('chart-triangle-trend');
            if(ctx) {
                window.mfgCharts['chart-triangle-trend'] = new Chart(ctx, {
                    type:'line', data:{ labels:months, datasets:[
                        {label:'庫存效率',data:d.ironTriangle.map(t=>t.inventoryScore),borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',fill:false,tension:0.4},
                        {label:'供應商績效',data:d.ironTriangle.map(t=>t.supplierScore),borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.1)',fill:false,tension:0.4},
                        {label:'成本控制',data:d.ironTriangle.map(t=>t.costScore),borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.1)',fill:false,tension:0.4},
                    ]},
                    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'},datalabels:{display:false}},scales:{y:{min:50,max:100,grid:{color:'var(--chart-grid)'}},x:{grid:{display:false}}}}
                });
            }
        }
        // Radar
        initRadarChart('chart-triangle-radar', ['庫存效率','供應商績效','成本控制','生產良率','資金效率'],
            '當前得分', [invScore, supScore, costScore, Math.round((pros.length?pros.reduce((s,p)=>s+p.yieldRate,0)/pros.length:0)*100), Math.round((1-0.32)*100)]);
    };

    // ===== Page 16: 資金佔用分析 =====
    renderMap['tab-cashflow'] = () => {
        const d = currentData;
        const cf = d.cashFlow;
        if(!cf) return;
        const pos = filterByDate(d.purchaseOrders);

        // KPIs
        document.getElementById('cashflow-kpis').innerHTML = `
            <div class="glass-panel kpi-card kpi-purple"><span class="kpi-title">資金佔用率 Capital Tied-Up</span><span class="kpi-value">${fmt.pct(cf.capitalTiedRate)}</span></div>
            <div class="glass-panel kpi-card kpi-success"><span class="kpi-title">資金釋放潛力 Release Potential</span><span class="kpi-value">${fmt.currency(cf.cashReleasePotential)}</span></div>
            <div class="glass-panel kpi-card kpi-danger"><span class="kpi-title">呆滯金額 Stale Amount</span><span class="kpi-value">${fmt.currency(cf.staleAmount)}</span></div>
            <div class="glass-panel kpi-card kpi-warning"><span class="kpi-title">早到貨隱性成本 Early Delivery Cost</span><span class="kpi-value">${fmt.currency(cf.earlyDeliveryCost)}</span></div>
        `;

        // Waterfall
        const wfLabels = ['去年庫存', '+新增採購', '-生產消耗', '+呆滯積壓', '本期庫存'];
        const wfValues = [cf.lastYearInventory, cf.newPurchases, -cf.productionConsumption, cf.staleAccumulation, cf.currentInventory];
        initWaterfallChart('chart-cash-waterfall', wfLabels, wfValues);

        // Gauge (capital tied rate as doughnut)
        destroyChart('chart-cash-gauge');
        const ctx2 = document.getElementById('chart-cash-gauge');
        if(ctx2) {
            const rate = cf.capitalTiedRate * 100;
            window.mfgCharts['chart-cash-gauge'] = new Chart(ctx2, {
                type:'doughnut',
                data:{labels:['佔用','可用'],datasets:[{data:[rate,100-rate],backgroundColor:['#ef4444','rgba(255,255,255,0.1)'],borderWidth:0}]},
                options:{responsive:true,maintainAspectRatio:false,cutout:'75%',plugins:{legend:{display:false},datalabels:{display:false},
                    tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw.toFixed(1)}%`}}
                }}
            });
        }

        // Delivery impact bar
        const earlyCount = pos.filter(p=>p.delayDays<0||(p.actualLeadTime<p.standardLeadTime)).length;
        const onTimeCount = pos.filter(p=>p.delayDays===0).length;
        const lateCount = pos.filter(p=>p.delayDays>0).length;
        const earlyAmt = pos.filter(p=>p.actualLeadTime<p.standardLeadTime).reduce((s,p)=>s+p.totalAmount,0);
        const onTimeAmt = pos.filter(p=>p.delayDays===0).reduce((s,p)=>s+p.totalAmount,0);
        const lateAmt = pos.filter(p=>p.delayDays>0).reduce((s,p)=>s+p.totalAmount,0);
        initBarChart('chart-cash-delivery', ['早到貨','準時','遲到'], '資金影響', [earlyAmt, onTimeAmt, lateAmt], false, ['#f59e0b','#10b981','#ef4444']);

        // Type pie
        const specValue = d.materials.filter(m=>m.type==='專用料').reduce((s,m)=>s+m.stockQty*m.unitCost,0);
        const genValue = d.materials.filter(m=>m.type==='通用料').reduce((s,m)=>s+m.stockQty*m.unitCost,0);
        const auxValue = d.materials.filter(m=>m.type==='輔料'||m.type==='非生產用料').reduce((s,m)=>s+m.stockQty*m.unitCost,0);
        initDoughnutChart('chart-cash-type', ['專用料','通用料','輔料'], [specValue, genValue, auxValue]);
    };

    // ===== Page 17: 供應鏈風險矩陣 =====
    renderMap['tab-risk-matrix'] = () => {
        const d = currentData;
        const rm = d.riskMatrix;
        if(!rm) return;

        const criticalCount = rm.filter(r=>r.severity==='critical').length;
        const highCount = rm.filter(r=>r.severity==='high').length;
        const medCount = rm.filter(r=>r.severity==='medium').length;
        const lowCount = rm.filter(r=>r.severity==='low').length;

        document.getElementById('risk-matrix-kpis').innerHTML = `
            <div class="glass-panel kpi-card kpi-danger"><span class="kpi-title">🔴 嚴重風險 Critical</span><span class="kpi-value">${criticalCount}</span></div>
            <div class="glass-panel kpi-card kpi-warning"><span class="kpi-title">🟠 高風險 High</span><span class="kpi-value">${highCount}</span></div>
            <div class="glass-panel kpi-card"><span class="kpi-title">🟡 中風險 Medium</span><span class="kpi-value">${medCount}</span></div>
            <div class="glass-panel kpi-card kpi-success"><span class="kpi-title">🟢 低風險 Low</span><span class="kpi-value">${lowCount}</span></div>
        `;

        // Bubble chart
        destroyChart('chart-risk-bubble');
        const ctx = document.getElementById('chart-risk-bubble');
        if(ctx) {
            const severityColors = {critical:'rgba(239,68,68,0.7)',high:'rgba(245,158,11,0.7)',medium:'rgba(59,130,246,0.7)',low:'rgba(16,185,129,0.7)'};
            const datasets = rm.map((r,i) => ({
                label: r.category,
                data: [{x:r.probability*100, y:r.impact*100, r: 12 + r.items.length*5}],
                backgroundColor: severityColors[r.severity] || 'rgba(100,100,100,0.5)',
                borderColor: 'transparent',
            }));
            window.mfgCharts['chart-risk-bubble'] = new Chart(ctx, {
                type:'bubble',
                data:{datasets},
                options:{
                    responsive:true,maintainAspectRatio:false,
                    plugins:{legend:{position:'top'},datalabels:{display:false},
                        tooltip:{callbacks:{label:c=>`${c.dataset.label}: 機率${c.raw.x.toFixed(0)}%, 影響${c.raw.y.toFixed(0)}%`}}
                    },
                    scales:{
                        x:{title:{display:true,text:'發生機率 Probability (%)'},min:0,max:100,grid:{color:'var(--chart-grid)'}},
                        y:{title:{display:true,text:'影響程度 Impact (%)'},min:0,max:100,grid:{color:'var(--chart-grid)'}}
                    }
                }
            });
        }

        // Risk trends (line)
        destroyChart('chart-risk-trends');
        const ctx2 = document.getElementById('chart-risk-trends');
        if(ctx2) {
            const tLabels = ['M-7','M-6','M-5','M-4','M-3','M-2'];
            const colors = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#10b981'];
            window.mfgCharts['chart-risk-trends'] = new Chart(ctx2, {
                type:'line',
                data:{labels:tLabels, datasets:rm.map((r,i)=>({
                    label:r.category, data:r.trend.map(v=>+(v*100).toFixed(1)),
                    borderColor:colors[i%colors.length], backgroundColor:'transparent', tension:0.4, pointRadius:3,borderWidth:2
                }))},
                options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:10}}},datalabels:{display:false}},
                    scales:{y:{title:{display:true,text:'風險指數'},grid:{color:'var(--chart-grid)'}},x:{grid:{display:false}}}
                }
            });
        }

        // Top 10 risk items table
        const allItems = [];
        rm.forEach(r => {
            r.items.forEach(item => {
                allItems.push({item, category:r.category, probability:r.probability, impact:r.impact, severity:r.severity,
                    score: Math.round(r.probability*r.impact*100),
                    action: r.severity==='critical'?'立即建立替代供應商':'加強監控並制定應急計畫'
                });
            });
        });
        allItems.sort((a,b)=>b.score-a.score);
        document.getElementById('table-risk-top10').innerHTML = `<table><thead><tr><th>項目</th><th>風險類別</th><th>機率</th><th>影響</th><th>風險分數</th><th>建議行動</th></tr></thead><tbody>${
            allItems.slice(0,10).map(r=>`<tr><td>${r.item}</td><td>${r.category}</td><td>${fmt.pct(r.probability)}</td><td>${fmt.pct(r.impact)}</td><td><span class="status-badge ${r.severity==='critical'?'badge-danger':r.severity==='high'?'badge-warning':'badge-info'}">${r.score}</span></td><td style="font-size:0.75rem">${r.action}</td></tr>`).join('')
        }</tbody></table>`;
    };

    // ===== Page 18: 採購效率象限 =====
    renderMap['tab-procurement-quad'] = () => {
        const d = currentData;
        const pos = filterByDate(d.purchaseOrders);
        if(!pos.length) return;

        const avgCycle = pos.reduce((s,p)=>s+(p.cycleDays||p.actualLeadTime),0)/pos.length;
        const medianAmount = [...pos].sort((a,b)=>a.totalAmount-b.totalAmount)[Math.floor(pos.length/2)].totalAmount;

        // Quadrant thresholds
        const xThresh = avgCycle;
        const yThresh = medianAmount;

        // Classify
        const quadrants = {
            strategic: pos.filter(p=>(p.cycleDays||p.actualLeadTime)>=xThresh && p.totalAmount>=yThresh),
            inefficient: pos.filter(p=>(p.cycleDays||p.actualLeadTime)>=xThresh && p.totalAmount<yThresh),
            fast: pos.filter(p=>(p.cycleDays||p.actualLeadTime)<xThresh && p.totalAmount<yThresh),
            urgent: pos.filter(p=>(p.cycleDays||p.actualLeadTime)<xThresh && p.totalAmount>=yThresh),
        };

        document.getElementById('procurement-quad-kpis').innerHTML = `
            <div class="glass-panel kpi-card"><span class="kpi-title">平均採購週期</span><span class="kpi-value">${avgCycle.toFixed(1)} 天</span></div>
            <div class="glass-panel kpi-card kpi-purple"><span class="kpi-title">中位數採購金額</span><span class="kpi-value">${fmt.currency(medianAmount)}</span></div>
            <div class="glass-panel kpi-card kpi-warning"><span class="kpi-title">效率異常 Zone B</span><span class="kpi-value">${quadrants.inefficient.length} 筆</span></div>
            <div class="glass-panel kpi-card kpi-success"><span class="kpi-title">快速採購 Zone C</span><span class="kpi-value">${quadrants.fast.length} 筆</span></div>
        `;

        // Scatter plot
        destroyChart('chart-proc-scatter');
        const ctx = document.getElementById('chart-proc-scatter');
        if(ctx) {
            const qColors = {strategic:'#8b5cf6',inefficient:'#ef4444',fast:'#10b981',urgent:'#f59e0b'};
            const qLabels = {strategic:'戰略採購(A)',inefficient:'效率異常(B)',fast:'快速採購(C)',urgent:'緊急採購(D)'};
            const datasets = Object.entries(quadrants).map(([key,items])=>({
                label:qLabels[key],
                data:items.slice(0,50).map(p=>({x:p.cycleDays||p.actualLeadTime, y:p.totalAmount})),
                backgroundColor:qColors[key], pointRadius:5, pointHoverRadius:7
            }));
            window.mfgCharts['chart-proc-scatter'] = new Chart(ctx, {
                type:'scatter',data:{datasets},
                options:{responsive:true,maintainAspectRatio:false,
                    plugins:{legend:{position:'top'},datalabels:{display:false},
                        annotation: undefined,
                        tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.raw.x}天, ${fmt.currency(c.raw.y)}`}}
                    },
                    scales:{
                        x:{title:{display:true,text:'採購週期 (天)'},grid:{color:'var(--chart-grid)'}},
                        y:{title:{display:true,text:'採購金額'},grid:{color:'var(--chart-grid)'}}
                    }
                }
            });
        }

        // Side stats
        document.getElementById('quadrant-stats').innerHTML = `
            <div class="glass-panel quadrant-stat"><div class="q-label">A 戰略採購</div><div class="q-value" style="color:#8b5cf6">${quadrants.strategic.length} 筆</div><div class="q-count">大額長週期</div></div>
            <div class="glass-panel quadrant-stat"><div class="q-label" style="color:var(--danger)">B 效率異常 ⚠️</div><div class="q-value" style="color:#ef4444">${quadrants.inefficient.length} 筆</div><div class="q-count">小額長週期</div></div>
            <div class="glass-panel quadrant-stat"><div class="q-label">C 快速採購</div><div class="q-value" style="color:#10b981">${quadrants.fast.length} 筆</div><div class="q-count">小額短週期</div></div>
            <div class="glass-panel quadrant-stat"><div class="q-label">D 緊急採購</div><div class="q-value" style="color:#f59e0b">${quadrants.urgent.length} 筆</div><div class="q-count">大額短週期</div></div>
        `;

        // Zone B anomaly table
        const zoneB = quadrants.inefficient.sort((a,b)=>(b.cycleDays||b.actualLeadTime)-(a.cycleDays||a.actualLeadTime)).slice(0,15);
        document.getElementById('table-proc-anomaly').innerHTML = `<table><thead><tr><th>PO</th><th>物料</th><th>供應商</th><th>週期(天)</th><th>金額</th><th>狀態</th></tr></thead><tbody>${
            zoneB.map(p=>`<tr><td>${p.poNumber}</td><td>${p.materialName}</td><td>${p.supplierName}</td><td>${p.cycleDays||p.actualLeadTime}</td><td>${fmt.currency(p.totalAmount)}</td><td><span class="status-badge badge-danger">效率異常</span></td></tr>`).join('')
        }</tbody></table>`;
    };

    // ===== Page 19: 情境模擬器 =====
    const renderSimulator = () => {
        const d = currentData;
        if(!d) return;
        const pros = filterByDate(d.productionOrders);
        if(!pros.length) return;

        const priceChange = parseFloat(document.getElementById('sim-price').value)/100;
        const yieldChange = parseFloat(document.getElementById('sim-yield').value)/100;
        const volumeChange = parseFloat(document.getElementById('sim-volume').value)/100;

        // Base metrics
        const baseMat = pros.reduce((s,p)=>s+p.actMaterialCost*p.goodOutput,0);
        const baseLabor = pros.reduce((s,p)=>s+p.actLaborCost*p.goodOutput,0);
        const baseOH = pros.reduce((s,p)=>s+p.actOverheadCost*p.goodOutput,0);
        const baseTotal = baseMat + baseLabor + baseOH;
        const baseVolume = pros.reduce((s,p)=>s+p.goodOutput,0);
        const baseUnitCost = baseTotal / baseVolume;

        // Simulated
        const simMat = baseMat * (1 + priceChange);
        const avgYield = pros.reduce((s,p)=>s+p.yieldRate,0)/pros.length;
        const newYield = Math.min(1, Math.max(0.5, avgYield + yieldChange));
        const yieldImpact = avgYield / newYield; // worse yield = higher cost
        const simLabor = baseLabor * yieldImpact;
        const simOH = baseOH * (1 + volumeChange * -0.3); // economies of scale
        const simTotal = simMat + simLabor + simOH;
        const simVolume = baseVolume * (1 + volumeChange);
        const simUnitCost = simTotal / (simVolume || 1);
        const totalCostChange = simTotal - baseTotal;
        const pctChange = baseTotal ? (simTotal - baseTotal)/baseTotal : 0;

        document.getElementById('sim-price-val').textContent = `${priceChange>=0?'+':''}${(priceChange*100).toFixed(0)}%`;
        document.getElementById('sim-yield-val').textContent = `${yieldChange>=0?'+':''}${(yieldChange*100).toFixed(1)}%`;
        document.getElementById('sim-volume-val').textContent = `${volumeChange>=0?'+':''}${(volumeChange*100).toFixed(0)}%`;

        const changeColor = totalCostChange > 0 ? 'var(--danger)' : 'var(--success)';
        document.getElementById('sim-summary').innerHTML = `
            <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">預估總成本變動 Projected Cost Change</div>
            <div class="big-number" style="color:${changeColor}">${totalCostChange>=0?'+':''}${fmt.currency(Math.abs(totalCostChange))}</div>
            <div class="sub-text">${fmt.pct(Math.abs(pctChange))} ${totalCostChange>=0?'增加':'減少'} | 單位成本: ${fmt.currency(baseUnitCost)} → ${fmt.currency(simUnitCost)}</div>
        `;

        // Unit cost line chart (monthly comparison)
        const months = [...new Set(pros.map(p=>p.month))].sort();
        const baseByMonth = months.map(m => {
            const mp = pros.filter(p=>p.month===m);
            const vol = mp.reduce((s,p)=>s+p.goodOutput,0);
            const cost = mp.reduce((s,p)=>s+(p.actMaterialCost+p.actLaborCost+p.actOverheadCost)*p.goodOutput,0);
            return vol ? +(cost/vol).toFixed(2) : 0;
        });
        const simByMonth = baseByMonth.map(v => +(v * (1 + pctChange)).toFixed(2));
        destroyChart('chart-sim-cost');
        const ctx1 = document.getElementById('chart-sim-cost');
        if(ctx1) {
            window.mfgCharts['chart-sim-cost'] = new Chart(ctx1, {
                type:'line', data:{labels:months, datasets:[
                    {label:'基準 Baseline',data:baseByMonth,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',fill:true,tension:0.4},
                    {label:'模擬 Simulated',data:simByMonth,borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,0.1)',fill:true,tension:0.4,borderDash:[5,5]}
                ]},
                options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'},datalabels:{display:false}},scales:{y:{grid:{color:'var(--chart-grid)'}},x:{grid:{display:false}}}}
            });
        }

        // Cost structure donut (before/after side by side via stacked bar)
        destroyChart('chart-sim-structure');
        const ctx2 = document.getElementById('chart-sim-structure');
        if(ctx2) {
            window.mfgCharts['chart-sim-structure'] = new Chart(ctx2, {
                type:'bar', data:{labels:['基準','模擬'], datasets:[
                    {label:'料 Material',data:[baseMat/baseTotal*100, simMat/simTotal*100],backgroundColor:'#3b82f6',borderRadius:4},
                    {label:'工 Labor',data:[baseLabor/baseTotal*100, simLabor/simTotal*100],backgroundColor:'#10b981',borderRadius:4},
                    {label:'費 Overhead',data:[baseOH/baseTotal*100, simOH/simTotal*100],backgroundColor:'#f59e0b',borderRadius:4},
                ]},
                options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'},datalabels:{display:false}},
                    scales:{y:{stacked:true,max:100,grid:{color:'var(--chart-grid)'}},x:{stacked:true,grid:{display:false}}}}
            });
        }

        // Profit impact waterfall
        const matDelta = simMat - baseMat;
        const laborDelta = simLabor - baseLabor;
        const ohDelta = simOH - baseOH;
        initWaterfallChart('chart-sim-waterfall', ['基準成本','原料變動','人工變動','費用變動','模擬成本'],
            [baseTotal, matDelta, laborDelta, ohDelta, simTotal]);
    };

    renderMap['tab-whatif'] = () => {
        renderSimulator();
    };

    // Attach slider events
    ['sim-price','sim-yield','sim-volume'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const ap = document.querySelector('.tab-pane.active');
            if(ap && ap.id === 'tab-whatif') renderSimulator();
        });
    });

    // ===== Page 20: 管理駕駛艙 =====
    renderMap['tab-exec-cockpit'] = () => {
        const d = currentData;
        const pros = filterByDate(d.productionOrders);
        const pos = filterByDate(d.purchaseOrders);

        const staleRatio = d.materials.filter(m=>m.daysInStock>90).length / d.materials.length;
        const avgDelivery = d.suppliers.reduce((s,sup)=>s+sup.onTimeDeliveryRate,0)/d.suppliers.length;
        const totalVar = pros.reduce((s,p)=>s+Math.abs(p.materialVar+p.laborVar+p.overheadVar),0);
        const totalStd = pros.reduce((s,p)=>s+p.stdTotalCost,0);
        const costVarRate = totalStd ? totalVar/totalStd : 0;
        const avgYield = pros.length ? pros.reduce((s,p)=>s+p.yieldRate,0)/pros.length : 0;
        const totalInv = d.materials.reduce((s,m)=>s+m.stockQty*m.unitCost,0);
        const monthlyUsage = d.materials.reduce((s,m)=>s+m.monthlyUsage*m.unitCost,0);
        const turnoverRate = monthlyUsage ? (monthlyUsage*12/totalInv) : 0;
        const cashEfficiency = 1 - (d.cashFlow ? d.cashFlow.capitalTiedRate : 0.32);

        const gauges = [
            {id:'g1', label:'營運健康度', subtitle:'Overall Health', value: Math.round(((1-staleRatio)*100*0.3 + avgDelivery*100*0.3 + (1-costVarRate)*100*0.2 + avgYield*100*0.2)), color:'#3b82f6', sparkData:[72,75,78,74,80,82]},
            {id:'g2', label:'庫存週轉效率', subtitle:'Inventory Turnover', value: Math.min(100, Math.round(turnoverRate/12*100)), color:'#8b5cf6', sparkData:[55,58,60,62,58,65]},
            {id:'g3', label:'供應商達交率', subtitle:'On-Time Delivery', value: Math.round(avgDelivery*100), color:'#10b981', sparkData:[88,90,87,92,91,93]},
            {id:'g4', label:'成本控制率', subtitle:'Cost Control', value: Math.round((1-costVarRate)*100), color:'#f59e0b', sparkData:[92,90,94,91,95,93]},
            {id:'g5', label:'品質良率', subtitle:'Quality Yield', value: Math.round(avgYield*100), color:'#0ea5e9', sparkData:[95,96,95,97,96,97]},
            {id:'g6', label:'現金流效率', subtitle:'Cash Flow', value: Math.round(cashEfficiency*100), color:'#ec4899', sparkData:[62,65,68,66,70,68]},
        ];

        // Traffic light bar
        const greenCount = gauges.filter(g=>g.value>=85).length;
        const yellowCount = gauges.filter(g=>g.value>=70&&g.value<85).length;
        const redCount = gauges.filter(g=>g.value<70).length;
        document.getElementById('cockpit-traffic').innerHTML = `
            <span style="font-weight:600;font-size:0.85rem;">狀態摘要</span>
            <div class="traffic-summary-item"><span class="traffic-dot green"></span> ${greenCount} 正常</div>
            <div class="traffic-summary-item"><span class="traffic-dot yellow"></span> ${yellowCount} 注意</div>
            <div class="traffic-summary-item"><span class="traffic-dot red"></span> ${redCount} 警告</div>
        `;

        // Gauge widgets
        document.getElementById('cockpit-gauges').innerHTML = gauges.map(g => `
            <div class="glass-panel gauge-widget">
                <canvas id="gauge-${g.id}" width="200" height="200"></canvas>
                <div class="gauge-label">${g.label} <span style="font-size:0.7rem;color:var(--text-muted)">${g.subtitle}</span></div>
                <div class="gauge-value-text" style="color:${g.value>=85?'var(--success)':g.value>=70?'var(--warning)':'var(--danger)'}">${g.value}%</div>
                <div class="gauge-sparkline">${g.sparkData.map(v=>`<div class="spark-bar" style="height:${v*0.24}px;background:${g.color}"></div>`).join('')}</div>
            </div>
        `).join('');

        // Render gauge charts
        gauges.forEach(g => {
            destroyChart('gauge-'+g.id);
            const ctx = document.getElementById('gauge-'+g.id);
            if(!ctx) return;
            const gaugeColor = g.value >= 85 ? '#10b981' : g.value >= 70 ? '#f59e0b' : '#ef4444';
            window.mfgCharts['gauge-'+g.id] = new Chart(ctx, {
                type:'doughnut',
                data:{datasets:[{data:[g.value, 100-g.value], backgroundColor:[gaugeColor,'rgba(255,255,255,0.06)'], borderWidth:0}]},
                options:{responsive:true,maintainAspectRatio:true,rotation:-90,circumference:180,cutout:'80%',
                    plugins:{legend:{display:false},datalabels:{display:false},tooltip:{enabled:false}}}
            });
        });

        // Insight cards
        const insights = [
            {icon:'📦',title:'庫存建議',text:`目前有 ${d.materials.filter(m=>m.daysInStock>90).length} 項物料超過 90 天未動銷，建議針對專用料啟動處分流程，預估可釋放 ${fmt.currency(d.materials.filter(m=>m.daysInStock>90).reduce((s,m)=>s+m.stockQty*m.unitCost,0))} 資金。`},
            {icon:'🚚',title:'供應商預警',text:`${d.suppliers.filter(s=>s.tier==='At-Risk').length} 家供應商處於 At-Risk 等級，其中 ${d.suppliers.filter(s=>s.onTimeDeliveryRate<0.85).map(s=>s.name).join('、')} 達交率偏低，建議啟動供應商輔導計畫。`},
            {icon:'💰',title:'成本觀察',text:`本期成本差異率為 ${fmt.pct(costVarRate)}，主要來自材料價格波動。建議加強長約比例，鎖定關鍵料件價格，目標將差異率控制在 3% 以內。`},
            {icon:'🏭',title:'良率提升',text:`整體良率 ${fmt.pct(avgYield)}，${pros.filter(p=>p.yieldRate<0.95).length} 筆工單良率低於 95%，建議優先改善 ${[...new Set(pros.filter(p=>p.yieldRate<0.93).map(p=>p.line))].join('、')||'各產線'} 的製程穩定性。`},
        ];
        document.getElementById('cockpit-insights').innerHTML = insights.map(ins => `
            <div class="glass-panel insight-card">
                <div class="insight-icon">${ins.icon}</div>
                <div class="insight-title">${ins.title}</div>
                <div class="insight-text">${ins.text}</div>
            </div>
        `).join('');
    };

    // ===== Page 21: 價值流圖 =====
    renderMap['tab-vsm'] = () => {
        const d = currentData;
        const vs = d.valueStream;
        if(!vs) return;

        const totalCycle = vs.reduce((s,n)=>s+n.cycleTime,0);
        const totalWait = vs.reduce((s,n)=>s+n.waitTime,0);
        const totalLead = totalCycle + totalWait;
        const valueAddTime = vs.reduce((s,n)=>s+n.cycleTime*n.valueAddRatio,0);
        const valueAddPct = totalLead ? valueAddTime/totalLead : 0;
        const wastePct = 1 - valueAddPct;

        document.getElementById('vsm-kpis').innerHTML = `
            <div class="glass-panel kpi-card"><span class="kpi-title">總前置時間 Total Lead Time</span><span class="kpi-value">${totalLead.toFixed(1)} 天</span></div>
            <div class="glass-panel kpi-card kpi-success"><span class="kpi-title">增值時間 Value-Add</span><span class="kpi-value">${valueAddTime.toFixed(1)} 天</span></div>
            <div class="glass-panel kpi-card kpi-danger"><span class="kpi-title">浪費比例 Waste</span><span class="kpi-value">${fmt.pct(wastePct)}</span></div>
            <div class="glass-panel kpi-card kpi-warning"><span class="kpi-title">瓶頸站點 Bottlenecks</span><span class="kpi-value">${vs.filter(n=>n.bottleneck).length} 站</span></div>
        `;

        // Flow
        const arrowSvg = '<svg viewBox="0 0 32 20" fill="currentColor"><path d="M0 8h24l-6-6 2-2 10 10-10 10-2-2 6-6H0z"/></svg>';
        document.getElementById('vsm-flow').innerHTML = vs.map((node,i) => {
            const nodeHtml = `<div class="vsm-node ${node.bottleneck?'bottleneck':''}">
                <div class="node-title">${node.name}</div>
                <div class="node-metric">週期: <b>${node.cycleTime}天</b></div>
                <div class="node-metric">等待: <b>${node.waitTime}天</b></div>
                <div class="node-metric">增值率: <b>${(node.valueAddRatio*100).toFixed(0)}%</b></div>
            </div>`;
            const arrow = i < vs.length-1 ? `<div class="vsm-arrow animated">${arrowSvg}</div>` : '';
            return nodeHtml + arrow;
        }).join('');

        // Timeline bar
        const colors = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#ec4899','#14b8a6'];
        document.getElementById('vsm-timeline').innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:0.85rem;font-weight:600;">前置時間分解 Lead Time Breakdown</span>
                <span style="font-size:0.8rem;color:var(--text-secondary)">總計 ${totalLead.toFixed(1)} 天</span>
            </div>
            <div class="vsm-timeline-bar">
                ${vs.map((n,i)=>`<div class="segment" style="width:${((n.cycleTime+n.waitTime)/totalLead*100).toFixed(1)}%;background:${colors[i%colors.length]}" title="${n.name}: ${(n.cycleTime+n.waitTime).toFixed(1)}天"></div>`).join('')}
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                ${vs.map((n,i)=>`<span style="font-size:0.7rem;color:var(--text-secondary);display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:${colors[i%colors.length]};display:inline-block"></span>${n.name}</span>`).join('')}
            </div>
            <div class="vsm-efficiency">
                <div class="stat"><div class="stat-value" style="color:var(--success)">${fmt.pct(valueAddPct)}</div><div class="stat-label">增值比例</div></div>
                <div class="stat"><div class="stat-value" style="color:var(--danger)">${fmt.pct(wastePct)}</div><div class="stat-label">浪費比例</div></div>
            </div>
        `;

        // Cycle time bar chart
        initBarChart('chart-vsm-cycle', vs.map(n=>n.name), '天數',
            vs.map(n=>n.cycleTime+n.waitTime), false,
            vs.map(n=>n.bottleneck?'#ef4444':'#3b82f6'));

        // Value add ratio chart
        destroyChart('chart-vsm-ratio');
        const ctx = document.getElementById('chart-vsm-ratio');
        if(ctx) {
            window.mfgCharts['chart-vsm-ratio'] = new Chart(ctx, {
                type:'bar', data:{labels:vs.map(n=>n.name), datasets:[
                    {label:'增值',data:vs.map(n=>+(n.cycleTime*n.valueAddRatio).toFixed(2)),backgroundColor:'#10b981',borderRadius:4},
                    {label:'浪費',data:vs.map(n=>+(n.cycleTime*(1-n.valueAddRatio)+n.waitTime).toFixed(2)),backgroundColor:'rgba(239,68,68,0.5)',borderRadius:4},
                ]},
                options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'},datalabels:{display:false}},
                    scales:{y:{stacked:true,grid:{color:'var(--chart-grid)'}},x:{stacked:true,grid:{display:false}}}}
            });
        }
    };

    // ===== Page 22: 標竿對比 =====
    renderMap['tab-benchmark'] = () => {
        const d = currentData;
        const bm = d.benchmark;
        if(!bm) return;

        const pros = filterByDate(d.productionOrders);
        const avgGap = bm.dimensions.reduce((s,_,i) => s + (bm.industryBest[i]-bm.company[i]),0) / bm.dimensions.length;

        document.getElementById('benchmark-kpis').innerHTML = `
            <div class="glass-panel kpi-card"><span class="kpi-title">平均標竿差距 Avg Gap</span><span class="kpi-value">${avgGap.toFixed(1)} pts</span></div>
            <div class="glass-panel kpi-card kpi-success"><span class="kpi-title">優於行業平均</span><span class="kpi-value">${bm.dimensions.filter((_,i)=>bm.company[i]>bm.industryAvg[i]).length} / ${bm.dimensions.length}</span></div>
            <div class="glass-panel kpi-card kpi-warning"><span class="kpi-title">達標竿水準</span><span class="kpi-value">${bm.dimensions.filter((_,i)=>bm.company[i]>=bm.industryBest[i]).length} / ${bm.dimensions.length}</span></div>
            <div class="glass-panel kpi-card kpi-purple"><span class="kpi-title">最大差距維度</span><span class="kpi-value">${bm.dimensions[bm.dimensions.reduce((maxI,_,i,a)=>(bm.industryBest[i]-bm.company[i])>(bm.industryBest[maxI]-bm.company[maxI])?i:maxI,0)]}</span></div>
        `;

        // Radar chart
        destroyChart('chart-bench-radar');
        const ctx = document.getElementById('chart-bench-radar');
        if(ctx) {
            window.mfgCharts['chart-bench-radar'] = new Chart(ctx, {
                type:'radar',
                data:{labels:bm.dimensions, datasets:[
                    {label:'公司 Company',data:bm.company,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.15)',pointBackgroundColor:'#3b82f6',borderWidth:2},
                    {label:'行業平均 Avg',data:bm.industryAvg,borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.08)',pointBackgroundColor:'#f59e0b',borderWidth:2,borderDash:[5,5]},
                    {label:'行業標竿 Best',data:bm.industryBest,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.08)',pointBackgroundColor:'#10b981',borderWidth:2},
                ]},
                options:{responsive:true,maintainAspectRatio:false,scales:{r:{beginAtZero:true,max:100,grid:{color:'rgba(255,255,255,0.08)'},angleLines:{color:'rgba(255,255,255,0.08)'}}},
                    plugins:{legend:{position:'bottom'},datalabels:{display:false}}}
            });
        }

        // Gap bar chart
        destroyChart('chart-bench-gap');
        const ctx2 = document.getElementById('chart-bench-gap');
        if(ctx2) {
            const gaps = bm.dimensions.map((_,i)=>bm.industryBest[i]-bm.company[i]);
            window.mfgCharts['chart-bench-gap'] = new Chart(ctx2, {
                type:'bar',
                data:{labels:bm.dimensions, datasets:[
                    {label:'公司',data:bm.company,backgroundColor:'#3b82f6',borderRadius:4},
                    {label:'差距到標竿',data:gaps,backgroundColor:'rgba(239,68,68,0.5)',borderRadius:4},
                ]},
                options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
                    plugins:{legend:{position:'top'},datalabels:{display:false}},
                    scales:{x:{stacked:true,grid:{color:'var(--chart-grid)'}},y:{stacked:true,grid:{display:false}}}}
            });
        }

        // Roadmap table
        const roadmap = bm.dimensions.map((_,i) => ({
            dimension: bm.dimensions[i],
            current: bm.company[i],
            target: bm.industryBest[i],
            gap: bm.industryBest[i] - bm.company[i],
            priority: bm.industryBest[i] - bm.company[i] > 15 ? '高' : bm.industryBest[i] - bm.company[i] > 8 ? '中' : '低',
            action: ['提高庫存週轉，減少呆滯庫存','強化供應商考核，導入備援供應商','優化製程參數，降低不良率','議價與替代料件評估','分散採購來源，降低集中度'][i]
        })).sort((a,b)=>b.gap-a.gap);

        document.getElementById('table-bench-roadmap').innerHTML = `<table><thead><tr><th>維度</th><th>現況</th><th>標竿</th><th>差距</th><th>優先級</th><th>改善方向</th></tr></thead><tbody>${
            roadmap.map(r=>`<tr><td>${r.dimension}</td><td>${r.current}</td><td>${r.target}</td><td>${r.gap}</td><td><span class="status-badge ${r.priority==='高'?'badge-danger':r.priority==='中'?'badge-warning':'badge-success'}">${r.priority}</span></td><td style="font-size:0.75rem">${r.action}</td></tr>`).join('')
        }</tbody></table>`;
    };
"""

# Insert the new JS before the closing </script>
v3 = v3.replace('</script>', new_js + '\n</script>')

# ============================================================
# 6. Replace the sample data loading call
# ============================================================
# The V2 has: currentData = generateSampleDataV2();
# We need to change it to use generateSampleDataV3
v3 = v3.replace(
    "document.getElementById('btn-reset').addEventListener('click', () => { currentData = generateSampleDataV2();",
    "document.getElementById('btn-reset').addEventListener('click', () => { currentData = generateSampleDataV3();"
)

# Also change the initial data load at the bottom
# In V2, the initial load is: currentData = generateSampleDataV2();
v3 = v3.replace(
    'currentData = generateSampleDataV2();',
    'currentData = generateSampleDataV3();'
)

# ============================================================
# 7. Export mode styles for new tabs
# ============================================================
export_css_addition = """
        body.export-mode .sim-slider-group,
        body.export-mode .sim-summary,
        body.export-mode .gauge-widget,
        body.export-mode .insight-card,
        body.export-mode .quadrant-stat,
        body.export-mode .vsm-node,
        body.export-mode .vsm-timeline,
        body.export-mode .traffic-summary-bar { background: #1e293b !important; border: 1px solid #334155 !important; }
        body.light-mode.export-mode .sim-slider-group,
        body.light-mode.export-mode .sim-summary,
        body.light-mode.export-mode .gauge-widget,
        body.light-mode.export-mode .insight-card,
        body.light-mode.export-mode .quadrant-stat,
        body.light-mode.export-mode .vsm-node,
        body.light-mode.export-mode .vsm-timeline,
        body.light-mode.export-mode .traffic-summary-bar { background: #fff8ee !important; border: 1px solid #e0d5c5 !important; }
"""

v3 = v3.replace(
    "body.light-mode.export-mode .forecast-stat { background: #fff8ee !important; }\n    </style>",
    "body.light-mode.export-mode .forecast-stat { background: #fff8ee !important; }\n" + export_css_addition + "    </style>"
)

# ============================================================
# 8. Update Excel export to include V3 collections
# ============================================================
v3 = v3.replace(
    "a.download = 'manufacturing_data_v2.json';",
    "a.download = 'manufacturing_data_v3.json';"
)
v3 = v3.replace(
    "XLSX.writeFile(wb, 'Manufacturing_Data_V2.xlsx');",
    "XLSX.writeFile(wb, 'Manufacturing_Data_V3.xlsx');"
)

# Write the file
with open('/home/user/workspace/dashboard-v3/index.html', 'w', encoding='utf-8') as f:
    f.write(v3)

print(f"V3 dashboard written: {len(v3)} characters, {v3.count(chr(10))} lines")
