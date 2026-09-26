export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeProvider,
    configuredProviders,
    cascadeEnabled: true,
  });
}
