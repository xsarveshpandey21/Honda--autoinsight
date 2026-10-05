export interface RawCarRecord {
  [key: string]: string | number | null | undefined;
}

export type CarCondition = 'New' | 'Used' | 'Certified';

export interface CleanedCarRecord {
  id: string;
  year: number;
  make: string;
  model: string;          // Full raw model name (e.g. "Civic LX", "CR-V Hybrid Sport")
  baseModel: string;      // Standardized base model (e.g. "Civic", "CR-V")
  condition: CarCondition;
  price: number | null;
  consumerRating: number | null;
  consumerReviewCount: number | null;
  exteriorColor: string;
  interiorColor: string;
  drivetrain: string;
  mpg: string;
  mpgCity: number | null;
  mpgHighway: number | null;
  mpgAvg: number | null;
  fuelType: string;
  transmission: string;
  engine: string;
  vin: string;
  stockNo: string;
  mileage: number | null;
  comfortRating: number | null;
  interiorDesignRating: number | null;
  performanceRating: number | null;
  valueForMoneyRating: number | null;
  exteriorStylingRating: number | null;
  reliabilityRating: number | null;
  state: string;
  sellerType: string;
  saleDate?: string | null; // ISO YYYY-MM-DD if detected
  saleMonth?: string | null; // YYYY-MM if detected
  valueScore: number | null;
}

export interface DataQualityReport {
  totalLoadedRows: number;
  duplicateVinsRemoved: number;
  missingPriceCount: number;
  missingRatingCount: number;
  dateColumnDetected: boolean;
  dateColumnName: string | null;
  validRowsCount: number;
}

export interface FilterState {
  years: [number, number];       // [minYear, maxYear]
  selectedModels: string[];
  selectedConditions: CarCondition[];
  selectedFuelTypes: string[];
  selectedDrivetrains: string[];
  selectedStates: string[];
  priceRange: [number, number];  // [minPrice, maxPrice]
  mileageRange: [number, number];// [minMileage, maxMileage]
  minConsumerRating: number;
  searchQuery: string;
}

export type PageTab = 
  | 'overview' 
  | 'trends' 
  | 'models' 
  | 'ratings' 
  | 'catalogue' 
  | 'compare' 
  | 'executive';

export interface ModelSummary {
  baseModel: string;
  totalListings: number;
  inventoryValue: number;
  avgPrice: number;
  avgMileage: number;
  avgRating: number;
  avgValueScore: number;
  minPrice: number;
  maxPrice: number;
  topCondition: string;
}

export interface RatingCategoryAvg {
  category: string;
  score: number;
  fullMark: number;
}
