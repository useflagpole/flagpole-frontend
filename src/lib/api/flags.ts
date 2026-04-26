import { api, type ApiResult } from './client'

export interface FlagDTO {
  id:        number
  projectId: number
  key:       string
  name:      string
  type:      'bool' | 'string' | 'number'
  enabled:   boolean
  createdAt: string
  updatedAt: string
}

export function listFlags(orgId: number, projectId: number): Promise<ApiResult<FlagDTO[]>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/flags`)
}

export function getFlag(orgId: number, projectId: number, flagId: number): Promise<ApiResult<FlagDTO>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}`)
}

export function createFlag(orgId: number, projectId: number, payload: {
  key: string
  name: string
  type: string
  value: unknown
}): Promise<ApiResult<FlagDTO>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/flags`, payload)
}

export function updateFlag(orgId: number, projectId: number, flagId: number, payload: {
  name?: string
  value?: unknown
  enabled?: boolean
}): Promise<ApiResult<FlagDTO>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}`, payload)
}

export function deleteFlag(orgId: number, projectId: number, flagId: number): Promise<ApiResult<null>> {
  return api.delete(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}`)
}
