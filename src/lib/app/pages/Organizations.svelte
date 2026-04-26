<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { userStore } from '../../user.svelte'
  import { session } from '../../session.svelte'

  let { nav, onSelectOrg }: {
    nav: (p: string) => void
    onSelectOrg: (id: number) => void
  } = $props()

  $effect(() => {
    if (session.userId) userStore.fetch(session.userId)
  })

  const myOrgs     = $derived(orgStore.orgs.filter(o => o.isOwner))
  const memberOrgs = $derived(orgStore.orgs.filter(o => !o.isOwner))

</script>

{#snippet orgRow(o: { id: number; name: string; role: string })}
  <div class="org-wrap">
    <button class="org-row" class:active={orgStore.activeId === o.id} onclick={() => onSelectOrg(o.id)}>
      <div class="org-avatar">{o.name[0].toUpperCase()}</div>
      <div class="org-info">
        <span class="org-name">{o.name}</span>
        <span class="org-role mono">{o.role}</span>
      </div>
      {#if orgStore.activeId === o.id}
        <span class="pill on">active</span>
      {/if}
    </button>
    <button class="settings-btn" onclick={() => { onSelectOrg(o.id); nav('org-settings') }}>⚙</button>
  </div>
{/snippet}

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">account</span>
      <h1><span class="page-icon">⊞</span> organizations</h1>
    </div>
    <div class="actions">
      <button class="btn btn-ghost">Join organization</button>
      <button class="btn btn-primary">+ Add organization</button>
    </div>
  </header>

  <div class="content">

    <div class="list-section">
      <div class="list-label mono">My organizations</div>
      <div class="org-list">
        {#if myOrgs.length === 0}
          <div class="empty mono">No organizations yet</div>
        {:else}
          {#each myOrgs as o}
            {@render orgRow(o)}
          {/each}
        {/if}
      </div>
    </div>

    {#if memberOrgs.length > 0}
      <div class="list-section">
        <div class="list-label mono">Joined organizations</div>
        <div class="org-list">
          {#each memberOrgs as o}
            {@render orgRow(o)}
          {/each}
        </div>
      </div>
    {/if}

  </div>
</div>

<style>
  .page-shell {
    flex: 1;
    background: var(--bg);
  }

  .page-header {
    padding: 32px 32px 20px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  h1 {
    margin: 0;
    font-weight: 500;
    font-size: clamp(22px, 2vw, 28px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .eyebrow {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 6px;
    font: 500 13.5px 'Geist', ui-sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity .15s;
  }

  .btn-primary {
    background: var(--ink);
    color: var(--bg);
  }

  .btn-primary:hover {
    opacity: 0.85;
  }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover {
    border-color: var(--ink);
  }

  .content {
    padding: 0 32px 64px;
  }

  .list-section {
    max-width: 640px;
    margin-bottom: 28px;
  }

  .list-label {
    font-size: 11px;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  .empty {
    font-size: 12px;
    color: var(--ink-3);
    padding: 20px 0;
  }

  .org-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .org-wrap {
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .org-row {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 14px 18px;
    cursor: pointer;
    text-align: left;
    transition: background .1s;
  }

  .org-row:hover,
  .org-row.active {
    background: var(--bg-3);
  }

  .org-avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font: 600 14px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .org-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .org-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
  }

  .org-role {
    font-size: 11.5px;
    color: var(--ink-3);
  }

  .pill {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
    white-space: nowrap;
  }

  .pill.on {
    color: var(--accent);
    border-color: var(--accent-line);
    background: var(--accent-dim);
  }

  .settings-btn {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--ink-3);
    font-size: 16px;
    padding: 0 12px;
    cursor: pointer;
    opacity: 0;
    transition: opacity .15s, color .15s, background .15s;
    flex-shrink: 0;
  }

  .org-wrap:hover .settings-btn {
    opacity: 1;
  }

  .settings-btn:hover {
    color: var(--ink);
    background: var(--bg-3);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
