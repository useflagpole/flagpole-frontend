import { fetchProjects, type ProjectDTO } from './api/projects'

function createProjectStore() {
  let projects = $state<ProjectDTO[]>([])
  let loading  = $state(false)
  let error    = $state<string | null>(null)

  return {
    get projects() { return projects },
    get loading()  { return loading },
    get error()    { return error },

    async fetch(orgId: number) {
      loading = true
      error   = null
      const result = await fetchProjects(orgId)
      loading = false
      if (result.ok) {
        projects = result.data
      } else {
        error    = result.message
        projects = []
      }
    },

    push(p: ProjectDTO) { projects = [...projects, p] },
    clear() { projects = [] },
  }
}

export const projectStore = createProjectStore()
