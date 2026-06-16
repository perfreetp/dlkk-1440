const STORAGE_KEY = 'water_damage_repair_data';

export interface StoredData {
  version: string;
  lastUpdated: string;
  data: any;
}

export function saveToStorage(key: string, data: any): void {
  try {
    const storedData: StoredData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      data
    };
    localStorage.setItem(key, JSON.stringify(storedData));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed: StoredData = JSON.parse(stored);
    return parsed.data as T;
  } catch (error) {
    console.error('从本地存储加载失败:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('删除本地存储失败:', error);
  }
}

export function clearAllStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('清空本地存储失败:', error);
  }
}
