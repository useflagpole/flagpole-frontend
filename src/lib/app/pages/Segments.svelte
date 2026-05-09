<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { projectStore } from '../../project.svelte'
  import { listSegments, type SegmentDTO } from '../../api/flags'

  let { activeProject, projectName, nav, onSelectSegment }: {
    activeProject: string
    projectName: string
    nav: (p: string) => void
    onSelectSegment: (id: string) => void
  } = $props()

  const orgId = $derived(orgStore.activeId)
  const projId = $derived(projectStore.projects.find(p => String(p.id) === activeProject)?.id ?? 0)

  let segs = $state<SegmentDTO[]>([])
  let search = $state('')

  $effect(() => {
    if (orgId && projId) {
      listSegments(orgId, projId).then(r => {
        if (r.ok) segs = r.data
      })
    }
  })

  const filtered = $derived(segs.filter(s => s.name.toLowerCase().includes(search.toLowerCase())))
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1><span class="page-icon">◎</span> segments</h1>
    </div>
    <div class="actions">
      <button class="btn btn-primary" onclick={() => nav('segmentnew')}>+ New segment</button>
    </div>
  </header>

  <div class="content">
    <div class="toolbar">
      <input bind:value={search} placeholder="Search segments…" class="search-input" />
    </div>

    <div class="panel">
      {#if filtered.length === 0}
        <div class="empty mono">No segments found</div>
      {/if}
      {#each filtered as s, i}
        <button class="seg-row" class:last={i === filtered.length - 1} onclick={() => onSelectSegment(String(s.id))}>
          <div class="dot"></div>
          <span class="seg-name mono">{s.name}</span>
          <span class="seg-desc">{s.description}</span>
          <span class="rule-count mono">{(s.rules?.length ?? 0)} rule{(s.rules?.length ?? 0) !== 1 ? 's' : ''}</span>
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

  .seg-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    transition: background .1s;
  }

  .seg-row.last {
    border-bottom: none;
  }

  .seg-row:hover {
    background: var(--bg-3);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }

  .seg-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    min-width: 180px;
  }

  .seg-desc {
    font-size: 12.5px;
    color: var(--ink-3);
    flex: 1;
  }

  .rule-count {
    font-size: 11px;
    color: var(--ink-3);
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

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
