// sample_manufacturing_data.js
// 用於生成製造業分析儀表板的模擬資料 (共約 100 筆紀錄，涵蓋庫存、供應商、生產與成本)

const generateSampleData = () => {
    // 1. 供應商資料 (Suppliers)
    const suppliers = [
        { id: 'S001', name: '台積精密工業', category: '電子零件', rating: 92, discountRate: 0.05, onTimeDeliveryRate: 0.95 },
        { id: 'S002', name: '大立光電科技', category: '光學元件', rating: 88, discountRate: 0.02, onTimeDeliveryRate: 0.88 },
        { id: 'S003', name: '日月光半導體', category: '封裝測試', rating: 95, discountRate: 0.04, onTimeDeliveryRate: 0.98 },
        { id: 'S004', name: '鴻海金屬機殼', category: '機構件', rating: 82, discountRate: 0.08, onTimeDeliveryRate: 0.85 },
        { id: 'S005', name: '聯發晶片組件', category: 'IC 晶片', rating: 90, discountRate: 0.03, onTimeDeliveryRate: 0.92 },
        { id: 'S006', name: '廣達組裝服務', category: '代工組裝', rating: 86, discountRate: 0.01, onTimeDeliveryRate: 0.89 },
        { id: 'S007', name: '台達電模組', category: '電源供應', rating: 94, discountRate: 0.06, onTimeDeliveryRate: 0.96 },
        { id: 'S008', name: '國巨被動元件', category: '基礎零件', rating: 85, discountRate: 0.07, onTimeDeliveryRate: 0.87 },
    ];

    // 2. 原物料庫存資料 (Inventory) - A/B/C 分類
    const materials = [
        // A 類 (高價值)
        { id: 'M-IC-01', name: '高階處理器晶片', category: 'IC 晶片', supplierId: 'S005', type: '專用料', abcClass: 'A', unitCost: 1500, stockQty: 500, monthlyUsage: 250, daysInStock: 60 },
        { id: 'M-OP-01', name: '高解析鏡頭模組', category: '光學元件', supplierId: 'S002', type: '專用料', abcClass: 'A', unitCost: 800, stockQty: 1000, monthlyUsage: 400, daysInStock: 75 },
        { id: 'M-PW-01', name: '大容量電源供應器', category: '電源供應', supplierId: 'S007', type: '通用料', abcClass: 'A', unitCost: 1200, stockQty: 800, monthlyUsage: 600, daysInStock: 40 },

        // B 類 (中等價值)
        { id: 'M-PC-01', name: '多層印刷電路板', category: '電子零件', supplierId: 'S001', type: '專用料', abcClass: 'B', unitCost: 300, stockQty: 2500, monthlyUsage: 1200, daysInStock: 62 },
        { id: 'M-ME-01', name: '鋁合金機殼', category: '機構件', supplierId: 'S004', type: '專用料', abcClass: 'B', unitCost: 450, stockQty: 1500, monthlyUsage: 800, daysInStock: 56 },
        { id: 'M-PK-01', name: '防靜電包材', category: '包裝組件', supplierId: 'S006', type: '通用料', abcClass: 'B', unitCost: 50, stockQty: 10000, monthlyUsage: 4500, daysInStock: 66 },

        // C 類 (低價值，高體積/數量)
        { id: 'M-RE-01', name: 'SMD 電阻', category: '基礎零件', supplierId: 'S008', type: '通用料', abcClass: 'C', unitCost: 1.5, stockQty: 500000, monthlyUsage: 150000, daysInStock: 100 },
        { id: 'M-CA-01', name: 'MLCC 電容', category: '基礎零件', supplierId: 'S008', type: '通用料', abcClass: 'C', unitCost: 2.5, stockQty: 300000, monthlyUsage: 80000, daysInStock: 112 },
        { id: 'M-SC-01', name: '標準螺絲組', category: '機構件', supplierId: 'S004', type: '通用料', abcClass: 'C', unitCost: 0.8, stockQty: 200000, monthlyUsage: 60000, daysInStock: 100 },
        { id: 'M-TP-01', name: '絕緣膠帶', category: '非生產用料', supplierId: 'S004', type: '輔料', abcClass: 'C', unitCost: 15, stockQty: 5000, monthlyUsage: 1200, daysInStock: 125 }
    ];

    // 3. 採購訂單歷史 (Purchase Orders) - 用於時效與價格分析
    const purchaseOrders = [];
    const today = new Date('2024-05-31');

    for (let i = 0; i < 150; i++) {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const supplier = suppliers.find(s => s.id === material.supplierId);

        // 生成過去 12 個月的訂單
        const daysAgo = Math.floor(Math.random() * 365);
        const orderDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

        // 標準交期為 14 天
        const standardLeadTime = 14;

        // 模擬實際交期 (根據供應商績效有不同變異)
        let actualLeadTime;
        if (Math.random() < supplier.onTimeDeliveryRate) {
            // 準時或提早 (10-14天)
            actualLeadTime = standardLeadTime - Math.floor(Math.random() * 4);
        } else {
            // 遲交 (15-25天)
            actualLeadTime = standardLeadTime + Math.ceil(Math.random() * 11);
        }

        const receivedDate = new Date(orderDate.getTime() + (actualLeadTime * 24 * 60 * 60 * 1000));

        // 模擬價格波動 (越接近現在，可能有通膨或降本效果)
        // 假設有整體降本趨勢 
        const timeProgress = 1 - (daysAgo / 365); // 0 (past) to 1 (now)
        const priceVariation = 1 + (Math.random() * 0.1 - 0.05); // +/- 5% 隨機波動
        // 若供應商 discountRate 高，價格隨時間下降幅度較大
        const trendFactor = 1 - (supplier.discountRate * timeProgress);

        const purchasePrice = Number((material.unitCost * priceVariation * trendFactor).toFixed(2));
        const orderQty = Math.ceil((material.monthlyUsage / 2) * (1 + Math.random())); // 每次半個月到滿月用量

        purchaseOrders.push({
            poNumber: `PO-2023-${String(i + 1).padStart(4, '0')}`,
            date: orderDate.toISOString().split('T')[0],
            receivedDate: receivedDate.toISOString().split('T')[0],
            materialId: material.id,
            materialName: material.name,
            supplierId: supplier.id,
            supplierName: supplier.name,
            qty: orderQty,
            unitPrice: purchasePrice,
            totalAmount: purchasePrice * orderQty,
            standardLeadTime: standardLeadTime,
            actualLeadTime: actualLeadTime,
            delayDays: actualLeadTime > standardLeadTime ? actualLeadTime - standardLeadTime : 0
        });
    }

    // Sort POs by date
    purchaseOrders.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 4. 生產工單 (Production Orders) & 成本結構 (Cost Structure)
    const productionOrders = [];
    const productionLines = ['Line-A (SMT)', 'Line-B (組裝)', 'Line-C (測試)', 'Line-D (包裝)'];

    // 定義產品的 BOM (Bill of Materials) 展平結構 (直接到原物料)
    const products = [
        {
            id: 'FG-001', name: '旗艦智慧型手機',
            bom: [
                { matId: 'M-IC-01', qty: 1 }, { matId: 'M-OP-01', qty: 3 },
                { matId: 'M-ME-01', qty: 1 }, { matId: 'M-PC-01', qty: 1 },
                { matId: 'M-RE-01', qty: 45 }, { matId: 'M-CA-01', qty: 60 }
            ],
            stdLaborHrs: 2.5, stdMachHrs: 1.2
        },
        {
            id: 'FG-002', name: '高階伺服器系統',
            bom: [
                { matId: 'M-IC-01', qty: 4 }, { matId: 'M-PW-01', qty: 2 },
                { matId: 'M-ME-01', qty: 2 }, { matId: 'M-PC-01', qty: 4 },
                { matId: 'M-RE-01', qty: 200 }, { matId: 'M-CA-01', qty: 250 },
                { matId: 'M-SC-01', qty: 40 }
            ],
            stdLaborHrs: 8.0, stdMachHrs: 4.5
        }
    ];

    // 固定的標準成本費率
    const stdLaborRate = 250; // 每小時人工成本
    const stdOverheadRate = 400; // 每小時製造費用

    for (let i = 0; i < 80; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const line = productionLines[Math.floor(Math.random() * productionLines.length)];

        // 過去 6 個月的生產
        const daysAgo = Math.floor(Math.random() * 180);
        const prodDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        const monthStr = prodDate.toISOString().slice(0, 7); // YYYY-MM

        const targetOutput = Math.floor(500 + Math.random() * 1500); // 目標產能
        const inputQty = targetOutput + Math.floor(Math.random() * 50); // 實際投入量 (包含不良品耗損)
        const defectRate = Math.random() * 0.05; // 0% - 5% 不良率
        const goodOutput = Math.floor(inputQty * (1 - defectRate)); // 良品數量

        // 實際消耗與實際工時變異
        const actsFactor = 1 + (Math.random() * 0.1 - 0.03); // 實際可能比標準高或低 (-3% to +7%)

        // 計算該批次 BOM 標準材料成本
        let stdMaterialCostPerUnit = 0;
        let actMaterialCostPerUnit = 0;

        product.bom.forEach(item => {
            const mat = materials.find(m => m.id === item.matId);
            stdMaterialCostPerUnit += (mat.unitCost * item.qty);
            // 實際物料成本會隨採購價格波動，這裡簡化計算
            actMaterialCostPerUnit += (mat.unitCost * actsFactor * item.qty);
        });

        // 單位標準與實際人工/製費
        const stdLaborCostPerUnit = product.stdLaborHrs * stdLaborRate;
        const stdOverheadCostPerUnit = product.stdMachHrs * stdOverheadRate;

        const actLaborHrs = product.stdLaborHrs * actsFactor * (1 + Math.random() * 0.05); // 可能加班或效率低
        const actMachHrs = product.stdMachHrs * actsFactor;

        const actLaborCostPerUnit = actLaborHrs * stdLaborRate * 1.05; // 實際可能包含加班費率
        const actOverheadCostPerUnit = actMachHrs * stdOverheadRate * 1.02;

        productionOrders.push({
            orderId: `PRD-2024-${String(i + 1).padStart(4, '0')}`,
            date: prodDate.toISOString().split('T')[0],
            month: monthStr,
            productId: product.id,
            productName: product.name,
            line: line,
            inputQty: inputQty,
            goodOutput: goodOutput,
            yieldRate: Number((goodOutput / inputQty).toFixed(4)),

            // 單位成本數據
            stdMaterialCost: Number(stdMaterialCostPerUnit.toFixed(2)),
            stdLaborCost: Number(stdLaborCostPerUnit.toFixed(2)),
            stdOverheadCost: Number(stdOverheadCostPerUnit.toFixed(2)),
            stdTotalCost: Number((stdMaterialCostPerUnit + stdLaborCostPerUnit + stdOverheadCostPerUnit).toFixed(2)),

            actMaterialCost: Number(actMaterialCostPerUnit.toFixed(2)),
            actLaborCost: Number(actLaborCostPerUnit.toFixed(2)),
            actOverheadCost: Number(actOverheadCostPerUnit.toFixed(2)),
            actTotalCost: Number((actMaterialCostPerUnit + actLaborCostPerUnit + actOverheadCostPerUnit).toFixed(2)),

            // 計算變異 (Variance = Actual - Standard. Positive is bad)
            materialVar: Number((actMaterialCostPerUnit - stdMaterialCostPerUnit).toFixed(2)),
            laborVar: Number((actLaborCostPerUnit - stdLaborCostPerUnit).toFixed(2)),
            overheadVar: Number((actOverheadCostPerUnit - stdOverheadCostPerUnit).toFixed(2))
        });
    }

    // 依日期排序
    productionOrders.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        materials: materials,
        suppliers: suppliers,
        purchaseOrders: purchaseOrders,
        productionOrders: productionOrders
    };
};

if (typeof window !== 'undefined') {
    window.sampleManufacturingData = generateSampleData();
} else {
    module.exports = { generateSampleData };
}
