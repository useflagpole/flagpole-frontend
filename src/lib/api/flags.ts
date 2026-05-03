import { api, type ApiResult } from './client'
import { type AuditLogDTO } from './projects'

export interface FlagDTO {
  id:          number
  projectId:   number
  key:         string
  description: string
  type:        'bool' | 'string' | 'number'
  createdAt:   string
  updatedAt:   string
}

export interface FlagDetailDTO {
  id:               number
  key:              string
  type:             'bool' | 'string' | 'number'
  description:      string
  status:           string
  rollout:          number
  rolloutEnabled:   boolean
  defaultValue:     boolean | string | number | null
  servedValue:      boolean | string | number | null
  segmentOverrides: SegmentOverrideDTO[]
}

export interface SegmentOverrideDTO {
  id:        number
  segmentId: number
  name:      string
  userCount: number
  value:     boolean | string | number
  enabled:   boolean
}

export interface SegmentDTO {
  id:          number
  projectId:   number
  name:        string
  description: string
  userCount:   number
  rules?:      SegmentRuleDTO[]
}

export interface SegmentRuleDTO {
  id:        number
  segmentId: number
  attribute: string
  operator:  string
  value:     string
}

export interface FlagEnvironmentConfigDTO {
  id:               number
  flagId:           number
  environmentName:  string
  enabled:          boolean
  rolloutEnabled:   boolean
  rolloutPercentage: number
  defaultValue:     boolean | string | number
  servedValue:      boolean | string | number
}

export function listFlags(orgId: number, projectId: number): Promise<ApiResult<FlagDTO[]>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/flags`)
}

export function getFlagDetail(orgId: number, projectId: number, flagId: number, env: string): Promise<ApiResult<FlagDetailDTO>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}?env=${encodeURIComponent(env)}`)
}

export function createFlag(orgId: number, projectId: number, payload: {
  key: string
  description?: string
  type: string
  value: unknown
}): Promise<ApiResult<FlagDTO>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/flags`, payload)
}

export function updateFlag(orgId: number, projectId: number, flagId: number, payload: {
  description?: string
}): Promise<ApiResult<FlagDTO>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}`, payload)
}

export function deleteFlag(orgId: number, projectId: number, flagId: number): Promise<ApiResult<null>> {
  return api.delete(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}`)
}

export function getFlagAudit(orgId: number, projectId: number, flagId: number, env?: string): Promise<ApiResult<AuditLogDTO[]>> {
  const qs = env ? `?env=${encodeURIComponent(env)}` : ''
  return api.get(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}/audit${qs}`)
}

export function createFlagEnvConfig(orgId: number, projectId: number, flagId: number, env: string): Promise<ApiResult<FlagEnvironmentConfigDTO>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}/config?env=${encodeURIComponent(env)}`)
}

export function updateFlagConfig(orgId: number, projectId: number, flagId: number, env: string, payload: {
  enabled?: boolean
  rolloutEnabled?: boolean
  rolloutPercentage?: number
  defaultValue?: unknown
  servedValue?: unknown
  overrides?: { segmentId: number; value: unknown; enabled: boolean }[]
}): Promise<ApiResult<string>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}/config?env=${encodeURIComponent(env)}`, payload)
}

export function listSegments(orgId: number, projectId: number): Promise<ApiResult<SegmentDTO[]>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/segments`)
}

export function addSegmentOverride(orgId: number, projectId: number, flagId: number, env: string, payload: {
  segmentId: number
  value: unknown
}): Promise<ApiResult<{ segmentId: number; value: unknown }>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}/config?env=${encodeURIComponent(env)}`, { overrides: [payload] })
}

export function removeSegmentOverride(orgId: number, projectId: number, flagId: number, env: string, segmentId: number): Promise<ApiResult<null>> {
  return api.delete(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}/config?env=${encodeURIComponent(env)}`)
}
