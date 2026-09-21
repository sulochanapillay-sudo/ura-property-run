import { getUraDailyToken, getSingaporeDateString, URA_ENDPOINTS } from './ura';

/**
 * Serverless Route: Trade AccessKey for Today's Token
 * Endpoint: /api/token
 *
 * Calls URA:
 * https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 * Header: AccessKey: <URA_ACCESS_KEY>
 */
export default async function handler(req: any, res: any) {
  const customAccessKey =
    req.headers?.['x-ura-accesskey'] ||
    req.headers?.['accesskey'] ||
    req.query?.accessKey ||
    req.body?.accessKey;

  const force = req.query?.force === 'true' || req.body?.force === true;

  try {
    const result = await getUraDailyToken(customAccessKey, force);
    return res.status(200).json({
      status: 'Success',
      message: result.cached
        ? "Reusing today's cached URA token."
        : 'Successfully traded AccessKey for fresh daily token.',
      endpoint: URA_ENDPOINTS.TOKEN,
      date: result.dateStr,
      cached: result.cached,
      token: result.token,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'Error',
      error: error.message || 'Failed to exchange AccessKey for URA token.',
      endpoint: URA_ENDPOINTS.TOKEN,
      help: 'Ensure URA_ACCESS_KEY is set in environment or provided in AccessKey header.',
    });
  }
}
