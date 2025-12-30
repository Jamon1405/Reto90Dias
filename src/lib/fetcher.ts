export type RetryDelay = number;

type TimeoutOptions = RequestInit & { timeoutMs?: number };

export async function fetchWithTimeout(url: string, options: TimeoutOptions = {}) {
  const { timeoutMs = 8000, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...rest, signal: controller.signal });
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  delays: RetryDelay[] = [500, 1200],
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;
      if (attempt < delays.length) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }
  }
  throw lastError;
}
