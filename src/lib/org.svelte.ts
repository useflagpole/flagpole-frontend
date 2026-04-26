import { userStore, type UserOrg } from './user.svelte'

function createOrgStore() {
  let activeId = $state<number | null>(null)

  const orgs      = $derived(userStore.orgs)
  const activeOrg = $derived(orgs.find(o => o.id === activeId) ?? orgs[0] ?? null)

  return {
    get orgs()      { return orgs },
    get activeOrg() { return activeOrg },
    get activeId()  { return activeId ?? activeOrg?.id ?? null },
    get ready()     { return userStore.ready },

    setActive(id: number) {
      activeId = id
    },

    push(org: UserOrg) {
      userStore.pushOrg(org)
      activeId = org.id
    },

    clear() {
      activeId = null
    },
  }
}

export const orgStore = createOrgStore()
