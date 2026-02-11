export function formatBackendError(err: unknown): string | null {
  try {
    const axiosErr = err as { response?: { status?: number; data?: unknown } };
    const data = axiosErr?.response?.data;
    if (data && typeof data === 'object') {
      const detail = (data as any).detail ?? (data as any).message ?? (data as any).error;
      if (typeof detail === 'string') return detail;
      return JSON.stringify(data);
    }
    return null;
  } catch {
    return null;
  }
}

