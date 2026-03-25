/**
 * exportUtils.ts — PDF / Excel 報告導出工具
 *
 * - PDF：使用 jsPDF + 黑體（SimHei）中文字型
 * - Excel：使用 SheetJS，每個報告模組各佔一個工作表
 *
 * 中文字型採「按需載入」策略：首次生成 PDF 時從 /fonts/simhei.ttf 載入，
 * 後續生成使用記憶體快取，不影響首頁載入速度。
 */
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { ReportSection } from '../data/reportData';

// ── PDF 常數 ─────────────────────────────────────────

const PDF_MARGIN = 20;
const PDF_WIDTH = 210; // A4 mm
const PDF_HEIGHT = 297;
const CONTENT_WIDTH = PDF_WIDTH - PDF_MARGIN * 2;
const LINE_HEIGHT = 6;
const HEADER_BG: [number, number, number] = [59, 130, 246]; // #3b82f6

// 中文字型名稱（註冊到 jsPDF 的識別名）
const CN_FONT = 'SimHei';

// ── 字型載入 ─────────────────────────────────────────

let fontCache: string | null = null;

/**
 * 載入中文字型（TTF → base64），首次載入後快取於記憶體。
 * 字型檔放在 public/fonts/ 目錄，由 Vite 靜態伺服。
 */
async function loadChineseFont(): Promise<string> {
  if (fontCache) return fontCache;

  const res = await fetch('/fonts/simhei.ttf');
  if (!res.ok) throw new Error('無法載入中文字型 simhei.ttf');

  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // 分段轉 base64（避免大陣列 stack overflow）
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  fontCache = btoa(binary);
  return fontCache;
}

/** 在 jsPDF 實例上註冊中文字型（normal + bold 共用同一 TTF） */
function registerFont(doc: jsPDF, fontBase64: string) {
  doc.addFileToVFS('simhei.ttf', fontBase64);
  doc.addFont('simhei.ttf', CN_FONT, 'normal');
  doc.addFont('simhei.ttf', CN_FONT, 'bold');
}

/** 設定中文字型（normal 或模擬 bold） */
function setCNFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal', size = 10) {
  doc.setFont(CN_FONT, style);
  doc.setFontSize(size);
}

// ── PDF 輔助函式 ─────────────────────────────────────

/** 繪製頁首 */
function drawPageHeader(doc: jsPDF, title: string, dateRange: string) {
  // 藍色橫條
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, PDF_WIDTH, 28, 'F');

  // 標題
  setCNFont(doc, 'bold', 16);
  doc.setTextColor(255, 255, 255);
  doc.text(title, PDF_MARGIN, 14);

  // 日期
  setCNFont(doc, 'normal', 9);
  doc.text(dateRange, PDF_WIDTH - PDF_MARGIN, 14, { align: 'right' });

  // 副標
  setCNFont(doc, 'normal', 8);
  doc.setTextColor(200, 220, 255);
  doc.text('Manufacturing Dashboard V4 — 製造業分析儀表板', PDF_MARGIN, 22);
}

/** 繪製頁尾（頁碼） */
function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  setCNFont(doc, 'normal', 8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `第 ${pageNum} 頁 / 共 ${totalPages} 頁`,
    PDF_WIDTH / 2,
    PDF_HEIGHT - 10,
    { align: 'center' },
  );
  doc.text(
    `生成時間：${new Date().toLocaleString('zh-TW')}`,
    PDF_WIDTH - PDF_MARGIN,
    PDF_HEIGHT - 10,
    { align: 'right' },
  );
}

/** 若超過頁面底部就換頁，回傳新 y 座標 */
function ensureSpace(doc: jsPDF, y: number, needed: number, title: string, dateRange: string): number {
  if (y + needed > PDF_HEIGHT - 20) {
    doc.addPage();
    drawPageHeader(doc, title, dateRange);
    return 36;
  }
  return y;
}

/** 繪製 KPI 卡片列 */
function drawKpis(doc: jsPDF, kpis: ReportSection['kpis'], y: number): number {
  const cardW = (CONTENT_WIDTH - 6) / 2; // 每列 2 張卡片
  const cardH = 18;

  for (let i = 0; i < kpis.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PDF_MARGIN + col * (cardW + 6);
    const cy = y + row * (cardH + 4);

    // 卡片背景
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, cy, cardW, cardH, 2, 2, 'F');

    // 標籤
    setCNFont(doc, 'normal', 8);
    doc.setTextColor(120, 120, 120);
    doc.text(kpis[i].label, x + 4, cy + 6);

    // 數值
    setCNFont(doc, 'bold', 14);
    doc.setTextColor(30, 41, 59);
    doc.text(`${kpis[i].value}${kpis[i].unit}`, x + 4, cy + 14);

    // 趨勢
    if (kpis[i].trend !== undefined) {
      const trend = kpis[i].trend!;
      setCNFont(doc, 'normal', 8);
      doc.setTextColor(
        trend > 0 ? 16 : trend < 0 ? 239 : 150,
        trend > 0 ? 185 : trend < 0 ? 68 : 150,
        trend > 0 ? 129 : trend < 0 ? 68 : 150,
      );
      const arrow = trend > 0 ? '+' : '';
      doc.text(`${arrow}${trend}% ${kpis[i].trendLabel || ''}`, x + cardW - 4, cy + 14, { align: 'right' });
    }
  }

  const totalRows = Math.ceil(kpis.length / 2);
  return y + totalRows * (cardH + 4) + 4;
}

/** 繪製資料表格 */
function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: Record<string, string | number>[],
  y: number,
  title: string,
  dateRange: string,
): number {
  const colW = CONTENT_WIDTH / headers.length;
  const rowH = LINE_HEIGHT + 2;

  // 表頭背景
  y = ensureSpace(doc, y, rowH * 2, title, dateRange);
  doc.setFillColor(59, 130, 246);
  doc.rect(PDF_MARGIN, y, CONTENT_WIDTH, rowH, 'F');
  setCNFont(doc, 'bold', 7);
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => {
    doc.text(h, PDF_MARGIN + i * colW + 2, y + 5);
  });
  y += rowH;

  // 資料列
  setCNFont(doc, 'normal', 7);
  rows.forEach((row, ri) => {
    y = ensureSpace(doc, y, rowH, title, dateRange);

    // 斑馬紋
    if (ri % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(PDF_MARGIN, y, CONTENT_WIDTH, rowH, 'F');
    }

    doc.setTextColor(50, 50, 50);
    setCNFont(doc, 'normal', 7);
    headers.forEach((h, ci) => {
      const val = String(row[h] ?? '');
      doc.text(val, PDF_MARGIN + ci * colW + 2, y + 5);
    });
    y += rowH;
  });

  return y + 4;
}

// ── 公開 API ─────────────────────────────────────────

/** 生成 PDF 報告（非同步，需等待字型載入） */
export async function generatePDF(
  sections: ReportSection[],
  dateRange: { start: string; end: string },
): Promise<Blob> {
  // 載入中文字型
  const fontBase64 = await loadChineseFont();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  registerFont(doc, fontBase64);

  const rangeStr = `${dateRange.start} ~ ${dateRange.end}`;

  // ── 封面 ──
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, PDF_WIDTH, PDF_HEIGHT, 'F');

  setCNFont(doc, 'bold', 32);
  doc.setTextColor(255, 255, 255);
  doc.text('製造業分析', PDF_WIDTH / 2, 100, { align: 'center' });
  doc.text('儀表板報告', PDF_WIDTH / 2, 120, { align: 'center' });

  setCNFont(doc, 'normal', 14);
  doc.setTextColor(200, 220, 255);
  doc.text(`報告期間：${rangeStr}`, PDF_WIDTH / 2, 145, { align: 'center' });

  setCNFont(doc, 'normal', 10);
  doc.text(`包含 ${sections.length} 個分析模組`, PDF_WIDTH / 2, 160, { align: 'center' });
  doc.text(`生成時間：${new Date().toLocaleString('zh-TW')}`, PDF_WIDTH / 2, 173, { align: 'center' });

  // ── 各模組 ──
  sections.forEach((section) => {
    doc.addPage();
    drawPageHeader(doc, section.title, rangeStr);

    let y = 36;

    // KPI 區塊
    if (section.kpis.length > 0) {
      setCNFont(doc, 'bold', 11);
      doc.setTextColor(30, 41, 59);
      doc.text('關鍵績效指標 (KPI)', PDF_MARGIN, y);
      y += 6;
      y = drawKpis(doc, section.kpis, y);
    }

    // 表格區塊
    section.tables.forEach((table) => {
      y = ensureSpace(doc, y, 20, section.title, rangeStr);
      setCNFont(doc, 'bold', 10);
      doc.setTextColor(30, 41, 59);
      doc.text(table.name, PDF_MARGIN, y);
      y += 6;
      y = drawTable(doc, table.headers, table.rows, y, section.title, rangeStr);
    });
  });

  // ── 補頁碼 ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, i - 1, totalPages - 1);
  }

  return doc.output('blob');
}

/** 生成 Excel 報告 */
export function generateExcel(
  sections: ReportSection[],
  dateRange: { start: string; end: string },
): Blob {
  const wb = XLSX.utils.book_new();

  sections.forEach((section) => {
    const sheetData: (string | number)[][] = [];

    // 標題列
    sheetData.push([section.title]);
    sheetData.push([`報告期間：${dateRange.start} ~ ${dateRange.end}`]);
    sheetData.push([]);

    // KPI
    sheetData.push(['=== 關鍵績效指標 ===']);
    section.kpis.forEach((kpi) => {
      const trendStr = kpi.trend !== undefined ? ` (${kpi.trend > 0 ? '+' : ''}${kpi.trend}% ${kpi.trendLabel || ''})` : '';
      sheetData.push([kpi.label, `${kpi.value}${kpi.unit}${trendStr}`]);
    });
    sheetData.push([]);

    // 各表格
    section.tables.forEach((table) => {
      sheetData.push([`=== ${table.name} ===`]);
      sheetData.push(table.headers);
      table.rows.forEach((row) => {
        sheetData.push(table.headers.map((h) => row[h] ?? ''));
      });
      sheetData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = Array.from({ length: 10 }, () => ({ wch: 18 }));

    const sheetName = section.title.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/** 觸發瀏覽器下載 */
export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}
