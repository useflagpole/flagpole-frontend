import { api, type ApiResult } from './client'

export interface SDKKeyDTO {
  id:              number
  projectId:       number
  environmentId:   number
  environmentName: string
  type:            'server' | 'client'
  name:            string
  keyHint:         string   // prefix + last 4 chars, e.g. "fp_srv_a1b2"
  revokedAt:       string | null
  lastUsedAt:      string | null
  createdAt:       string
}

export interface SDKKeyCreatedDTO extends SDKKeyDTO {
  key: string
}

const base = (orgId: number, projectId: number) =>
  `/organizations/${orgId}/projects/${projectId}/sdk-keys`

export function listSDKKeys(orgId: number, projectId: number, envId?: number): Promise<ApiResult<SDKKeyDTO[]>> {
  const query = envId ? `?env_id=${envId}` : ''
  return api.get(`${base(orgId, projectId)}${query}`)
}

export function createSDKKey(
  orgId: number,
  projectId: number,
  environmentId: number,
  keyType: 'server' | 'client',
  name: string,
): Promise<ApiResult<SDKKeyCreatedDTO>> {
  return api.post(base(orgId, projectId), { environmentId, type: keyType, name })
}

export function revokeSDKKey(orgId: number, projectId: number, keyId: number): Promise<ApiResult<null>> {
  return api.delete(`${base(orgId, projectId)}/${keyId}`)
}

export function revealSDKKey(orgId: number, projectId: number, keyId: number): Promise<ApiResult<{ key: string }>> {
  return api.get(`${base(orgId, projectId)}/${keyId}/reveal`)
}
