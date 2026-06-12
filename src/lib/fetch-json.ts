/** Safe JSON fetch for admin CMS list pages */
export async function fetchAdminList<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
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
