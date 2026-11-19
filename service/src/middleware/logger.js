export function logRequest(req, res) {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    // Only log API routes and errors to prevent log flooding
    if (url.startsWith('/api') || status >= 400) {
      console.log(`[HTTP] ${method.padEnd(6)} ${url} ${color}${status}${reset} - ${duration}ms`);
    }
  });
}
