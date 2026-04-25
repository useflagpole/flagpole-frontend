<script lang="ts">
  import { projects, auditLog } from '../data'
  import ActionBadge from '../ActionBadge.svelte'

  let { activeProject, projectName }: { activeProject: string; projectName: string } = $props()
  const projLog = $derived(auditLog.filter(a => a.projectId === activeProject))
  let search       = $state('')
  let filterAction = $state('all')
  const actionTypes = ['all', 'flag.toggle', 'flag.create', 'flag.rollout', 'flag.rules', 'segment.edit']

  const filtered = $derived(projLog.filter(a => {
    const q = search.toLowerCase()
    const matchQ = a.target.includes(q) || a.actor.includes(q) || a.detail.toLowerCase().includes(q)
    const matchA = filterAction === 'all' || a.action === filterAction
    return matchQ && matchA
  }))
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1>Audit log</h1>
    </div>
    <div class="actions">
      <button class="btn btn-ghost">Export CSV</button>
    </div>
  </header>

  <div class="content">
    <div class="toolbar">
      <input bind:value={search} placeholder="Search events, actors, targets…" class="search-input" />
      <div class="filter-group">
        {#each actionTypes as a}
          <button
            class="btn btn-sm"
            class:btn-subtle={filterAction === a}
            class:btn-ghost={filterAction !== a}
            onclick={() => filterAction = a}
          >
            {a === 'all' ? 'All' : a}
          </button>
        {/each}
      </div>
    </div>

    <div class="panel">
      <div class="table-header">
        <span class="col-time">Time</span>
        <span class="col-action">Action</span>
        <span class="col-target">Target</span>
        <span class="col-detail">Detail</span>
        <span class="col-env">Env</span>
        <span class="col-actor">Actor</span>
      </div>
      {#if filtered.length === 0}
        <div class="empty mono">No matching events</div>
      {/if}
      {#each filtered as a, i}
        <div class="audit-row" class:last={i === filtered.length - 1}>
          <span class="col-time mono ts">{a.ts}</span>
          <span class="col-action"><ActionBadge action={a.action} /></span>
          <span class="col-target mono target">{a.target}</span>
          <span class="col-detail detail">{a.detail}</span>
          <span class="col-env"><span class="tag mono">{a.env}</span></span>
          <span class="col-actor mono actor">{a.actor}</span>
        </div>
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
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--ink);
    font: 400 13px 'Geist', ui-sans-serif;
    outline: none;
  }

  .filter-group {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    gap: 12px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--line);
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .audit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
    transition: background .1s;
  }

  .audit-row.last {
    border-bottom: none;
  }

  .audit-row:hover {
    background: var(--bg-3);
  }

  .col-time   { min-width: 160px; flex-shrink: 0; }
  .col-action { min-width: 130px; flex-shrink: 0; }
  .col-target { min-width: 180px; flex-shrink: 0; }
  .col-detail { flex: 1; }
  .col-env    { min-width: 80px; flex-shrink: 0; }
  .col-actor  { min-width: 140px; text-align: right; flex-shrink: 0; }

  .ts     { font-size: 11px; color: var(--ink-3); }
  .target { font-size: 12px; font-weight: 500; color: var(--ink); }
  .detail { color: var(--ink-3); }
  .actor  { font-size: 11px; color: var(--ink-3); }

  .tag {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 2px 6px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--bg-3);
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-align: center;
    padding: 64px 24px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
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
