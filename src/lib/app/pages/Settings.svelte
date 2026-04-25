<script lang="ts">
  import { projectStore } from '../../project.svelte'
  import { orgStore } from '../../org.svelte'
  import { session } from '../../session.svelte'
  import { sdkKeys } from '../data'
  import {
    listEnvironments,
    createEnvironment,
    renameEnvironment,
    deleteEnvironment,
  } from '../../api/environments'
  import ModalDeleteEnv from '../ModalDeleteEnv.svelte'
  import { notify } from '../../toasts.svelte'

  let { activeProject, projectName }: { activeProject: string; projectName: string } = $props()

  const proj = $derived(projectStore.projects.find(p => String(p.id) === activeProject))

  const ownerName = $derived(`${session.firstName ?? ''} ${session.lastName ?? ''}`.trim())

  let nameInput    = $state('')
  let originalName = $state('')
  $effect(() => { nameInput = proj?.name ?? ''; originalName = proj?.name ?? '' })

  // environments
  const orgId  = $derived(orgStore.activeId)
  const projId = $derived(proj?.id ?? 0)

  let envs        = $state<string[]>([])
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

  let editingEnv = $state<string | null>(null)
  let editVal    = $state('')
  let editError  = $state<string | null>(null)

  const startEdit = (name: string) => { editingEnv = name; editVal = name; editError = null }
  const cancelEdit = () => { editingEnv = null; editVal = ''; editError = null }

  const saveRename = async (oldName: string) => {
    if (!orgId || !projId) return
    const r = await renameEnvironment(orgId, projId, oldName, editVal.trim())
    if (r.ok) {
      envs = r.data
      editingEnv = null
      notify.success('Environment renamed', `"${oldName}" → "${editVal.trim()}"`)
    } else {
      editError = r.message
      notify.error('Rename failed', r.message)
    }
  }

  let adding      = $state(false)
  let newEnvName  = $state('')
  let addError    = $state<string | null>(null)

  const submitAdd = async () => {
    if (!orgId || !projId || !newEnvName.trim()) return
    const name = newEnvName.trim()
    const r = await createEnvironment(orgId, projId, name)
    if (r.ok) {
      envs = r.data
      adding = false
      newEnvName = ''
      notify.success('Environment created', `"${name}" is ready to use.`)
    } else {
      addError = r.message
      notify.error('Create failed', r.message)
    }
  }

  let deletingEnv = $state<string | null>(null)

  const removeEnv = async (): Promise<string | null> => {
    if (!orgId || !projId || !deletingEnv) return null
    const r = await deleteEnvironment(orgId, projId, deletingEnv)
    if (r.ok) { envs = r.data; return null }
    return r.message
  }

  let copied = $state<string | null>(null)
  const copyKey = (id: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {})
    copied = id
    setTimeout(() => { copied = null }, 1800)
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1><span class="page-icon">⚙</span> settings</h1>
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
            <input class="text-input" bind:value={nameInput} />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Owner</div>
              <div class="setting-sub mono">Account that owns this project</div>
            </div>
            <span class="owner-text mono">{ownerName}</span>
          </div>
          <div class="save-row">
            <button class="btn btn-primary btn-sm" disabled={nameInput.trim() === originalName}>Save</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>Environments <span class="env-count">{envs.length} / 5</span></span>
          {#if !adding && envs.length < 5}
            <button class="btn btn-ghost btn-sm" onclick={() => { adding = true; addError = null }}>+ Add environment</button>
          {/if}
        </div>
        <div class="env-list">
          {#if envsLoading}
            <div class="env-empty mono">Loading…</div>
          {:else if envError}
            <div class="env-empty mono" style="color:#e07070">{envError}</div>
          {:else}
            {#each envs as e}
              <div class="env-row">
                <div class="env-dot" class:prod={e === 'production'}></div>
                {#if editingEnv === e}
                  <input
                    class="env-input mono"
                    bind:value={editVal}
                    onkeydown={ev => { if (ev.key === 'Enter') saveRename(e); if (ev.key === 'Escape') cancelEdit() }}
                    autofocus
                  />
                  {#if editError}<span class="inline-err mono">{editError}</span>{/if}
                  <button class="btn btn-primary btn-sm" onclick={() => saveRename(e)}>Save</button>
                  <button class="btn btn-ghost btn-sm" onclick={cancelEdit}>Cancel</button>
                {:else}
                  <span class="env-name mono">{e}</span>
                  <span class="tag mono">{e === 'production' ? 'protected' : 'mutable'}</span>
                  {#if e !== 'production'}
                    <button class="btn btn-ghost btn-sm" onclick={() => startEdit(e)}>Rename</button>
                    <button class="btn btn-danger btn-sm" onclick={() => deletingEnv = e}>Delete</button>
                  {/if}
                {/if}
              </div>
            {/each}
            {#if adding}
              <div class="env-row">
                <div class="env-dot"></div>
                <input
                  class="env-input mono"
                  bind:value={newEnvName}
                  placeholder="environment name"
                  onkeydown={ev => { if (ev.key === 'Enter') submitAdd(); if (ev.key === 'Escape') { adding = false; newEnvName = '' } }}
                  autofocus
                />
                {#if addError}<span class="inline-err mono">{addError}</span>{/if}
                <button class="btn btn-primary btn-sm" onclick={submitAdd}>Add</button>
                <button class="btn btn-ghost btn-sm" onclick={() => { adding = false; newEnvName = ''; addError = null }}>Cancel</button>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>SDK keys</span>
          <button class="btn btn-ghost btn-sm">+ Create key</button>
        </div>
        <div>
          {#each sdkKeys as k, i}
            <div class="key-row" class:last={i === sdkKeys.length - 1}>
              <div class="key-header">
                <div>
                  <div class="key-label">{k.label}</div>
                  <div class="key-tags">
                    <span class="tag mono">{k.env}</span>
                    <span class="tag mono">{k.type}</span>
                  </div>
                </div>
                <div class="key-actions">
                  <span class="last-used mono">last used {k.lastUsed}</span>
                  <button class="btn btn-ghost btn-sm" onclick={() => copyKey(k.id, k.key)}>
                    {copied === k.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button class="btn btn-danger btn-sm">Revoke</button>
                </div>
              </div>
              <div class="key-val mono">{k.key}</div>
            </div>
          {/each}
        </div>
      </div>

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
            <div><button class="btn btn-danger">Archive project</button></div>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Delete project</div>
              <div class="setting-sub mono">Permanently deletes all flags, segments and SDK keys. Not reversible.</div>
            </div>
            <div><button class="btn btn-danger">Delete project</button></div>
          </div>
        </div>
      </div>

    </div>
    {/if}
  </div>
</div>

{#if deletingEnv}
  <ModalDeleteEnv
    envName={deletingEnv}
    projectName={proj?.name ?? ''}
    onConfirm={removeEnv}
    onClose={() => deletingEnv = null}
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
    max-width: 760px;
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

  .owner-text {
    font-size: 13px;
    color: var(--ink-2);
  }

  .env-list {
    padding: 14px 18px;
  }

  .env-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--line);
  }

  .env-row:last-child {
    border-bottom: none;
  }

  .env-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ink-4);
  }

  .env-dot.prod {
    background: var(--accent);
  }

  .env-count {
    color: var(--ink-4);
    margin-left: 6px;
  }

  .env-empty {
    font-size: 12px;
    color: var(--ink-3);
    padding: 16px 0;
    text-align: center;
  }

  .env-input {
    flex: 1;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 5px;
    color: var(--ink);
    font-size: 12px;
    padding: 5px 8px;
    outline: none;
    min-width: 0;
  }

  .inline-err {
    font-size: 11px;
    color: #e07070;
  }

  .env-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    flex: 1;
  }

  .tag {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 2px 6px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--bg-3);
  }

  .key-row {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
  }

  .key-row.last {
    border-bottom: none;
  }

  .key-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .key-label {
    font-weight: 500;
    font-size: 13.5px;
    color: var(--ink);
  }

  .key-tags {
    display: flex;
    gap: 6px;
    margin-top: 5px;
  }

  .key-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .last-used {
    font-size: 11px;
    color: var(--ink-3);
  }

  .key-val {
    font-size: 12px;
    color: var(--ink-3);
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 7px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .btn-danger:hover {
    opacity: 0.75;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
