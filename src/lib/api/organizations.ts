const BASE = import.meta.env.VITE_API_URL

export interface OrgDTO {
  id: number
  name: string
  ownerId: string
}

export type OrgsResult =
  | { ok: true; orgs: OrgDTO[] }
  | { ok: false; status: number; message: string }

export type CreateOrgResult =
  | { ok: true; org: OrgDTO }
  | { ok: false; status: number; message: string }

export async function createOrganization(
  name: string,
  token: string,
): Promise<CreateOrgResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    })
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server.' }
  }

  const body = await res.json()

  if (res.ok) {
    return { ok: true, org: body.data as OrgDTO }
  }

  return { ok: false, status: res.status, message: body.error ?? 'Something went wrong.' }
}

export type SetPlanResult =
  | { ok: true }
  | { ok: false; status: number; message: string }

export async function setOrganizationPlan(
  orgId: number,
  plan: string,
  token: string,
): Promise<SetPlanResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/organizations/${orgId}/plan`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    })
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server.' }
  }

  if (res.ok) return { ok: true }

  const body = await res.json()
  return { ok: false, status: res.status, message: body.error ?? 'Something went wrong.' }
}

export async function fetchUserOrganizations(
  userID: string,
  token: string,
): Promise<OrgsResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/users/${userID}/organizations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server.' }
  }

  const body = await res.json()

  if (res.ok) {
    return { ok: true, orgs: body.data as OrgDTO[] }
  }

  return { ok: false, status: res.status, message: body.error ?? 'Something went wrong.' }
}
