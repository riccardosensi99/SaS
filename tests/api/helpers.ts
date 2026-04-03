const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  ok: boolean;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export async function apiGet<T = unknown>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await parseJson<T>(res);
  return { status: res.status, data, ok: res.ok };
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<T>(res);
  return { status: res.status, data, ok: res.ok };
}

export async function apiPut<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<T>(res);
  return { status: res.status, data, ok: res.ok };
}

export async function apiDelete<T = unknown>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE" });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { status: res.status, data: data as T, ok: res.ok };
}
