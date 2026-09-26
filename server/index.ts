import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateContent } from './generate';
import { validateStudyDeck } from '../src/lib/validateResult';
import { GenerateRequestPayload } from '../src/types/result';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  const configuredProviders: string[] = [];
  const isValidKey = (k?: string) => Boolean(k && k.trim().length > 15 && !k.includes('your_') && !k.includes('here'));
  const isValidHttpUrl = (u?: string) => Boolean(u && (u.trim().startsWith('http://') || u.trim().startsWith('https://')));

  if (isValidKey(process.env.GROQ_API_KEY)) configuredProviders.push('Groq Cloud (Qwen 3.8 27B)');
  if (isValidKey(process.env.OPENROUTER_API_KEY)) configuredProviders.push('OpenRouter (Llama 3.3 70B)');
  if (isValidKey(process.env.OPENAI_API_KEY)) configuredProviders.push('OpenAI (GPT-4o Mini)');
  if (isValidKey(process.env.GEMINI_API_KEY)) configuredProviders.push('Google Gemini');
  if (isValidHttpUrl(process.env.OLLAMA_BASE_URL)) configuredProviders.push('Local Ollama');

  const activeProvider = configuredProviders.length > 0
    ? configuredProviders[0]
    : 'Study Assistant Smart Engine';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeProvider,
    configuredProviders,
    cascadeEnabled: true,
    proxyPort: PORT,
  });
});

app.post('/api/generate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const payload = req.body as GenerateRequestPayload;

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
      return res.json({
        success: true,
        data: result.data || result.raw,
        raw: result.raw,
        provider: result.provider,
        model: result.model,
        latencyMs: Date.now() - startTime,
      });
    }

    if (result.data) {
      return res.json({
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

    return res.json({
      success: true,
      data: validation.data,
      raw: result.raw,
      provider: result.provider,
      model: result.model,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[API Proxy Error]', error);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Unexpected internal error in backend proxy server.',
      details: error?.message || String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ AI Backend Proxy running on http://localhost:${PORT}`);
  console.log(`   Health check available at http://localhost:${PORT}/api/health`);
});
