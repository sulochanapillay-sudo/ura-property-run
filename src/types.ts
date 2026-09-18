/**
 * Singapore Private Property Data Types and API Contracts
 */

export type MarketSegment = 'CCR' | 'RCR' | 'OCR';

export type PropertyType =
  | 'Condominium'
  | 'Apartment'
  | 'Executive Condominium'
  | 'Terrace House'
  | 'Semi-Detached House'
  | 'Detached House'
  | 'Strata Landed';

export type TenureType = 'Freehold' | '99-year Leasehold' | '999-year Leasehold' | 'Other';

export type SaleType = 'New Sale' | 'Resale' | 'Sub Sale';

export interface SingaporeProperty {
  id: string;
  projectName: string;
  streetName: string;
  district: string; // e.g. "D09", "D10", "D15"
  districtName: string; // e.g. "Orchard / River Valley", "East Coast"
  marketSegment: MarketSegment; // CCR, RCR, OCR
  propertyType: PropertyType;
  price: number; // in SGD
  areaSqft: number;
  areaSqm: number;
  pricePsf: number; // SGD per sqft
  pricePsm: number; // SGD per sqm
  tenure: TenureType | string;
  contractDate: string; // YYYY-MM or YYYY-MM-DD
  saleType: SaleType;
  floorRange?: string; // e.g. "11 to 15", "01 to 05"
  numberOfBedrooms?: number;
  postalCode?: string;
}

export interface PropertyFilters {
  query: string;
  district: string;
  marketSegment: string;
  propertyType: string;
  tenure: string;
  saleType: string;
  minPrice: number | null;
  maxPrice: number | null;
  minPsf: number | null;
  maxPsf: number | null;
  sortBy: 'price' | 'pricePsf' | 'contractDate' | 'areaSqft';
  sortOrder: 'asc' | 'desc';
}

export interface DistrictInfo {
  code: string; // "D01" through "D28"
  name: string;
  region: MarketSegment;
  postalSectors: string[];
}

export interface PropertyStatistics {
  totalTransactions: number;
  medianPrice: number;
  averagePrice: number;
  medianPsf: number;
  averagePsf: number;
  highestPsf: number;
  lowestPsf: number;
  byRegion: {
    CCR: number;
    RCR: number;
    OCR: number;
  };
  byPropertyType: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  status: 'connected' | 'awaiting_backend_data' | 'error';
  message: string;
  total: number;
  timestamp: string;
  data: T;
}

export interface ApiConfig {
  endpointUrl: string;
  backendConnected: boolean;
  status: 'idle' | 'awaiting_data' | 'connected' | 'error';
  lastPingTime: string | null;
  errorMessage: string | null;
  recordsReceived: number;
}
