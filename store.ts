
import { Officer, Platoon, Garrison } from './types';

const STORAGE_KEY = 'SGEP_DATA_V1';

interface StorageData {
  officers: Officer[];
  platoons: Platoon[];
  garrisons: Garrison[];
}

const defaultData: StorageData = {
  officers: [],
  platoons: [],
  garrisons: []
};

export const loadData = (): StorageData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultData;
};

export const saveData = (data: StorageData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};