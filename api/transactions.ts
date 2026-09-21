import {
  fetchUraResiTransactions,
  transformUraToProperties,
  URA_ENDPOINTS,
} from './ura';

/**
 * Serverless Route: Invoke URA Private Residential Property Transactions
 * Endpoint: /api/transactions
 *
 * Calls URA:
 * https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=<batch>
 * Headers:
 *   AccessKey: <URA_ACCESS_KEY>
 *   Token: <URA_DAILY_TOKEN>
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
  const raw = req.query?.raw === 'true' || req.body?.raw === true;

  try {
    const rawData = await fetchUraResiTransactions({
      batch,
      accessKey: customAccessKey,
      token: customToken,
    });

    if (raw) {
      return res.status(200).json(rawData);
    }

    const properties = transformUraToProperties(rawData);

    return res.status(200).json({
      success: true,
      service: 'PMI_Resi_Transaction',
      endpoint: `${URA_ENDPOINTS.DATA}?service=PMI_Resi_Transaction&batch=${batch}`,
      batch,
      totalProjects: rawData.Result?.length || 0,
      totalTransactions: properties.length,
      data: properties,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch URA transactions.',
      endpoint: `${URA_ENDPOINTS.DATA}?service=PMI_Resi_Transaction&batch=${batch}`,
      help: 'Ensure AccessKey and Token headers are valid, or provide URA_ACCESS_KEY in environment.',
    });
  }
}
