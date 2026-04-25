import { session } from '../session.svelte'

const BASE = import.meta.env.VITE_API_URL

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiOk<T>  = { ok: true;  data: T }
export type ApiErr    = { ok: false; status: number; message: string }
export type ApiResult<T> = ApiOk<T> | ApiErr

async function request<T>(path: string, method: Method, body?: unknown): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {}
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server.' }
  }

  const isJson = res.headers.get('content-type')?.includes('application/json') ?? false
  const json   = isJson ? await res.json() : null

  if (res.ok) return { ok: true, data: (json?.data ?? null) as T }

  return { ok: false, status: res.status, message: json?.error ?? 'Something went wrong.' }
}

export const api = {
  get:    <T>(path: string)               => request<T>(path, 'GET'),
  post:   <T>(path: string, body?: unknown) => request<T>(path, 'POST',   body),
  put:    <T>(path: string, body?: unknown) => request<T>(path, 'PUT',    body),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, 'PATCH',  body),
  delete: <T>(path: string)               => request<T>(path, 'DELETE'),
}
