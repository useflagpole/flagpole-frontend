<script lang="ts">
  import { projects } from '../data'

  let { activeProject, onSelectProject }: {
    activeProject: string
    onSelectProject: (id: string) => void
  } = $props()
</script>

<div class="page-shell">
  <header class="page-header">
    <h1>Projects</h1>
    <div class="actions">
      <button class="btn btn-primary">+ New project</button>
    </div>
  </header>

  <div class="content">
    <div class="project-list">
      {#each projects as p}
        <button class="project-row" class:active={activeProject === p.id} onclick={() => onSelectProject(p.id)}>
          <span class="proj-name mono">{p.name}</span>
          <div class="env-tags">
            {#each p.env as e}<span class="tag">{e}</span>{/each}
          </div>
          <span class="meta mono">{p.flagCount} flags</span>
          <span class="meta mono">{p.segmentCount} segments</span>
          <span class="meta mono light">{p.lastModified}</span>
          {#if activeProject === p.id}<span class="pill on">active</span>{/if}
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

  .meta {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .meta.light {
    margin-left: auto;
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

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
