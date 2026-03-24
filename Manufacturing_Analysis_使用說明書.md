# 製造業庫存與成本分析儀表板 - 使用說明書

## 快速啟動 (Quick Start)
1. 無需安裝任何伺服器或依賴環境。
2. 直接點擊兩下 `Manufacturing_Dashboard.html` 在任何現代瀏覽器 (Chrome, Edge, Safari 皆可) 中開啟。
3. 頁面加載時將自動帶入超過 100 筆的「預設模擬資料」，您可直接點擊左側 10 個不同的分析頁籤來體驗所有圖表功能。

## 介面導覽
- **左側導覽列 (Sidebar)**：根據領域切分為「首頁總覽」、「庫存分析」、「供應商分析」與「成本分析」四大群組，共 10 個核心頁面。
- **頂部控制列 (Topbar)**：顯示目前所在頁面標題，並提供「載入範例資料」、「匯出 JSON」以及「上傳 Excel/CSV」三大按鈕功能。
- **KPI 指標卡與圖表區 (Main Content)**：顯示各頁面的核心營運指標與圖表互動元件 (可將鼠標懸停於各個圖表長條/折線上方查看數據詳情)。

## 自訂資料上傳 (Data Import)
本儀表板使用 SheetJS 作為解析中心，支援透過 Excel (xlsx, xls) 檔案來分析您自己的資料。

### 預期檔案格式
您的 Excel 檔案可以包含多個特定的工作表名稱 (Sheet Name)。如果您尚未提供該表標籤，系統將保留原始測試資料：
- **Sheet `Materials`**: (對應庫存資料)
  - 建議欄位：`id`, `name`, `unitCost`, `stockQty`, `abcClass`, `daysInStock`, `type`, `monthlyUsage`
- **Sheet `Suppliers`**: (對應供應商資料)
  - 建議欄位：`name`, `category`, `rating`, `onTimeDeliveryRate`
- **Sheet `PurchaseOrders`**: (對應採購訂單) 
  - 建議欄位：`supplierName`, `totalAmount`, `delayDays`, `qty`
- **Sheet `ProductionOrders`**: (對應生產成本)
  - 建議欄位：`orderId`, `productName`, `line`, `goodOutput`, `yieldRate`, `inputQty`, `stdMaterialCost`, `actMaterialCost`, `materialVar`, `laborVar`, `overheadVar`, `actTotalCost`

*💡 小提示：您可以先點擊頁面頂部的「📥匯出 JSON (向下的箭頭圖標)」按鈕觀察預設資料的結構邏輯，並直接參照該結構來配置與準備您的試算表欄位，將能達到最完美的分析呈現。*
