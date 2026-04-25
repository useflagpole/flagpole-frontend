<script lang="ts">
  import { resolve } from './routes'
  import Auth from './lib/Auth.svelte'
  import { session } from './lib/session.svelte'

  let hash = $state(window.location.hash || '#/')

  $effect(() => {
    const onHashChange = () => { hash = window.location.hash || '#/' }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  })

  const authHashes = new Set(['#/login', '#/signup'])

  $effect(() => {
    if (authHashes.has(hash) && session.isAuthenticated) {
      window.location.hash = '#/app'
    }
  })

  let Page = $derived(resolve(hash))
</script>

{#if authHashes.has(hash) && !session.isAuthenticated}
  <Auth initialTab={hash === '#/signup' ? 'signup' : 'login'} />
{:else if !authHashes.has(hash)}
  <Page />
{/if}
