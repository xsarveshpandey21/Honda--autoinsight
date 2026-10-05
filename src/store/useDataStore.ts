import { create } from 'zustand';
import Papa from 'papaparse';
import { get, set } from 'idb-keyval';
import type { CleanedCarRecord, DataQualityReport, FilterState, PageTab, RawCarRecord } from '../types';
import { cleanDataset } from '../utils/clean';

const STORAGE_KEY = 'honda_autoinsight_dataset_v1';

export const INITIAL_FILTERS: FilterState = {
  years: [2000, 2026],
  selectedModels: [],
  selectedConditions: [],
  selectedFuelTypes: [],
  selectedDrivetrains: [],
  selectedStates: [],
  priceRange: [0, 200000],
  mileageRange: [0, 300000],
  minConsumerRating: 0,
  searchQuery: ''
};

interface DataState {
  rawDataset: RawCarRecord[];
  cleanedDataset: CleanedCarRecord[];
  filteredDataset: CleanedCarRecord[];
  qualityReport: DataQualityReport | null;
  activeTab: PageTab;
  filters: FilterState;
  selectedCarForModal: CleanedCarRecord | null;
  compareCarIds: string[];
  isLoading: boolean;
  error: string | null;
  hasSimulatedDate: boolean;
  datasetName: string;
  currencyMode: 'INR' | 'USD';

  // Actions
  initializeStore: () => Promise<void>;
  loadCSVFile: (file: File) => Promise<void>;
  loadCSVText: (csvText: string, fileName?: string) => void;
  loadSampleData: () => Promise<void>;
  setFilters: (partialFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setActiveTab: (tab: PageTab) => void;
  setSelectedCarForModal: (car: CleanedCarRecord | null) => void;
  toggleCompareCar: (carId: string) => void;
  clearCompare: () => void;
  toggleSimulateDateColumn: () => void;
  setCurrencyMode: (mode: 'INR' | 'USD') => void;
}

export const useDataStore = create<DataState>((setStore, getStore) => ({
  rawDataset: [],
  cleanedDataset: [],
  filteredDataset: [],
  qualityReport: null,
  activeTab: 'overview',
  filters: INITIAL_FILTERS,
  selectedCarForModal: null,
  compareCarIds: [],
  isLoading: true,
  error: null,
  hasSimulatedDate: false,
  datasetName: 'Sample Honda Dataset',
  currencyMode: 'INR',

  initializeStore: async () => {
    setStore({ isLoading: true, error: null });
    try {
      const persisted = await get<{ csvText: string; fileName: string }>(STORAGE_KEY);
      if (persisted && persisted.csvText) {
        getStore().loadCSVText(persisted.csvText, persisted.fileName);
      } else {
        await getStore().loadSampleData();
      }
    } catch (err) {
      console.warn('Could not load IndexedDB dataset, loading sample data instead:', err);
      await getStore().loadSampleData();
    } finally {
      setStore({ isLoading: false });
    }
  },

  loadCSVFile: async (file: File) => {
    setStore({ isLoading: true, error: null });
    return new Promise((resolve) => {
      Papa.parse<RawCarRecord>(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          if (results.errors && results.errors.length > 0 && results.data.length === 0) {
            setStore({ isLoading: false, error: `CSV Parsing error: ${results.errors[0].message}` });
            resolve();
            return;
          }

          const headers = results.meta.fields || [];
          const { data, report } = cleanDataset(results.data, headers);

          // Save to IndexedDB
          const reader = new FileReader();
          reader.onload = (e) => {
            const csvText = e.target?.result as string;
            if (csvText) {
              set(STORAGE_KEY, { csvText, fileName: file.name }).catch(console.error);
            }
          };
          reader.readAsText(file);

          const minYear = data.reduce((acc, curr) => Math.min(acc, curr.year), 2026);
          const maxYear = data.reduce((acc, curr) => Math.max(acc, curr.year), 2000);
          const maxPrice = data.reduce((acc, curr) => Math.max(acc, curr.price || 0), 100000);
          const maxMileage = data.reduce((acc, curr) => Math.max(acc, curr.mileage || 0), 200000);

          const updatedFilters: FilterState = {
            ...INITIAL_FILTERS,
            years: [minYear, maxYear],
            priceRange: [0, Math.ceil(maxPrice / 5000) * 5000],
            mileageRange: [0, Math.ceil(maxMileage / 10000) * 10000]
          };

          setStore({
            rawDataset: results.data,
            cleanedDataset: data,
            filteredDataset: applyFilters(data, updatedFilters),
            qualityReport: report,
            filters: updatedFilters,
            datasetName: file.name,
            isLoading: false,
            error: null,
            hasSimulatedDate: false
          });
          resolve();
        },
        error: (err) => {
          setStore({ isLoading: false, error: err.message });
          resolve();
        }
      });
    });
  },

  loadCSVText: (csvText: string, fileName = 'Uploaded Dataset') => {
    Papa.parse<RawCarRecord>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const { data, report } = cleanDataset(results.data, headers);

        const minYear = data.reduce((acc, curr) => Math.min(acc, curr.year), 2026);
        const maxYear = data.reduce((acc, curr) => Math.max(acc, curr.year), 2000);
        const maxPrice = data.reduce((acc, curr) => Math.max(acc, curr.price || 0), 100000);
        const maxMileage = data.reduce((acc, curr) => Math.max(acc, curr.mileage || 0), 200000);

        const updatedFilters: FilterState = {
          ...INITIAL_FILTERS,
          years: [minYear, maxYear],
          priceRange: [0, Math.ceil(maxPrice / 5000) * 5000],
          mileageRange: [0, Math.ceil(maxMileage / 10000) * 10000]
        };

        setStore({
          rawDataset: results.data,
          cleanedDataset: data,
          filteredDataset: applyFilters(data, updatedFilters),
          qualityReport: report,
          filters: updatedFilters,
          datasetName: fileName,
          isLoading: false,
          error: null,
          hasSimulatedDate: false
        });
      }
    });
  },

  loadSampleData: async () => {
    try {
      const response = await fetch('/sample_honda.csv');
      if (!response.ok) throw new Error('Sample CSV file not found');
      const csvText = await response.text();
      getStore().loadCSVText(csvText, 'Sample Honda Dataset (5,000 listings)');
    } catch (err: any) {
      setStore({ isLoading: false, error: `Failed to load sample dataset: ${err.message}` });
    }
  },

  setFilters: (partialFilters) => {
    const currentFilters = getStore().filters;
    const newFilters = { ...currentFilters, ...partialFilters };
    const cleanedDataset = getStore().cleanedDataset;
    setStore({
      filters: newFilters,
      filteredDataset: applyFilters(cleanedDataset, newFilters)
    });
  },

  resetFilters: () => {
    const cleanedDataset = getStore().cleanedDataset;
    const minYear = cleanedDataset.reduce((acc, curr) => Math.min(acc, curr.year), 2000);
    const maxYear = cleanedDataset.reduce((acc, curr) => Math.max(acc, curr.year), 2026);
    const maxPrice = cleanedDataset.reduce((acc, curr) => Math.max(acc, curr.price || 0), 100000);
    const maxMileage = cleanedDataset.reduce((acc, curr) => Math.max(acc, curr.mileage || 0), 200000);

    const defaultFilters: FilterState = {
      ...INITIAL_FILTERS,
      years: [minYear, maxYear],
      priceRange: [0, Math.ceil(maxPrice / 5000) * 5000],
      mileageRange: [0, Math.ceil(maxMileage / 10000) * 10000]
    };

    setStore({
      filters: defaultFilters,
      filteredDataset: applyFilters(cleanedDataset, defaultFilters)
    });
  },

  setActiveTab: (tab) => setStore({ activeTab: tab }),

  setSelectedCarForModal: (car) => setStore({ selectedCarForModal: car }),

  toggleCompareCar: (carId) => {
    const current = getStore().compareCarIds;
    if (current.includes(carId)) {
      setStore({ compareCarIds: current.filter(id => id !== carId) });
    } else {
      if (current.length >= 4) {
        alert('You can compare a maximum of 4 vehicles at a time.');
        return;
      }
      setStore({ compareCarIds: [...current, carId] });
    }
  },

  clearCompare: () => setStore({ compareCarIds: [] }),

  toggleSimulateDateColumn: () => {
    const { cleanedDataset, hasSimulatedDate, qualityReport, filters } = getStore();
    const newSimState = !hasSimulatedDate;

    // Distribute records across months of 2024-2025
    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02'];

    const updated = cleanedDataset.map((car, idx) => {
      if (!newSimState) {
        return { ...car, saleDate: null, saleMonth: null };
      }
      const monthStr = months[idx % months.length];
      const day = (idx % 28) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      return {
        ...car,
        saleDate: `${monthStr}-${dayStr}`,
        saleMonth: monthStr
      };
    });

    const updatedReport = qualityReport ? {
      ...qualityReport,
      dateColumnDetected: newSimState,
      dateColumnName: newSimState ? 'Sale_Date (Simulated)' : null
    } : null;

    setStore({
      cleanedDataset: updated,
      filteredDataset: applyFilters(updated, filters),
      qualityReport: updatedReport,
      hasSimulatedDate: newSimState
    });
  },

  setCurrencyMode: (mode) => setStore({ currencyMode: mode })
}));

function applyFilters(data: CleanedCarRecord[], filters: FilterState): CleanedCarRecord[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return data.filter(item => {
    // Year filter
    if (item.year < filters.years[0] || item.year > filters.years[1]) return false;

    // Price filter
    if (item.price !== null) {
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) return false;
    }

    // Mileage filter
    if (item.mileage !== null) {
      if (item.mileage < filters.mileageRange[0] || item.mileage > filters.mileageRange[1]) return false;
    }

    // Rating filter
    if (filters.minConsumerRating > 0) {
      if (!item.consumerRating || item.consumerRating < filters.minConsumerRating) return false;
    }

    // Model filter
    if (filters.selectedModels.length > 0) {
      if (!filters.selectedModels.includes(item.baseModel)) return false;
    }

    // Condition filter
    if (filters.selectedConditions.length > 0) {
      if (!filters.selectedConditions.includes(item.condition)) return false;
    }

    // Fuel type filter
    if (filters.selectedFuelTypes.length > 0) {
      if (!filters.selectedFuelTypes.includes(item.fuelType)) return false;
    }

    // Drivetrain filter
    if (filters.selectedDrivetrains.length > 0) {
      if (!filters.selectedDrivetrains.includes(item.drivetrain)) return false;
    }

    // State filter
    if (filters.selectedStates.length > 0) {
      if (!filters.selectedStates.includes(item.state)) return false;
    }

    // Text search query
    if (query) {
      const targetStr = `${item.year} ${item.make} ${item.model} ${item.vin} ${item.state} ${item.engine || ''} ${item.sellerType}`.toLowerCase();
      if (!targetStr.includes(query)) return false;
    }

    return true;
  });
}
