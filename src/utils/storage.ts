// Storage utility for persisting trading data
export interface StoredData {
  trades: any[];
  technicalZones: any[];
  plannedEntries: any[];
  newsEvents: any[];
  economicEvents: any[];
  weeklyChecklist: any[];
  preTradeChecklist: any[];
  weeklyRiskBudget: number;
  weeklyRiskUsed: number;
  technicalAnalysisComplete: boolean;
  marketStructureComplete: boolean;
  weeklyPlanningComplete: boolean;
  lastSaved: string;
}

const STORAGE_KEY = 'trading_management_data';

export const saveData = (data: Partial<StoredData>): boolean => {
  try {
    const existingData = loadData();
    const updatedData = {
      ...existingData,
      ...data,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
};

export const loadData = (): StoredData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        trades: data.trades || [],
        technicalZones: data.technicalZones || [],
        plannedEntries: data.plannedEntries || [],
        newsEvents: data.newsEvents || [],
        economicEvents: data.economicEvents || [],
        weeklyChecklist: data.weeklyChecklist || [],
        preTradeChecklist: data.preTradeChecklist || [],
        weeklyRiskBudget: data.weeklyRiskBudget || 1000,
        weeklyRiskUsed: data.weeklyRiskUsed || 0,
        technicalAnalysisComplete: data.technicalAnalysisComplete || false,
        marketStructureComplete: data.marketStructureComplete || false,
        weeklyPlanningComplete: data.weeklyPlanningComplete || false,
        lastSaved: data.lastSaved || new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
  
  // Return default data if nothing is stored
  return {
    trades: [],
    technicalZones: [],
    plannedEntries: [],
    newsEvents: [],
    economicEvents: [],
    weeklyChecklist: [],
    preTradeChecklist: [],
    weeklyRiskBudget: 1000,
    weeklyRiskUsed: 0,
    technicalAnalysisComplete: false,
    marketStructureComplete: false,
    weeklyPlanningComplete: false,
    lastSaved: new Date().toISOString()
  };
};

export const clearData = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

export const exportData = (): string => {
  try {
    const data = loadData();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    return '';
  }
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    return saveData(data);
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}; 