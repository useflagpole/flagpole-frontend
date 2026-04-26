import { api, type ApiResult } from './client'

export interface OrgDTO {
  id: number
  name: string
  organizationId: number
  role: string
}

export function createOrganization(name: string): Promise<ApiResult<OrgDTO>> {
  return api.post('/organizations', { name })
}

export function setOrganizationPlan(orgId: number, plan: string): Promise<ApiResult<null>> {
  return api.patch(`/organizations/${orgId}/plan`, { plan })
}

export function fetchUserOrganizations(userID: string): Promise<ApiResult<OrgDTO[]>> {
  return api.get(`/users/${userID}/organizations`)
}

export interface OrgMemberDTO {
  userId: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export function fetchOrgMembers(orgId: number): Promise<ApiResult<OrgMemberDTO[]>> {
  return api.get(`/organizations/${orgId}/members`)
}
