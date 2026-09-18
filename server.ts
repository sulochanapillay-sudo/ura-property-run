import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory property store for placeholder & API testing
// Strictly initialized with NO data (empty array) as requested:
// "Do not include any data as of now, i will connect to the backend after for now, but include placeholders for the API integration."
let propertiesStore: any[] = [];

// API: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Singapore Private Property Prices API Placeholder',
    timestamp: new Date().toISOString(),
  });
});

// API: Districts master list
app.get('/api/properties/districts', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: 28,
    districts: [
      { code: 'D01', name: "Raffles Place, Cecil, Marina, People's Park", region: 'CCR' },
      { code: 'D02', name: 'Anson, Tanjong Pagar, Shenton Way', region: 'CCR' },
      { code: 'D03', name: 'Queenstown, Tiong Bahru, Alexandra', region: 'RCR' },
      { code: 'D04', name: 'Telok Blangah, Harbourfront, Mount Faber, Sentosa', region: 'RCR' },
      { code: 'D05', name: 'Buona Vista, West Coast, Clementi New Town', region: 'OCR' },
      { code: 'D06', name: 'City Hall, High Street, Beach Road', region: 'CCR' },
      { code: 'D07', name: 'Middle Road, Golden Mile, Bugis, Rochor', region: 'RCR' },
      { code: 'D08', name: 'Little India, Farrer Park, Serangoon Road', region: 'RCR' },
      { code: 'D09', name: 'Orchard, Cairnhill, River Valley', region: 'CCR' },
      { code: 'D10', name: 'Ardmore, Bukit Timah, Holland Road, Tanglin', region: 'CCR' },
      { code: 'D11', name: 'Watten Estate, Novena, Newton, Thomson', region: 'CCR' },
      { code: 'D12', name: 'Balestier, Toa Payoh, Serangoon', region: 'RCR' },
      { code: 'D13', name: 'Macpherson, Braddell, Potong Pasir', region: 'RCR' },
      { code: 'D14', name: 'Geylang, Eunos, Paya Lebar, Kembangan', region: 'RCR' },
      { code: 'D15', name: 'Katong, Joo Chiat, Amber Road, Marine Parade', region: 'RCR' },
      { code: 'D16', name: 'Bedok, Upper East Coast, Eastwood, Kew Drive', region: 'OCR' },
      { code: 'D17', name: 'Loyang, Changi, Flora Road', region: 'OCR' },
      { code: 'D18', name: 'Tampines, Pasir Ris', region: 'OCR' },
      { code: 'D19', name: 'Serangoon Garden, Hougang, Punggol, Sengkang', region: 'OCR' },
      { code: 'D20', name: 'Bishan, Ang Mo Kio, Thomson', region: 'RCR' },
      { code: 'D21', name: 'Upper Bukit Timah, Clementi Park, Ulu Pandan', region: 'RCR' },
      { code: 'D22', name: 'Jurong, Boon Lay, Tuas', region: 'OCR' },
      { code: 'D23', name: 'Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang', region: 'OCR' },
      { code: 'D24', name: 'Lim Chu Kang, Tengah', region: 'OCR' },
      { code: 'D25', name: 'Kranji, Woodgrove, Woodlands', region: 'OCR' },
      { code: 'D26', name: 'Mandai, Upper Thomson, Springleaf', region: 'OCR' },
      { code: 'D27', name: 'Yishun, Sembawang, Admiralty', region: 'OCR' },
      { code: 'D28', name: 'Seletar, Yio Chu Kang', region: 'OCR' },
    ],
  });
});

// API: Schema specification for developers
app.get('/api/properties/schema', (req: Request, res: Response) => {
  res.json({
    title: 'SingaporePrivatePropertyRecord',
    type: 'object',
    required: ['id', 'projectName', 'district', 'propertyType', 'price', 'areaSqft', 'pricePsf', 'tenure', 'contractDate'],
    properties: {
      id: { type: 'string', description: 'Unique transaction identifier' },
      projectName: { type: 'string', description: 'Name of the private condo or development' },
      streetName: { type: 'string', description: 'Street name or address' },
      district: { type: 'string', pattern: '^D(0[1-9]|1[0-9]|2[0-8])$', description: 'Singapore district code (D01 to D28)' },
      districtName: { type: 'string', description: 'Descriptive district neighborhood label' },
      marketSegment: { type: 'string', enum: ['CCR', 'RCR', 'OCR'], description: 'Singapore URA Market Segment' },
      propertyType: {
        type: 'string',
        enum: ['Condominium', 'Apartment', 'Executive Condominium', 'Terrace House', 'Semi-Detached House', 'Detached House', 'Strata Landed'],
      },
      price: { type: 'number', description: 'Transacted price in Singapore Dollars (SGD)' },
      areaSqft: { type: 'number', description: 'Floor area in square feet' },
      areaSqm: { type: 'number', description: 'Floor area in square meters' },
      pricePsf: { type: 'number', description: 'Price per square foot in SGD' },
      pricePsm: { type: 'number', description: 'Price per square meter in SGD' },
      tenure: { type: 'string', description: 'Freehold, 99-year Leasehold, 999-year Leasehold' },
      contractDate: { type: 'string', description: 'Transaction date (YYYY-MM-DD or YYYY-MM)' },
      saleType: { type: 'string', enum: ['New Sale', 'Resale', 'Sub Sale'] },
      floorRange: { type: 'string', description: 'e.g. 11 to 15, 01 to 05' },
      numberOfBedrooms: { type: 'number' },
      postalCode: { type: 'string' },
    },
  });
});

// API: Get properties (filtered)
app.get('/api/properties', (req: Request, res: Response) => {
  const {
    query,
    district,
    marketSegment,
    propertyType,
    tenure,
    saleType,
    minPrice,
    maxPrice,
    minPsf,
    maxPsf,
    sortBy,
    sortOrder = 'asc',
  } = req.query;

  let results = [...propertiesStore];

  // Filtering
  if (query) {
    const q = String(query).toLowerCase();
    results = results.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(q) ||
        p.streetName?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.districtName?.toLowerCase().includes(q)
    );
  }

  if (district && district !== 'ALL') {
    results = results.filter((p) => p.district === district);
  }

  if (marketSegment && marketSegment !== 'ALL') {
    results = results.filter((p) => p.marketSegment === marketSegment);
  }

  if (propertyType && propertyType !== 'ALL') {
    results = results.filter((p) => p.propertyType === propertyType);
  }

  if (tenure && tenure !== 'ALL') {
    results = results.filter((p) => p.tenure?.includes(String(tenure)));
  }

  if (saleType && saleType !== 'ALL') {
    results = results.filter((p) => p.saleType === saleType);
  }

  if (minPrice) {
    results = results.filter((p) => Number(p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter((p) => Number(p.price) <= Number(maxPrice));
  }
  if (minPsf) {
    results = results.filter((p) => Number(p.pricePsf) >= Number(minPsf));
  }
  if (maxPsf) {
    results = results.filter((p) => Number(p.pricePsf) <= Number(maxPsf));
  }

  // Sorting
  if (sortBy) {
    results.sort((a, b) => {
      const fieldA = a[String(sortBy)];
      const fieldB = b[String(sortBy)];
      const orderModifier = sortOrder === 'desc' ? -1 : 1;
      if (fieldA < fieldB) return -1 * orderModifier;
      if (fieldA > fieldB) return 1 * orderModifier;
      return 0;
    });
  }

  const isDataLoaded = propertiesStore.length > 0;

  res.json({
    success: true,
    status: isDataLoaded ? 'connected' : 'awaiting_backend_data',
    message: isDataLoaded
      ? `Retrieved ${results.length} private property records.`
      : 'API Integration Placeholder Active: 0 records in database. Ready to receive backend data via POST /api/properties or upstream connector.',
    total: results.length,
    timestamp: new Date().toISOString(),
    data: results,
  });
});

// API: Aggregate Statistics
app.get('/api/properties/stats', (req: Request, res: Response) => {
  const { district, marketSegment, propertyType } = req.query;

  let dataset = [...propertiesStore];
  if (district && district !== 'ALL') {
    dataset = dataset.filter((p) => p.district === district);
  }
  if (marketSegment && marketSegment !== 'ALL') {
    dataset = dataset.filter((p) => p.marketSegment === marketSegment);
  }
  if (propertyType && propertyType !== 'ALL') {
    dataset = dataset.filter((p) => p.propertyType === propertyType);
  }

  if (dataset.length === 0) {
    res.json({
      success: true,
      status: 'awaiting_backend_data',
      message: 'No property records available to calculate statistics. Awaiting backend connection.',
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
    });
    return;
  }

  const prices = dataset.map((d) => Number(d.price)).filter((p) => !isNaN(p) && p > 0);
  const psfs = dataset.map((d) => Number(d.pricePsf)).filter((p) => !isNaN(p) && p > 0);

  prices.sort((a, b) => a - b);
  psfs.sort((a, b) => a - b);

  const medianPrice = prices[Math.floor(prices.length / 2)] || 0;
  const averagePrice = Math.round(prices.reduce((sum, v) => sum + v, 0) / prices.length);
  const medianPsf = psfs[Math.floor(psfs.length / 2)] || 0;
  const averagePsf = Math.round(psfs.reduce((sum, v) => sum + v, 0) / psfs.length);
  const highestPsf = psfs[psfs.length - 1] || 0;
  const lowestPsf = psfs[0] || 0;

  const byRegion = {
    CCR: dataset.filter((d) => d.marketSegment === 'CCR').length,
    RCR: dataset.filter((d) => d.marketSegment === 'RCR').length,
    OCR: dataset.filter((d) => d.marketSegment === 'OCR').length,
  };

  const byPropertyType: Record<string, number> = {};
  for (const item of dataset) {
    const type = item.propertyType || 'Other';
    byPropertyType[type] = (byPropertyType[type] || 0) + 1;
  }

  res.json({
    success: true,
    status: 'connected',
    message: 'Calculated statistical metrics successfully.',
    total: dataset.length,
    timestamp: new Date().toISOString(),
    data: {
      totalTransactions: dataset.length,
      medianPrice,
      averagePrice,
      medianPsf,
      averagePsf,
      highestPsf,
      lowestPsf,
      byRegion,
      byPropertyType,
    },
  });
});

// API: Ingest single or batch private property records
app.post('/api/properties', (req: Request, res: Response) => {
  const { properties, property } = req.body;
  const toInsert: any[] = [];

  if (Array.isArray(properties)) {
    toInsert.push(...properties);
  } else if (property && typeof property === 'object') {
    toInsert.push(property);
  }

  if (toInsert.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid request body. Expected { properties: SingaporeProperty[] } or { property: SingaporeProperty }',
    });
    return;
  }

  // Validate & format records
  const validated = toInsert.map((item, idx) => {
    const price = Number(item.price) || 0;
    const areaSqft = Number(item.areaSqft) || 0;
    const calculatedPsf = areaSqft > 0 ? Math.round(price / areaSqft) : Number(item.pricePsf) || 0;
    const areaSqm = item.areaSqm ? Number(item.areaSqm) : Math.round(areaSqft * 0.092903);
    const calculatedPsm = areaSqm > 0 ? Math.round(price / areaSqm) : Number(item.pricePsm) || 0;

    return {
      id: item.id || `sg-prop-${Date.now()}-${idx}`,
      projectName: item.projectName || 'Private Residential Development',
      streetName: item.streetName || '',
      district: item.district || 'D01',
      districtName: item.districtName || '',
      marketSegment: item.marketSegment || 'CCR',
      propertyType: item.propertyType || 'Condominium',
      price,
      areaSqft,
      areaSqm,
      pricePsf: Number(item.pricePsf) || calculatedPsf,
      pricePsm: Number(item.pricePsm) || calculatedPsm,
      tenure: item.tenure || 'Freehold',
      contractDate: item.contractDate || new Date().toISOString().slice(0, 10),
      saleType: item.saleType || 'Resale',
      floorRange: item.floorRange || '',
      numberOfBedrooms: item.numberOfBedrooms || undefined,
      postalCode: item.postalCode || '',
    };
  });

  propertiesStore.push(...validated);

  res.json({
    success: true,
    message: `Successfully ingested ${validated.length} private property record(s).`,
    inserted: validated.length,
    totalInDatabase: propertiesStore.length,
    timestamp: new Date().toISOString(),
  });
});

// API: Reset / Clear properties store
app.post('/api/properties/reset', (req: Request, res: Response) => {
  propertiesStore = [];
  res.json({
    success: true,
    message: 'Backend store reset to empty state (0 records). Awaiting backend connection.',
    cleared: true,
    totalInDatabase: 0,
  });
});

// Vite middleware for development & Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singapore Property Prices server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
