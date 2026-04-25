import { fetchUserOrganizations, type OrgDTO } from './api/organizations'

function createOrgStore() {
  let orgs    = $state<OrgDTO[]>([])
  let activeId = $state<number | null>(null)
  let loading  = $state(false)
  let ready    = $state(false)
  let error    = $state<string | null>(null)

  const activeOrg = $derived(
    orgs.find(o => o.id === activeId) ?? orgs[0] ?? null
  )

  return {
    get orgs()      { return orgs },
    get activeOrg() { return activeOrg },
    get activeId()  { return activeId },
    get loading()   { return loading },
    get ready()     { return ready },
    get error()     { return error },

    setActive(id: number) {
      activeId = id
    },

    async fetch(userID: string, token: string) {
      loading = true
      error   = null
      const result = await fetchUserOrganizations(userID, token)
      loading = false
      ready   = true
      if (result.ok) {
        orgs     = result.orgs
        activeId = result.orgs[0]?.id ?? null
      } else {
        error = result.message
      }
    },

    push(org: OrgDTO) {
      orgs     = [...orgs, org]
      activeId = org.id
    },

    clear() {
      orgs     = []
      activeId = null
      ready    = false
      error    = null
    },
  }
}

export const orgStore = createOrgStore()
