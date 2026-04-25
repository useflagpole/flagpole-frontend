import { api, type ApiResult } from './client'

export async function login(email: string, password: string): Promise<ApiResult<{ token: string }>> {
  return api.post('/login', { email, password })
}

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<ApiResult<null>> {
  return api.post('/signup', { email, password, firstName, lastName })
}
