/** Safe JSON fetch for admin CMS list pages */
export async function fetchAdminList<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Fetch with error message — prefer useAdminList hook in new CMS pages */
export async function fetchAdminListWithError<T>(
  url: string
): Promise<{ data: T[]; error: string | null }> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        data: [],
        error:
          (data && typeof data === 'object' && 'error' in data && String(data.error)) ||
          `Ошибка ${res.status}`,
      };
    }
    return { data: Array.isArray(data) ? data : [], error: null };
  } catch {
    return { data: [], error: 'Ошибка сети' };
  }
}

/** Safe JSON parse from fetch Response */
export async function parseJsonResponse<T>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
