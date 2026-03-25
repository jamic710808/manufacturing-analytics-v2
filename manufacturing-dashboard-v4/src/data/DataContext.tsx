/**
 * DataContext.tsx — 全局資料 Context + localStorage 持久化
 *
 * 各頁面透過 useData() 取得資料，不再使用硬編碼。
 * 使用者匯入 Excel 後，updateModule() 更新對應模組資料。
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { defaultData, type AllModuleData, type ModuleId } from './defaultData';

const STORAGE_KEY = 'mfg-dashboard-data';
const TIMESTAMP_KEY = 'mfg-dashboard-timestamps';

interface DataContextType {
  data: AllModuleData;
  updateModule: <K extends ModuleId>(moduleId: K, moduleData: AllModuleData[K]) => void;
  resetModule: (moduleId: ModuleId) => void;
  resetAll: () => void;
  isCustomData: (moduleId: ModuleId) => boolean;
  lastUpdated: Record<ModuleId, string | null>;
}

const DataContext = createContext<DataContextType | null>(null);

/** 從 localStorage 載入已儲存的資料 */
function loadFromStorage(): { data: AllModuleData; timestamps: Record<ModuleId, string | null> } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const timestamps = localStorage.getItem(TIMESTAMP_KEY);
    const parsedData = stored ? JSON.parse(stored) : null;
    const parsedTimestamps = timestamps ? JSON.parse(timestamps) : null;

    // 合併預設資料（確保新增模組不會遺失）
    const merged = parsedData
      ? { ...defaultData, ...parsedData }
      : { ...defaultData };

    const defaultTimestamps: Record<ModuleId, string | null> = {
      overview: null, inventory: null, procurement: null,
      supplier: null, cost: null, production: null,
    };

    return {
      data: merged,
      timestamps: parsedTimestamps ? { ...defaultTimestamps, ...parsedTimestamps } : defaultTimestamps,
    };
  } catch {
    return {
      data: { ...defaultData },
      timestamps: { overview: null, inventory: null, procurement: null, supplier: null, cost: null, production: null },
    };
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(() => loadFromStorage());

  // 每次資料變更時同步至 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
      localStorage.setItem(TIMESTAMP_KEY, JSON.stringify(state.timestamps));
    } catch {
      // localStorage 滿或不可用，靜默忽略
    }
  }, [state]);

  const updateModule = useCallback(<K extends ModuleId>(moduleId: K, moduleData: AllModuleData[K]) => {
    setState(prev => ({
      data: { ...prev.data, [moduleId]: moduleData },
      timestamps: { ...prev.timestamps, [moduleId]: new Date().toLocaleString('zh-TW') },
    }));
  }, []);

  const resetModule = useCallback((moduleId: ModuleId) => {
    setState(prev => ({
      data: { ...prev.data, [moduleId]: defaultData[moduleId] },
      timestamps: { ...prev.timestamps, [moduleId]: null },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState({
      data: { ...defaultData },
      timestamps: { overview: null, inventory: null, procurement: null, supplier: null, cost: null, production: null },
    });
  }, []);

  const isCustomData = useCallback((moduleId: ModuleId) => {
    return state.timestamps[moduleId] !== null;
  }, [state.timestamps]);

  return (
    <DataContext.Provider value={{
      data: state.data,
      updateModule,
      resetModule,
      resetAll,
      isCustomData,
      lastUpdated: state.timestamps,
    }}>
      {children}
    </DataContext.Provider>
  );
};

/** 取得全局資料的 Hook */
export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData 必須在 DataProvider 內使用');
  return ctx;
}
