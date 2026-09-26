import { generateContent } from '../server/generate';
import { validateStudyDeck } from '../src/lib/validateResult';
import { GenerateRequestPayload } from '../src/types/result';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      errorType: 'INVALID_METHOD',
      message: 'Method not allowed. Use POST.',
    });
  }

  const startTime = Date.now();
  let payload: GenerateRequestPayload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    payload = req.body;
  }

  if (!payload || typeof payload.prompt !== 'string' || !payload.prompt.trim()) {
    return res.status(400).json({
      success: false,
      errorType: 'INVALID_SHAPE',
      message: 'A non-empty prompt string is required.',
    });
  }

  try {
    const result = await generateContent(payload);

    if (result.error) {
      return res.status(result.error.status || 500).json({
        success: false,
        errorType: result.error.errorType,
        message: result.error.message,
        details: result.error.details,
        raw: result.raw,
      });
    }

    if (payload.simulationMode && payload.simulationMode !== 'none') {
      return res.status(200).json({
        success: true,
        data: result.data || result.raw,
        raw: result.raw,
        provider: result.provider,
        model: result.model,
        latencyMs: Date.now() - startTime,
      });
    }

    if (result.data) {
      return res.status(200).json({
        success: true,
        data: result.data,
        raw: result.raw,
        provider: result.provider,
        model: result.model,
        latencyMs: Date.now() - startTime,
      });
    }

    const validation = validateStudyDeck(result.raw);
    if (!validation.valid) {
      return res.status(200).json({
        success: false,
        errorType: validation.errorType,
        message: validation.message,
        details: validation.details,
        raw: result.raw,
        provider: result.provider,
        model: result.model,
        latencyMs: Date.now() - startTime,
      });
    }

    return res.status(200).json({
      success: true,
      data: validation.data,
      raw: result.raw,
      provider: result.provider,
      model: result.model,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[Vercel API Proxy Error]', error);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Unexpected internal error in backend proxy server.',
      details: error?.message || String(error),
    });
  }
}
