import {
  SingaporeProperty,
  PropertyFilters,
  PropertyStatistics,
  ApiResponse,
  ApiConfig,
} from '../types';

// Default to relative API route handled by our Express server or user's proxy
let customBaseUrl = '';

export function setCustomBaseUrl(url: string) {
  customBaseUrl = url.trim().replace(/\/+$/, '');
}

export function getBaseUrl(): string {
  return customBaseUrl || '';
}

/**
 * Fetch property transaction records with filters
 */
export async function fetchProperties(
  filters?: Partial<PropertyFilters>
): Promise<ApiResponse<SingaporeProperty[]>> {
  try {
    const params = new URLSearchParams();
    if (filters?.query) params.append('query', filters.query);
    if (filters?.district) params.append('district', filters.district);
    if (filters?.marketSegment) params.append('marketSegment', filters.marketSegment);
    if (filters?.propertyType) params.append('propertyType', filters.propertyType);
    if (filters?.tenure) params.append('tenure', filters.tenure);
    if (filters?.saleType) params.append('saleType', filters.saleType);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minPsf) params.append('minPsf', filters.minPsf.toString());
    if (filters?.maxPsf) params.append('maxPsf', filters.maxPsf.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `${getBaseUrl()}/api/properties${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (err: any) {
    // Return structured placeholder response if network fails or backend is not yet populated
    return {
      success: false,
      status: 'awaiting_backend_data',
      message: err.message || 'Awaiting backend connection.',
      total: 0,
      timestamp: new Date().toISOString(),
      data: [],
    };
  }
}

/**
 * Fetch calculated statistical metrics for private properties
 */
export async function fetchPropertyStats(
  filters?: Partial<PropertyFilters>
): Promise<ApiResponse<PropertyStatistics>> {
  try {
    const params = new URLSearchParams();
    if (filters?.district) params.append('district', filters.district);
    if (filters?.marketSegment) params.append('marketSegment', filters.marketSegment);
    if (filters?.propertyType) params.append('propertyType', filters.propertyType);

    const url = `${getBaseUrl()}/api/properties/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Stats endpoint error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err: any) {
    return {
      success: false,
      status: 'awaiting_backend_data',
      message: err.message || 'Awaiting backend connection.',
      total: 0,
      timestamp: new Date().toISOString(),
      data: {
        totalTransactions: 0,
        medianPrice: 0,
        averagePrice: 0,
        medianPsf: 0,
        averagePsf: 0,
        highestPsf: 0,
        lowestPsf: 0,
        byRegion: { CCR: 0, RCR: 0, OCR: 0 },
        byPropertyType: {},
      },
    };
  }
}

/**
 * Test ping connection to the backend server
 */
export async function pingBackend(): Promise<{
  connected: boolean;
  status: 'connected' | 'awaiting_data' | 'error';
  message: string;
  count: number;
  timestamp: string;
}> {
  try {
    const url = `${getBaseUrl()}/api/properties`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        status: data.total > 0 ? 'connected' : 'awaiting_data',
        message: data.message || 'API endpoint reachable.',
        count: data.total || 0,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        connected: false,
        status: 'error',
        message: `HTTP ${res.status}: ${res.statusText}`,
        count: 0,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      status: 'error',
      message: err.message || 'Failed to reach API endpoint.',
      count: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Post single or batch property data to backend
 */
export async function ingestProperties(
  properties: SingaporeProperty[]
): Promise<ApiResponse<{ inserted: number }>> {
  const url = `${getBaseUrl()}/api/properties`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  });

  if (!res.ok) {
    throw new Error(`Ingest failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Clear backend data (reset placeholder state)
 */
export async function resetBackendData(): Promise<ApiResponse<{ cleared: boolean }>> {
  const url = `${getBaseUrl()}/api/properties/reset`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return await res.json();
}

/**
 * Sample verification payload conforming to Singapore URA/Realis standard
 * Provided purely for optional developer schema testing before live database connection.
 */
export const SAMPLE_VERIFICATION_PAYLOAD: SingaporeProperty[] = [
  {
    id: 'sg-demo-01',
    projectName: 'The Sail @ Marina Bay',
    streetName: 'Marina Boulevard',
    district: 'D01',
    districtName: 'Raffles Place, Cecil, Marina',
    marketSegment: 'CCR',
    propertyType: 'Condominium',
    price: 2450000,
    areaSqft: 1033,
    areaSqm: 96,
    pricePsf: 2372,
    pricePsm: 25520,
    tenure: '99-year Leasehold',
    contractDate: '2025-01-15',
    saleType: 'Resale',
    floorRange: '31 to 35',
    numberOfBedrooms: 2,
    postalCode: '018987',
  },
  {
    id: 'sg-demo-02',
    projectName: 'D\'Leedon',
    streetName: 'Leedon Heights',
    district: 'D10',
    districtName: 'Ardmore, Bukit Timah, Holland Road, Tanglin',
    marketSegment: 'CCR',
    propertyType: 'Condominium',
    price: 3100000,
    areaSqft: 1453,
    areaSqm: 135,
    pricePsf: 2133,
    pricePsm: 22962,
    tenure: '99-year Leasehold',
    contractDate: '2025-01-18',
    saleType: 'Resale',
    floorRange: '16 to 20',
    numberOfBedrooms: 3,
    postalCode: '267953',
  },
  {
    id: 'sg-demo-03',
    projectName: 'Amber Park',
    streetName: 'Amber Gardens',
    district: 'D15',
    districtName: 'Katong, Joo Chiat, Amber Road, Marine Parade',
    marketSegment: 'RCR',
    propertyType: 'Condominium',
    price: 2850000,
    areaSqft: 1109,
    areaSqm: 103,
    pricePsf: 2570,
    pricePsm: 27670,
    tenure: 'Freehold',
    contractDate: '2025-02-02',
    saleType: 'New Sale',
    floorRange: '11 to 15',
    numberOfBedrooms: 3,
    postalCode: '439977',
  },
];
