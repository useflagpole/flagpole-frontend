<script lang="ts">
  import FlagIcon from '../FlagIcon.svelte'
  import ModalCreateFlag from '../ModalCreateFlag.svelte'
  import { flagStore } from '../../flag.svelte'
  import { orgStore } from '../../org.svelte'
  import { projectStore } from '../../project.svelte'
  import { createFlag } from '../../api/flags'
  import { notify } from '../../toasts.svelte'

  let { activeProject, projectName, nav, onSelectFlag }: {
    activeProject: string
    projectName: string
    nav: (p: string) => void
    onSelectFlag: (id: number) => void
  } = $props()

  const orgId  = $derived(orgStore.activeId)
  const projId = $derived(projectStore.projects.find(p => String(p.id) === activeProject)?.id ?? 0)

  $effect(() => {
    if (orgId && projId) flagStore.fetch(orgId, projId)
  })

  let search          = $state('')
  let filter          = $state('all')
  let showCreateModal = $state(false)

  const filtered = $derived(flagStore.flags.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = f.key.includes(q) || f.description.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || (filter === 'on' && f.status === 'on') || (filter === 'off' && f.status === 'off')
    return matchSearch && matchFilter
  }))

  const handleCreate = async (draft: { key: string; type: string; defaultValue: string; desc: string }) => {
    if (!orgId || !projId) return
    const defaultValue = draft.type === 'bool'
      ? draft.defaultValue === 'true'
      : draft.type === 'number'
        ? (parseFloat(draft.defaultValue) || 0)
        : (draft.defaultValue || '')
    const r = await createFlag(orgId, projId, {
      key:         draft.key,
      description: draft.desc,
      type:        draft.type,
      value:       defaultValue,
    })
    if (r.ok) {
      flagStore.push(r.data)
      notify.success('Flag created', `"${r.data.key}" is ready.`)
    } else if (r.status === 422) {
      notify.error('Flag limit reached', 'Projects are limited to 25 flags.')
    } else {
      notify.error('Create failed', r.message)
    }
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1><span class="page-icon"><FlagIcon size={22} /></span> flags</h1>
    </div>
    <div class="actions">
      <button class="btn btn-ghost" disabled>Import</button>
      <button class="btn btn-primary" onclick={() => showCreateModal = true}>+ New flag</button>
    </div>
  </header>

  <div class="content">
    <div class="toolbar">
      <input bind:value={search} placeholder="Search flags…" class="search-input" />
      {#each ['all', 'on', 'off'] as s}
        <button
          class="btn btn-sm"
          class:btn-subtle={filter === s}
          class:btn-ghost={filter !== s}
          onclick={() => filter = s}
        >
          {s === 'all' ? 'All' : s}
        </button>
      {/each}
      <span class="count mono">{filtered.length} / 25 flags</span>
    </div>

    <div class="panel">
      {#if flagStore.loading}
        <div class="empty">Loading…</div>
      {:else if flagStore.error}
        <div class="empty" style="color: #e07070">{flagStore.error}</div>
      {:else if filtered.length === 0}
        <div class="empty">{flagStore.flags.length === 0 ? 'No flags yet. How about creating one?' : 'No flags match your search'}</div>
      {:else}
        {#each filtered as f, i}
          <button class="flag-row" class:last={i === filtered.length - 1} onclick={() => onSelectFlag(f.id)}>
            <span class="pill" class:on={f.envCount > 0}>{f.envCount > 0 ? `${f.envCount} ENV${f.envCount !== 1 ? 'S' : ''}` : 'off'}</span>
            <div class="flag-info">
              <span class="flag-key mono">{f.key}</span>
              <span class="flag-name">{f.description}</span>
            </div>
            <span class="tag mono">{f.type}</span>
            <span class="updated mono">{new Date(f.updatedAt).toLocaleDateString()}</span>
          </button>
        {/each}
      {/if}
    </div>
  </div>
</div>

{#if showCreateModal}
  <ModalCreateFlag
    onClose={() => showCreateModal = false}
    onSubmit={handleCreate}
  />
{/if}

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

  .content {
    padding: 0 32px 64px;
  }

  .toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    align-items: center;
  }

  .search-input {
    flex: 1;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--ink);
    font: 400 13px 'Geist', ui-sans-serif;
    outline: none;
  }

  .search-input:focus {
    border-color: var(--line-2);
  }

  .count {
    font-size: 11.5px;
    color: var(--ink-3);
    margin-left: 4px;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-align: center;
    padding: 64px 24px;
  }

  .flag-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    transition: background .1s;
  }

  .flag-row.last {
    border-bottom: none;
  }

  .flag-row:hover {
    background: var(--bg-3);
  }

  .flag-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .flag-key {
    font-size: 13px;
    color: var(--ink);
  }

  .flag-name {
    font-size: 11.5px;
    color: var(--ink-3);
  }

  .updated {
    font-size: 11px;
    color: var(--ink-3);
    min-width: 80px;
    text-align: right;
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

  .tag {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 2px 6px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--bg-3);
    white-space: nowrap;
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

  .btn-sm {
    font-size: 12px;
    padding: 5px 10px;
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

  .btn-ghost:hover:not(:disabled) {
    border-color: var(--ink);
  }

  .btn-ghost:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .btn-subtle {
    background: var(--bg-3);
    color: var(--ink-2);
    border-color: var(--line);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
