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
  isOwner: boolean
}

export function fetchOrgMembers(orgId: number): Promise<ApiResult<OrgMemberDTO[]>> {
  return api.get(`/organizations/${orgId}/members`)
}

export function updateMemberRole(orgId: number, userId: string, roleId: number): Promise<ApiResult<{ roleId: number }>> {
  return api.put(`/organizations/${orgId}/members/${userId}/role`, { roleId })
}

export function updateOrganization(orgId: number, name: string): Promise<ApiResult<OrgDTO>> {
  return api.put(`/organizations/${orgId}`, { name })
}

export function deleteOrganization(orgId: number): Promise<ApiResult<null>> {
  return api.delete(`/organizations/${orgId}`)
}

export interface OrgRoleDTO {
  id: number
  name: string
  isDefault: boolean
  isProtected: boolean
  permissions: string[]
}

export function fetchOrgRoles(orgId: number): Promise<ApiResult<OrgRoleDTO[]>> {
  return api.get(`/organizations/${orgId}/roles`)
}

export function createOrgRole(orgId: number, name: string): Promise<ApiResult<OrgRoleDTO>> {
  return api.post(`/organizations/${orgId}/roles`, { name: name.toLowerCase() })
}

export function deleteOrgRole(orgId: number, roleId: number): Promise<ApiResult<null>> {
  return api.delete(`/organizations/${orgId}/roles/${roleId}`)
}

export function updateOrgRolePermissions(orgId: number, roleId: number, permissions: string[]): Promise<ApiResult<OrgRoleDTO>> {
  return api.put(`/organizations/${orgId}/roles/${roleId}/permissions`, { permissions })
}
