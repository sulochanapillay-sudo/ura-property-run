import {
  fetchUraResiTransactions,
  transformUraToProperties,
  getUraDailyToken,
} from './ura';

/**
 * Serverless Route: Sync URA Dataset directly to application
 * Endpoint: /api/sync
 *
 * Automatically:
 * 1. Trades AccessKey for today's token (if needed)
 * 2. Fetches batch 1 (or requested batch) with both AccessKey and Token
 * 3. Transforms into standardized SingaporeProperty records
 */
export default async function handler(req: any, res: any) {
  const customAccessKey =
    req.headers?.['x-ura-accesskey'] ||
    req.headers?.['accesskey'] ||
    req.query?.accessKey ||
    req.body?.accessKey;

  const customToken =
    req.headers?.['token'] ||
    req.headers?.['x-ura-token'] ||
    req.query?.token ||
    req.body?.token;

  const batch = parseInt(req.query?.batch || req.body?.batch || '1', 10);

  try {
    // 1. Get/verify daily token
    const tokenInfo = await getUraDailyToken(customAccessKey);

    // 2. Fetch data using both headers
    const rawData = await fetchUraResiTransactions({
      batch,
      accessKey: customAccessKey,
      token: customToken || tokenInfo.token,
    });

    // 3. Transform to clean records
    const properties = transformUraToProperties(rawData);

    return res.status(200).json({
      success: true,
      message: `Successfully retrieved ${properties.length} Singapore private property transactions from URA DataService (Batch ${batch}).`,
      batch,
      tokenDate: tokenInfo.dateStr,
      cachedTokenUsed: tokenInfo.cached,
      count: properties.length,
      properties,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'URA Sync operation failed.',
    });
  }
}
