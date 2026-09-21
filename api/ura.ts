/**
 * Singapore Urban Redevelopment Authority (URA) DataService Client
 * Serverless connection for URA Private Residential Property Transactions (PMI_Resi_Transaction)
 *
 * Flow:
 * 1. Daily Token Exchange:
 *    GET https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 *    Header: AccessKey: <URA_ACCESS_KEY>
 *
 * 2. Data Retrieval:
 *    GET https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=<batch>
 *    Headers:
 *      AccessKey: <URA_ACCESS_KEY>
 *      Token: <URA_DAILY_TOKEN>
 */

export const URA_ENDPOINTS = {
  TOKEN: 'https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1',
  DATA: 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1',
} as const;

export interface UraTokenResponse {
  Status: string;
  Message?: string;
  Result?: string;
}

export interface UraTransactionItem {
  area: string; // Floor area in sqm
  floorRange?: string; // e.g. "11-15", "01-05"
  noOfUnits?: string;
  contractDate: string; // e.g. "0125" (MMYY)
  typeOfSale: string; // 1: New Sale, 2: Sub Sale, 3: Resale
  price: string; // e.g. "2450000"
  propertyType: string; // e.g. "Condominium", "Apartment", "Executive Condominium", "Semi-Detached", "Terrace"
  district: string; // e.g. "01", "09", "15"
  tenure: string; // e.g. "Freehold", "99 yrs lease commencing from 2021"
  typeOfArea?: string; // "Strata" or "Land"
  nettPrice?: string;
}

export interface UraProjectItem {
  street: string;
  project: string;
  marketSegment: 'CCR' | 'RCR' | 'OCR' | string;
  x?: string;
  y?: string;
  transaction: UraTransactionItem[];
}

export interface UraDataResponse {
  Status: string;
  Message?: string;
  Result: UraProjectItem[];
}

// In-memory daily token cache to avoid exhausting daily quota
interface TokenCache {
  token: string | null;
  dateStr: string | null; // YYYY-MM-DD
  fetchedAt: number;
}

const tokenCache: TokenCache = {
  token: null,
  dateStr: null,
  fetchedAt: 0,
};

/**
 * Helper to get today's date string in Singapore Standard Time (SGT, UTC+8)
 */
export function getSingaporeDateString(): string {
  const now = new Date();
  const sgTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return sgTime.toISOString().slice(0, 10);
}

/**
 * Step 1: Exchange AccessKey for Today's Token
 * Valid for the day. Caches token in memory for current date.
 */
export async function getUraDailyToken(
  customAccessKey?: string,
  forceRefresh = false
): Promise<{ token: string; cached: boolean; dateStr: string }> {
  const accessKey = customAccessKey?.trim() || process.env.URA_ACCESS_KEY?.trim();

  if (!accessKey) {
    throw new Error(
      'URA_ACCESS_KEY is required. Please set it in your environment variables or provide it in the request.'
    );
  }

  const today = getSingaporeDateString();

  // Return cached token if valid for today and not forced
  if (!forceRefresh && tokenCache.token && tokenCache.dateStr === today) {
    return {
      token: tokenCache.token,
      cached: true,
      dateStr: today,
    };
  }

  // Request new daily token from URA
  const response = await fetch(URA_ENDPOINTS.TOKEN, {
    method: 'GET',
    headers: {
      'AccessKey': accessKey,
      'User-Agent': 'SingaporePropertyPricesApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`URA token service error: HTTP ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as UraTokenResponse;

  if (data.Status !== 'Success' || !data.Result) {
    throw new Error(
      data.Message ||
        'Failed to obtain URA daily token. Please verify your URA_ACCESS_KEY.'
    );
  }

  tokenCache.token = data.Result;
  tokenCache.dateStr = today;
  tokenCache.fetchedAt = Date.now();

  return {
    token: data.Result,
    cached: false,
    dateStr: today,
  };
}

/**
 * Step 2: Invoke URA DataService using BOTH headers: AccessKey and Token
 * Service: PMI_Resi_Transaction
 * Batches: 1 to 4
 */
export async function fetchUraResiTransactions(params?: {
  batch?: number;
  accessKey?: string;
  token?: string;
}): Promise<UraDataResponse> {
  const batch = params?.batch || 1;
  const accessKey = params?.accessKey?.trim() || process.env.URA_ACCESS_KEY?.trim();

  if (!accessKey) {
    throw new Error(
      'URA_ACCESS_KEY is required. Please set it in your environment variables or provide it in the request.'
    );
  }

  // Use provided token or trade for today's token
  let token = params?.token?.trim();
  if (!token) {
    const tokenResult = await getUraDailyToken(accessKey);
    token = tokenResult.token;
  }

  const url = `${URA_ENDPOINTS.DATA}?service=PMI_Resi_Transaction&batch=${batch}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'AccessKey': accessKey,
      'Token': token,
      'User-Agent': 'SingaporePropertyPricesApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`URA DataService error: HTTP ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as UraDataResponse;

  if (json.Status && json.Status !== 'Success') {
    throw new Error(json.Message || 'URA DataService returned an unsuccessful status.');
  }

  return json;
}

/**
 * Format URA Contract Date "MMYY" into standard "YYYY-MM"
 * e.g. "0125" -> "2025-01", "1124" -> "2024-11"
 */
export function formatUraContractDate(mmyy: string): string {
  if (!mmyy || mmyy.length !== 4) return mmyy || new Date().toISOString().slice(0, 7);
  const mm = mmyy.slice(0, 2);
  const yy = mmyy.slice(2, 4);
  const year = parseInt(yy, 10) > 70 ? `19${yy}` : `20${yy}`;
  return `${year}-${mm}`;
}

/**
 * Format URA Type of Sale
 * 1: New Sale, 2: Sub Sale, 3: Resale
 */
export function formatUraSaleType(type: string): 'New Sale' | 'Sub Sale' | 'Resale' {
  switch (type) {
    case '1':
      return 'New Sale';
    case '2':
      return 'Sub Sale';
    case '3':
    default:
      return 'Resale';
  }
}

/**
 * Standardize URA Property Type
 */
export function formatUraPropertyType(rawType: string): string {
  if (!rawType) return 'Condominium';
  const lower = rawType.toLowerCase();
  if (lower.includes('condo')) return 'Condominium';
  if (lower.includes('executive')) return 'Executive Condominium';
  if (lower.includes('apartment')) return 'Apartment';
  if (lower.includes('terrace')) return 'Terrace House';
  if (lower.includes('semi-detached') || lower.includes('semi detached')) return 'Semi-Detached House';
  if (lower.includes('detached')) return 'Detached House';
  if (lower.includes('strata')) return 'Strata Landed';
  return rawType;
}

/**
 * Transform raw URA response into standardized SingaporeProperty objects
 */
export function transformUraToProperties(uraData: UraDataResponse): any[] {
  if (!uraData.Result || !Array.isArray(uraData.Result)) {
    return [];
  }

  const flattened: any[] = [];

  for (const project of uraData.Result) {
    const projectName = project.project || 'Residential Development';
    const streetName = project.street || '';
    const rawMarketSegment = (project.marketSegment || 'CCR').toUpperCase();
    const marketSegment = ['CCR', 'RCR', 'OCR'].includes(rawMarketSegment)
      ? rawMarketSegment
      : 'CCR';

    if (!Array.isArray(project.transaction)) continue;

    for (let i = 0; i < project.transaction.length; i++) {
      const tx = project.transaction[i];
      const price = parseFloat(tx.price) || 0;
      const areaSqm = parseFloat(tx.area) || 0;
      // 1 square meter = 10.7639 square feet
      const areaSqft = areaSqm > 0 ? Math.round(areaSqm * 10.7639) : 0;
      const pricePsf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;
      const pricePsm = areaSqm > 0 ? Math.round(price / areaSqm) : 0;

      const rawDistrict = tx.district ? String(tx.district).padStart(2, '0') : '01';
      const district = `D${rawDistrict}`;

      flattened.push({
        id: `ura-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${tx.contractDate}-${i}-${price}`,
        projectName,
        streetName,
        district,
        districtName: `District ${rawDistrict}`,
        marketSegment,
        propertyType: formatUraPropertyType(tx.propertyType),
        price,
        areaSqft,
        areaSqm,
        pricePsf,
        pricePsm,
        tenure: tx.tenure || 'Freehold',
        contractDate: formatUraContractDate(tx.contractDate),
        saleType: formatUraSaleType(tx.typeOfSale),
        floorRange: tx.floorRange ? tx.floorRange.replace('-', ' to ') : '',
      });
    }
  }

  return flattened;
}

/**
 * Serverless HTTP Handler for URA integration
 * Compatible with serverless environments (Vercel, AWS Lambda, Cloud Run, Express)
 */
export default async function handler(req: any, res: any) {
  // Support both Express and serverless request/response formats
  const method = req.method;
  const query = req.query || {};
  const body = req.body || {};

  const action = query.action || body.action || 'status';
  const customAccessKey = req.headers?.['x-ura-accesskey'] || req.headers?.['accesskey'] || query.accessKey || body.accessKey;

  try {
    switch (action) {
      // 1. Trade AccessKey for Today's Daily Token
      case 'token': {
        const force = query.force === 'true' || body.force === true;
        const tokenResult = await getUraDailyToken(customAccessKey, force);
        return res.status(200).json({
          success: true,
          action: 'token',
          message: tokenResult.cached
            ? "Retrieved today's cached URA token."
            : 'Traded AccessKey for fresh daily token from URA.',
          date: tokenResult.dateStr,
          cached: tokenResult.cached,
          token: tokenResult.token,
        });
      }

      // 2. Fetch raw or transformed URA residential transaction data
      case 'fetch': {
        const batch = parseInt(query.batch || body.batch || '1', 10);
        const raw = query.raw === 'true' || body.raw === true;
        const customToken = req.headers?.['token'] || query.token || body.token;

        const uraResponse = await fetchUraResiTransactions({
          batch,
          accessKey: customAccessKey,
          token: customToken,
        });

        if (raw) {
          return res.status(200).json(uraResponse);
        }

        const properties = transformUraToProperties(uraResponse);
        return res.status(200).json({
          success: true,
          action: 'fetch',
          service: 'PMI_Resi_Transaction',
          batch,
          totalProjects: uraResponse.Result?.length || 0,
          totalTransactions: properties.length,
          data: properties,
        });
      }

      // 3. Status of URA configuration
      case 'status':
      default: {
        const hasKey = Boolean(process.env.URA_ACCESS_KEY);
        const today = getSingaporeDateString();
        const hasCachedToken = Boolean(tokenCache.token && tokenCache.dateStr === today);

        return res.status(200).json({
          service: 'URA DataService Connection',
          configured: hasKey,
          keySource: hasKey ? 'process.env.URA_ACCESS_KEY' : 'Not configured (pass via header/param)',
          todaySgt: today,
          hasActiveToken: hasCachedToken,
          tokenDate: tokenCache.dateStr,
          endpoints: URA_ENDPOINTS,
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while connecting to URA DataService.',
    });
  }
}
