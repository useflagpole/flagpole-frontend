import { api, type ApiResult } from './client'

export interface EnvironmentDTO {
  id:        number
  name:      string
  projectId: number
}

const base = (orgId: number, projectId: number) =>
  `/organizations/${orgId}/projects/${projectId}/environments`

export function listEnvironments(orgId: number, projectId: number): Promise<ApiResult<EnvironmentDTO[]>> {
  return api.get(base(orgId, projectId))
}

export function createEnvironment(orgId: number, projectId: number, name: string): Promise<ApiResult<EnvironmentDTO[]>> {
  return api.post(base(orgId, projectId), { name })
}

export function renameEnvironment(orgId: number, projectId: number, envId: number, newName: string): Promise<ApiResult<EnvironmentDTO[]>> {
  return api.patch(`${base(orgId, projectId)}/${envId}`, { name: newName })
}

export function deleteEnvironment(orgId: number, projectId: number, envId: number): Promise<ApiResult<EnvironmentDTO[]>> {
  return api.delete(`${base(orgId, projectId)}/${envId}`)
}
