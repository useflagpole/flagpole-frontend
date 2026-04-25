const BASE = import.meta.env.VITE_API_URL

export interface ProjectDTO {
  id: number
  name: string
  organizationId: number
  environments: string
}

export type CreateProjectResult =
  | { ok: true; project: ProjectDTO }
  | { ok: false; status: number; message: string }

export async function createProject(
  orgId: number,
  name: string,
  token: string,
): Promise<CreateProjectResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/organizations/${orgId}/projects`, {
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
    return { ok: true, project: body.data as ProjectDTO }
  }

  return { ok: false, status: res.status, message: body.error ?? 'Something went wrong.' }
}
