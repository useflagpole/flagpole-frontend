const BASE = import.meta.env.VITE_API_URL

export type ApiResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string }

export async function login(email: string, password: string): Promise<LoginResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server.' }
  }

  const body = await res.json()

  if (res.ok) {
    return { ok: true, token: body.data.token }
  }

  return { ok: false, status: res.status, message: body.error ?? 'Something went wrong.' }
}

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<ApiResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server.' }
  }

  if (res.status === 201) return { ok: true }

  const body = await res.json()
  return { ok: false, status: res.status, message: body.error ?? 'Something went wrong.' }
}
