import { api, type ApiResult } from './client'

export interface OrgDTO {
  id: number
  name: string
  organizationId: number
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
