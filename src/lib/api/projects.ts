import { api, type ApiResult } from './client'

export interface ProjectDTO {
  id: number
  name: string
  organizationId: number
  environments: string
}

export function fetchProjects(orgId: number): Promise<ApiResult<ProjectDTO[]>> {
  return api.get(`/organizations/${orgId}/projects`)
}

export function createProject(orgId: number, name: string, environments: string[]): Promise<ApiResult<ProjectDTO>> {
  return api.post(`/organizations/${orgId}/projects`, { name, environments })
}

export function updateProject(orgId: number, projectId: number, name: string): Promise<ApiResult<ProjectDTO>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}`, { name })
}
