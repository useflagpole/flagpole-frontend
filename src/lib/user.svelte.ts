import { getUser } from './api/users'

export interface UserOrg {
  id:      number
  name:    string
  role:    string
  isOwner: boolean
}

function createUserStore() {
  let username  = $state('')
  let firstName = $state('')
  let lastName  = $state('')
  let email     = $state('')
  let orgs      = $state<UserOrg[]>([])
  let ready     = $state(false)

  return {
    get username()  { return username },
    get firstName() { return firstName },
    get lastName()  { return lastName },
    get email()     { return email },
    get orgs()      { return orgs },
    get ready()     { return ready },

    async fetch(userId: string) {
      const r = await getUser(userId)
      if (r.ok) {
        username  = r.data.username
        firstName = r.data.firstName
        lastName  = r.data.lastName
        email     = r.data.email
        orgs      = r.data.orgs
      }
      ready = true
    },

    setUsername(u: string) {
      username = u
    },

    pushOrg(org: UserOrg) {
      orgs = [...orgs, org]
    },

    clear() {
      username  = ''
      firstName = ''
      lastName  = ''
      email     = ''
      orgs      = []
      ready     = false
    },
  }
}

export const userStore = createUserStore()
