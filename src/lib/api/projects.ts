import { api, type ApiResult } from './client'

export interface AuditLogDTO {
  id:        number
  createdAt: string
  orgId:     number
  projectId: number | null
  actor:     string
  action:    string
  target:    string
  detail:    string
  env:       string
}

export interface ProjectDTO {
  id: number
  name: string
  organizationId: number
  environments: string
  isActive: boolean
}

export function fetchProjects(orgId: number, includeArchived = false): Promise<ApiResult<ProjectDTO[]>> {
  const qs = includeArchived ? '?getArchived=true' : ''
  return api.get(`/organizations/${orgId}/projects${qs}`)
}

export function createProject(orgId: number, name: string, environments: string[]): Promise<ApiResult<ProjectDTO>> {
  return api.post(`/organizations/${orgId}/projects`, { name, environments })
}

export function updateProject(orgId: number, projectId: number, name: string): Promise<ApiResult<ProjectDTO>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}`, { name })
}

export function archiveProject(orgId: number, projectId: number): Promise<ApiResult<ProjectDTO>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/archive`, {})
}

export function unarchiveProject(orgId: number, projectId: number): Promise<ApiResult<ProjectDTO>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/unarchive`, {})
}

export function fetchProjectAuditLog(orgId: number, projectId: number): Promise<ApiResult<AuditLogDTO[]>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/audit`)
}
