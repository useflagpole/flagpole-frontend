import { api, type ApiResult } from './client'

export function updateUsername(userId: string, username: string): Promise<ApiResult<{ username: string }>> {
  return api.patch(`/users/${userId}/username`, { username })
}
