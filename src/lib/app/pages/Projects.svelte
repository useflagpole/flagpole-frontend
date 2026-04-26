<script lang="ts">
  import { projectStore } from '../../project.svelte'
  import { orgStore } from '../../org.svelte'
  import ModalNewProject from '../ModalNewProject.svelte'
  import Toggle from '../Toggle.svelte'
  import type { ProjectDTO } from '../../api/projects'
  import { fetchProjects, unarchiveProject } from '../../api/projects'
  import { notify } from '../../toasts.svelte'

  let { activeProject, projectName, orgName, onSelectProject, onOpenSettings }: {
    activeProject: string
    projectName: string
    orgName: string
    onSelectProject: (id: string) => void
    onOpenSettings: (id: string) => void
  } = $props()

  let showNewProject   = $state(false)
  let showArchived     = $state(false)
  let archivedProjects = $state<ProjectDTO[]>([])
  let archivedLoading  = $state(false)

  $effect(() => {
    if (!showArchived) { archivedProjects = []; return }
    const orgId = orgStore.activeId
    if (!orgId) return
    archivedLoading = true
    fetchProjects(orgId, true).then(r => {
      archivedLoading = false
      if (r.ok) archivedProjects = r.data.filter(p => !p.isActive)
    })
  })

  async function handleUnarchive(projectId: number) {
    const orgId = orgStore.activeId
    if (!orgId) return
    const r = await unarchiveProject(orgId, projectId)
    if (r.ok) {
      archivedProjects = archivedProjects.filter(p => p.id !== projectId)
      projectStore.updateIsActive(projectId, true)
      projectStore.push(r.data)
      notify.success('Project unarchived', `"${r.data.name}" is active again.`)
    } else if (r.status === 422) {
      notify.error('Project limit reached', 'Archive or delete an active project first.')
    } else {
      notify.error('Unarchive failed', r.message)
    }
  }

  function handleCreated(project: ProjectDTO) {
    projectStore.push(project)
    showNewProject = false
    onSelectProject(String(project.id))
  }

  const MAX_PROJECTS = 2
  const count = $derived(projectStore.projects.length)
  const atLimit = $derived(count >= MAX_PROJECTS)
  const eyebrow = $derived(`${count} / ${MAX_PROJECTS} projects on ${orgName}`)

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
      <Toggle
        on={showArchived}
        onchange={v => showArchived = v}
        class="toggle-archived"
        size="sm"
        label="Show archived"
      />
      <button class="btn btn-primary" onclick={() => showNewProject = true} disabled={atLimit}>+ New project</button>
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

    {#if showArchived}
      <div class="archived-section">
        <div class="archived-label mono">Archived projects</div>
        {#if archivedLoading}
          <div class="empty mono">Loading…</div>
        {:else if archivedProjects.length === 0}
          <div class="empty mono">No archived projects</div>
        {:else}
          <div class="project-list">
            {#each archivedProjects as p}
              <div class="project-wrap">
                <div class="project-row archived">
                  <span class="proj-name mono">{p.name}</span>
                  <div class="env-tags">
                    {#each parseEnvs(p.environments) as e}<span class="tag">{e}</span>{/each}
                  </div>
                  <span class="pill archived-pill">archived</span>
                </div>
                <button class="unarchive-btn" onclick={() => handleUnarchive(p.id)} disabled={atLimit}>Unarchive</button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showNewProject}
  <ModalNewProject
    onClose={() => showNewProject = false}
    onCreated={handleCreated}
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

  :global(.toggle-archived) {
    margin-right: 5px;
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

  .btn-primary:hover:not(:disabled) {
    opacity: 0.85;
  }

  .btn-primary:disabled {
    opacity: 0.35;
    cursor: default;
  }


  .project-row.archived {
    opacity: 0.5;
    cursor: default;
    pointer-events: none;
    flex: 1;
  }

  .archived-pill {
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

  .unarchive-btn {
    background: transparent;
    border: 1px solid var(--line-2);
    border-radius: 6px;
    color: var(--ink-2);
    font: 500 12px 'Geist', ui-sans-serif;
    padding: 5px 10px;
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color .15s, color .15s;
  }

  .unarchive-btn:hover:not(:disabled) {
    border-color: var(--ink);
    color: var(--ink);
  }

  .unarchive-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .archived-section {
    margin-top: 28px;
  }

  .archived-label {
    font-size: 11px;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
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
