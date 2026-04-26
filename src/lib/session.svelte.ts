const TOKEN_KEY = 'fp_token'

function parseJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

function createSession() {
  let token = $state<string | null>(localStorage.getItem(TOKEN_KEY))

  const claims = $derived(token ? parseJwt(token) : {})

  return {
    get token() { return token },
    get isAuthenticated() { return token !== null },
    get userId()    { return (claims['userId'] as string) ?? '' },
    get username()  { return (claims['username'] as string) ?? '' },
    get firstName() { return (claims['firstName'] as string) ?? '' },
    get lastName()  { return (claims['lastName'] as string) ?? '' },
    set(newToken: string) {
      token = newToken
      localStorage.setItem(TOKEN_KEY, newToken)
    },
    clear() {
      token = null
      localStorage.removeItem(TOKEN_KEY)
    },
  }
}

export const session = createSession()
