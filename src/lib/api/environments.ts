import { api, type ApiResult } from './client'

const base = (orgId: number, projectId: number) =>
  `/organizations/${orgId}/projects/${projectId}/environments`

export function listEnvironments(orgId: number, projectId: number): Promise<ApiResult<string[]>> {
  return api.get(base(orgId, projectId))
}

export function createEnvironment(orgId: number, projectId: number, name: string): Promise<ApiResult<string[]>> {
  return api.post(base(orgId, projectId), { name })
}

export function renameEnvironment(orgId: number, projectId: number, envName: string, newName: string): Promise<ApiResult<string[]>> {
  return api.patch(`${base(orgId, projectId)}/${encodeURIComponent(envName)}`, { name: newName })
}

export function deleteEnvironment(orgId: number, projectId: number, envName: string): Promise<ApiResult<string[]>> {
  return api.delete(`${base(orgId, projectId)}/${encodeURIComponent(envName)}`)
}
