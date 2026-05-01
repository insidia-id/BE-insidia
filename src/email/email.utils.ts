export function shouldFallbackFromResend(error: unknown) {
  const err = error as {
    statusCode?: number;
    status?: number;
    message?: string;
  };

  const statusCode = err.statusCode ?? err.status;
  const message = err.message?.toLowerCase() ?? '';

  return (
    statusCode === 429 ||
    statusCode === 500 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('timeout')
  );
}
