const TOKEN_KEY = 'fp_token'

function parseJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

function isInvalid(token: string): boolean {
  if (token.split('.').length !== 3) return true
  const exp = parseJwt(token)['exp'] as number | undefined
  return exp !== undefined && Date.now() / 1000 >= exp
}

function createSession() {
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored && isInvalid(stored)) localStorage.removeItem(TOKEN_KEY)

  let token = $state<string | null>(stored && !isInvalid(stored) ? stored : null)

  const claims = $derived(token ? parseJwt(token) : {})

  return {
    get token()           { return token },
    get isAuthenticated() { return token !== null },
    get userId()          { return (claims['userId'] as string) ?? '' },
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
