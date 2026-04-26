import { api, type ApiResult } from './client'
import type { UserOrg } from '../user.svelte'

export interface UserDTO {
  id:        string
  username:  string
  firstName: string
  lastName:  string
  email:     string
  orgs:      UserOrg[]
}

export function getUser(userId: string): Promise<ApiResult<UserDTO>> {
  return api.get(`/users/${userId}`)
}

export function updateUsername(userId: string, username: string): Promise<ApiResult<{ username: string }>> {
  return api.patch(`/users/${userId}/username`, { username })
}
