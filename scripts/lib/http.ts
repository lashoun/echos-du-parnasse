/**
 * Shared HTTP utilities for scrapers and API clients.
 */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch with automatic retry for rate limits (429) and server errors (5xx).
 * @param url — the URL to fetch
 * @param userAgent — User-Agent header value
 * @param options — optional extra fetch options
 */
async function apiFetch(
  url: string,
  userAgent: string,
  options?: RequestInit,
): Promise<Response> {
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
        ...(options?.headers as Record<string, string> | undefined),
      },
    })
    if (response.ok) return response
    if (response.status === 429 && attempt < maxRetries) {
      const retryAfter = Number(response.headers.get('Retry-After')) || 5
      console.error(`⏳ Rate limited, waiting ${retryAfter}s...`)
      await sleep(retryAfter * 1000)
      continue
    }
    if (response.status >= 500 && attempt < maxRetries) {
      console.error(`⏳ Server error ${response.status}, retrying...`)
      await sleep(2_000 * attempt)
      continue
    }
    throw new Error(
      `API error: ${response.status} ${response.statusText}`,
    )
  }
  throw new Error('Max retries exceeded')
}

export { sleep, apiFetch }
