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
  value:     boolean | string | number
  enabled:   boolean
  priority:  number
}

export interface SegmentDTO {
  id:          number
  projectId:   number
  name:        string
  description: string
  matchType:   string
  ruleCount:   number
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

export interface SegmentOperatorMeta {
  id: string
  label: string
  glyph: string
  group: string
  kind: 'text' | 'number' | 'list'
}

export const SEGMENT_OPERATORS: SegmentOperatorMeta[] = [
  { id: 'equals',      label: 'equals',                glyph: '=',  group: 'Equality',   kind: 'text' },
  { id: 'not_equals',  label: 'not equals',            glyph: '≠',  group: 'Equality',   kind: 'text' },
  { id: 'contains',    label: 'contains',              glyph: '⊃',  group: 'Text match', kind: 'text' },
  { id: 'starts_with', label: 'starts with',           glyph: '⇤',  group: 'Text match', kind: 'text' },
  { id: 'ends_with',   label: 'ends with',             glyph: '⇥',  group: 'Text match', kind: 'text' },
  { id: 'gt',          label: 'greater than',          glyph: '>',  group: 'Comparison', kind: 'number' },
  { id: 'gte',         label: 'greater than or equal', glyph: '≥',  group: 'Comparison', kind: 'number' },
  { id: 'lt',          label: 'less than',             glyph: '<',  group: 'Comparison', kind: 'number' },
  { id: 'lte',         label: 'less than or equal',    glyph: '≤',  group: 'Comparison', kind: 'number' },
  { id: 'in',          label: 'in list',               glyph: '∈',  group: 'List',       kind: 'list' },
  { id: 'not_in',      label: 'not in list',           glyph: '∉',  group: 'List',       kind: 'list' },
]

export const SEG_OP_BY_ID: Record<string, SegmentOperatorMeta> = Object.fromEntries(
  SEGMENT_OPERATORS.map(o => [o.id, o])
)

export const SEG_OP_GROUPS = ['Equality', 'Text match', 'Comparison', 'List']

export const COMMON_ATTRS = [
  { name: 'plan',             example: 'pro · enterprise · free' },
  { name: 'country',          example: 'US · GB · DE' },
  { name: 'region',           example: 'us-east-1 · eu-west-2' },
  { name: 'platform',         example: 'ios · android · web' },
  { name: 'email',            example: '@acme.co' },
  { name: 'beta_opt_in',      example: 'true · false' },
  { name: 'account_age_days', example: '0–365' },
  { name: 'api_calls_daily',  example: 'numeric' },
  { name: 'app_version',      example: '2.4.1' },
]

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
  overrides?: { segmentId: number; value: unknown; enabled: boolean; priority: number }[]
}): Promise<ApiResult<string>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}/flags/${flagId}/config?env=${encodeURIComponent(env)}`, payload)
}

export function listSegments(orgId: number, projectId: number): Promise<ApiResult<SegmentDTO[]>> {
  return api.get(`/organizations/${orgId}/projects/${projectId}/segments`)
}

export function createSegment(orgId: number, projectId: number, payload: {
  name: string
  description?: string
  matchType?: string
  rules?: { attribute: string; operator: string; value: string }[]
}): Promise<ApiResult<SegmentDTO>> {
  return api.post(`/organizations/${orgId}/projects/${projectId}/segments`, payload)
}

export function updateSegment(orgId: number, projectId: number, segmentId: number, payload: {
  name?: string
  description?: string
  matchType?: string
  rules?: { attribute: string; operator: string; value: string }[]
}): Promise<ApiResult<SegmentDTO>> {
  return api.patch(`/organizations/${orgId}/projects/${projectId}/segments/${segmentId}`, payload)
}

export function deleteSegment(orgId: number, projectId: number, segmentId: number): Promise<ApiResult<null>> {
  return api.delete(`/organizations/${orgId}/projects/${projectId}/segments/${segmentId}`)
}
