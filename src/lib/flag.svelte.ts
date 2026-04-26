import { listFlags, type FlagDTO } from './api/flags'

function createFlagStore() {
  let flags   = $state<FlagDTO[]>([])
  let loading = $state(false)
  let error   = $state<string | null>(null)

  return {
    get flags()   { return flags },
    get loading() { return loading },
    get error()   { return error },

    async fetch(orgId: number, projectId: number) {
      loading = true
      error   = null
      const r = await listFlags(orgId, projectId)
      loading = false
      if (r.ok) {
        flags = r.data
      } else {
        error = r.message
        flags = []
      }
    },

    push(flag: FlagDTO) {
      flags = [...flags, flag]
    },

    update(updated: FlagDTO) {
      flags = flags.map(f => f.id === updated.id ? updated : f)
    },

    remove(id: number) {
      flags = flags.filter(f => f.id !== id)
    },

    clear() {
      flags   = []
      error   = null
      loading = false
    },
  }
}

export const flagStore = createFlagStore()
