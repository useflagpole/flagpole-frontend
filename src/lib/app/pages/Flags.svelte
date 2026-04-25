<script lang="ts">
  import { projects, flags } from '../data'
  import RolloutBar from '../RolloutBar.svelte'
  import FlagIcon from '../FlagIcon.svelte'

  let { activeProject, projectName, nav, onSelectFlag }: {
    activeProject: string
    projectName: string
    nav: (p: string) => void
    onSelectFlag: (id: string) => void
  } = $props()

  const proj      = $derived(projects.find(p => p.id === activeProject) ?? projects[0])
  const projFlags = $derived(flags[proj.id] ?? [])
  let search      = $state('')
  let filter      = $state('all')
  const filtered  = $derived(projFlags.filter(f => {
    const q = search.toLowerCase()
    return (filter === 'all' || f.status === filter) && f.key.includes(q)
  }))
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1><span class="page-icon"><FlagIcon size={22} /></span> flags</h1>
    </div>
    <div class="actions">
      <button class="btn btn-ghost">Import</button>
      <button class="btn btn-primary">+ New flag</button>
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
      <span class="count mono">{filtered.length}</span>
    </div>

    <div class="panel">
      {#if filtered.length === 0}
        <div class="empty">No flags match your search</div>
      {/if}
      {#each filtered as f, i}
        <button class="flag-row" class:last={i === filtered.length - 1} onclick={() => onSelectFlag(f.id)}>
          <span class="pill" class:on={f.status === 'on'}>{f.status}</span>
          <span class="flag-key mono">{f.key}</span>
          <div class="tags">
            {#each f.tags as t}<span class="tag">{t}</span>{/each}
          </div>
          <RolloutBar pct={f.rollout} width={100} />
          <span class="evals mono">{f.evals > 0 ? f.evals.toLocaleString() : '—'}</span>
        </button>
      {/each}
    </div>
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

  .flag-key {
    font-size: 13px;
    color: var(--ink);
    flex: 1;
  }

  .tags {
    display: flex;
    gap: 5px;
  }

  .evals {
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

  .btn-ghost:hover {
    border-color: var(--ink);
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
