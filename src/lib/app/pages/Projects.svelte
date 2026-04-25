<script lang="ts">
  import { projectStore } from '../../project.svelte'

  let { activeProject, projectName, orgName, onSelectProject, onOpenSettings }: {
    activeProject: string
    projectName: string
    orgName: string
    onSelectProject: (id: string) => void
    onOpenSettings: (id: string) => void
  } = $props()

  const count = $derived(projectStore.projects.length)
  const eyebrow = $derived(`${count} project${count !== 1 ? 's' : ''} on ${orgName}`)

  const parseEnvs = (raw: string): string[] => {
    try { return JSON.parse(raw) } catch { return [] }
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{eyebrow}</span>
      <h1><span class="page-icon">▦</span> projects</h1>
    </div>
    <div class="actions">
      <button class="btn btn-primary">+ New project</button>
    </div>
  </header>

  <div class="content">
    <div class="project-list">
      {#if projectStore.loading}
        <div class="empty mono">Loading…</div>
      {:else if projectStore.projects.length === 0}
        <div class="empty mono">No projects yet</div>
      {:else}
        {#each projectStore.projects as p}
          <div class="project-wrap">
            <button class="project-row" class:active={activeProject === String(p.id)} onclick={() => onSelectProject(String(p.id))}>
              <span class="proj-name mono">{p.name}</span>
              <div class="env-tags">
                {#each parseEnvs(p.environments) as e}<span class="tag">{e}</span>{/each}
              </div>
              {#if activeProject === String(p.id)}<span class="pill on">active</span>{/if}
            </button>
            <button class="settings-btn" onclick={() => onOpenSettings(String(p.id))}>⚙</button>
          </div>
        {/each}
      {/if}
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

  .eyebrow {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  h1 {
    margin: 0;
    font-weight: 500;
    font-size: clamp(22px, 2vw, 28px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .content {
    padding: 0 32px 64px;
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-align: center;
    padding: 64px 24px;
  }

  .project-wrap {
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .project-row {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 14px 18px;
    cursor: pointer;
    text-align: left;
    transition: background .1s;
    width: 100%;
  }

  .project-row:hover,
  .project-row.active {
    background: var(--bg-3);
  }

  .proj-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
    min-width: 160px;
  }

  .env-tags {
    display: flex;
    gap: 6px;
    flex: 1;
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

  .project-wrap:hover .settings-btn {
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
