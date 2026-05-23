<script lang="ts">
  import { projectStore } from '../../project.svelte'
  import { orgStore } from '../../org.svelte'
  import { userStore } from '../../user.svelte'
  import { updateProject, archiveProject } from '../../api/projects'
  import {
    listEnvironments,
    createEnvironment,
    renameEnvironment,
    deleteEnvironment,
    type EnvironmentDTO,
  } from '../../api/environments'
  import ModalDeleteEnv from '../ModalDeleteEnv.svelte'
  import ModalArchiveProject from '../ModalArchiveProject.svelte'
  import EnvAccessPanel from '../EnvAccessPanel.svelte'
  import { notify } from '../../toasts.svelte'

  let { activeProject, projectName }: { activeProject: string; projectName: string } = $props()

  const proj = $derived(projectStore.projects.find(p => String(p.id) === activeProject))

  const ownerName = $derived(userStore.username)
  const isAdmin   = $derived(orgStore.activeOrg?.role === 'admin')
  const userEmail = $derived(userStore.email)

  let nameInput    = $state('')
  let originalName = $state('')
  let nameSaving   = $state(false)
  $effect(() => { nameInput = proj?.name ?? ''; originalName = proj?.name ?? '' })

  const saveProjectName = async () => {
    if (!orgId || !projId || !nameInput.trim()) return
    nameSaving = true
    const r = await updateProject(orgId, projId, nameInput.trim())
    nameSaving = false
    if (r.ok) {
      projectStore.updateName(projId, r.data.name)
      originalName = r.data.name
      notify.success('Project renamed', `Project is now "${r.data.name}".`)
    } else if (r.status === 403) {
      notify.error('Permission denied', 'Admin role required to rename this project.')
    } else {
      notify.error('Rename failed', r.message)
    }
  }

  // environments
  const orgId  = $derived(orgStore.activeId)
  const projId = $derived(proj?.id ?? 0)

  let envs        = $state<EnvironmentDTO[]>([])
  let envsLoading = $state(false)
  let envError    = $state<string | null>(null)

  $effect(() => {
    if (orgId && projId) {
      envsLoading = true
      listEnvironments(orgId, projId).then(r => {
        envsLoading = false
        if (r.ok) envs = r.data
        else envError = r.message
      })
    }
  })

  const handleCreateEnv = async (name: string): Promise<EnvironmentDTO[] | null> => {
    if (!orgId || !projId) return null
    const r = await createEnvironment(orgId, projId, name)
    if (r.ok) {
      envs = r.data
      notify.success('Environment created', `"${name}" is ready to use.`)
      return r.data
    }
    notify.error('Create failed', r.message)
    return null
  }

  // rename flow
  let renamingEnv  = $state<EnvironmentDTO | null>(null)
  let renameVal    = $state('')
  let renameError  = $state<string | null>(null)
  let renameSaving = $state(false)

  const handleRenameEnv = (env: EnvironmentDTO) => {
    renamingEnv = env; renameVal = env.name; renameError = null
  }

  const submitRename = async () => {
    if (!orgId || !projId || !renamingEnv || !renameVal.trim()) return
    renameSaving = true; renameError = null
    const r = await renameEnvironment(orgId, projId, renamingEnv.id, renameVal.trim())
    renameSaving = false
    if (r.ok) {
      const old = renamingEnv.name
      envs = r.data
      notify.success('Environment renamed', `"${old}" → "${renameVal.trim()}"`)
      renamingEnv = null
    } else {
      renameError = r.message
      notify.error('Rename failed', r.message)
    }
  }

  // delete flow
  let deletingEnv = $state<EnvironmentDTO | null>(null)

  const handleDeleteEnv = (env: EnvironmentDTO) => { deletingEnv = env }

  const removeEnv = async (): Promise<string | null> => {
    if (!orgId || !projId || !deletingEnv) return null
    const r = await deleteEnvironment(orgId, projId, deletingEnv.id)
    if (r.ok) { envs = r.data; return null }
    return r.message
  }

  // archive
  let showArchiveModal = $state(false)

  const doArchive = async (): Promise<string | null> => {
    if (!orgId || !projId) return 'Missing project context'
    const r = await archiveProject(orgId, projId)
    if (r.ok) {
      projectStore.remove(projId)
      notify.success('Project archived', `"${proj?.name}" has been archived.`)
      return null
    }
    if (r.status === 403) {
      notify.error('Permission denied', 'Admin role required to archive this project.')
    } else {
      notify.error('Archive failed', r.message)
    }
    return r.message
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1><span class="page-icon">⚙</span> project settings</h1>
    </div>
  </header>

  <div class="content">
    {#if !proj}
      <div class="empty mono">No project selected</div>
    {:else}
    <div class="settings-col">

      <div class="panel">
        <div class="panel-bar"><span>Project</span></div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Project name</div>
              <div class="setting-sub mono">Used in the SDK and dashboard</div>
            </div>
            <input class="text-input" bind:value={nameInput} disabled={!isAdmin} />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Owner</div>
              <div class="setting-sub mono">Account that owns this project</div>
            </div>
            <span class="owner-text mono">{ownerName}</span>
          </div>
          <div class="save-row">
            <button
              class="btn btn-primary btn-sm"
              disabled={!isAdmin || nameInput.trim() === originalName || nameSaving}
              onclick={saveProjectName}
            >{nameSaving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>

      {#if envsLoading}
        <div class="panel"><div class="panel-body"><div class="env-empty mono">Loading environments…</div></div></div>
      {:else if envError}
        <div class="panel"><div class="panel-body"><div class="env-empty mono" style="color:#e07070">{envError}</div></div></div>
      {:else}
        <EnvAccessPanel
          {orgId}
          {projId}
          {envs}
          currentUserEmail={userEmail}
          onCreateEnv={handleCreateEnv}
          onRenameEnv={handleRenameEnv}
          onDeleteEnv={handleDeleteEnv}
          onEnvsChanged={(updated) => { envs = updated }}
        />
      {/if}

      <div class="panel danger-panel">
        <div class="panel-bar">
          <span class="danger-title">Danger zone</span>
        </div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Archive project</div>
              <div class="setting-sub mono">Disables all flags and removes from the dashboard. Reversible.</div>
            </div>
            <div><button class="btn btn-danger" disabled={!isAdmin} onclick={() => showArchiveModal = true}>Archive project</button></div>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Delete project</div>
              <div class="setting-sub mono">Permanently deletes all flags, segments and SDK keys. Not reversible.</div>
            </div>
            <div><button class="btn btn-danger" disabled={!isAdmin}>Delete project</button></div>
          </div>
        </div>
      </div>

    </div>
    {/if}
  </div>
</div>

{#if renamingEnv}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="rename-overlay" onclick={(e) => { if (e.target === e.currentTarget) renamingEnv = null }}>
    <div class="rename-modal" role="dialog" aria-modal="true">
      <div class="rename-header">
        <div class="rename-title">Rename environment</div>
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <span class="rename-close" onclick={() => renamingEnv = null}>×</span>
      </div>
      <div class="rename-body">
        <input
          class="rename-input mono"
          bind:value={renameVal}
          placeholder="environment name"
          onkeydown={(ev) => { if (ev.key === 'Enter') submitRename(); if (ev.key === 'Escape') renamingEnv = null }}
        />
        {#if renameError}<div class="rename-error mono">{renameError}</div>{/if}
        <div class="rename-actions">
          <button class="btn btn-ghost btn-sm" onclick={() => renamingEnv = null}>Cancel</button>
          <button class="btn btn-primary btn-sm" disabled={!renameVal.trim() || renameSaving} onclick={submitRename}>
            {renameSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if deletingEnv}
  <ModalDeleteEnv
    envName={deletingEnv.name}
    projectName={proj?.name ?? ''}
    onConfirm={removeEnv}
    onClose={() => deletingEnv = null}
  />
{/if}

{#if showArchiveModal}
  <ModalArchiveProject
    projectName={proj?.name ?? ''}
    onConfirm={doArchive}
    onClose={() => showArchiveModal = false}
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

  .content {
    padding: 0 32px 64px;
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 64px 24px;
    text-align: center;
  }

  .settings-col {
    max-width: 880px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  .danger-panel {
    border-color: #7a3333;
  }

  .panel-bar {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .danger-title {
    color: #e07070;
  }

  .panel-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .setting-row {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 24px;
    align-items: center;
  }

  .setting-title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 3px;
  }

  .setting-sub {
    font-size: 12px;
    color: var(--ink-3);
  }

  .save-row {
    padding-top: 4px;
    display: flex;
    justify-content: flex-end;
  }

  .text-input {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--ink);
    font: 400 13px 'Geist', ui-sans-serif;
    padding: 9px 12px;
    outline: none;
    width: 100%;
  }

  .text-input:focus {
    border-color: var(--line-2);
  }

  .text-input:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .owner-text {
    font-size: 13px;
    color: var(--ink-2);
  }

  .env-empty {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 16px 0;
    text-align: center;
  }

  .rename-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .rename-modal {
    width: 100%;
    max-width: 400px;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 10px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  .rename-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
  }

  .rename-title {
    font-weight: 500;
    font-size: 14px;
    color: var(--ink);
  }

  .rename-close {
    color: var(--ink-3);
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    user-select: none;
  }

  .rename-close:hover { color: var(--ink); }

  .rename-body { padding: 16px 18px; }

  .rename-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--ink);
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    padding: 9px 12px;
    outline: none;
    margin-bottom: 4px;
  }

  .rename-input:focus { border-color: var(--line-2); }

  .rename-error {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: #e07070;
    margin-bottom: 10px;
  }

  .rename-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 14px;
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

  .btn-primary:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover {
    border-color: var(--ink);
  }

  .btn-danger {
    background: transparent;
    color: #e07070;
    border-color: #7a3333;
  }

  .btn-danger:hover:not(:disabled) {
    opacity: 0.75;
  }

  .btn-danger:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
