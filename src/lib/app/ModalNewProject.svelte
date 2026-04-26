<script lang="ts">
  import { fade } from 'svelte/transition'
  import { createProject, type ProjectDTO } from '../api/projects'
  import { orgStore } from '../org.svelte'
  import { notify } from '../toasts.svelte'

  let {
    onClose,
    onCreated,
  }: {
    onClose: () => void
    onCreated: (project: ProjectDTO) => void
  } = $props()

  interface Env { id: number; name: string; locked: boolean }

  let name      = $state('')
  let envs      = $state<Env[]>([
    { id: 1, name: 'production', locked: true  },
    { id: 2, name: 'staging',    locked: false },
    { id: 3, name: 'dev',        locked: false },
  ])
  let nextId    = 4
  let loading   = $state(false)
  let apiError  = $state<string | null>(null)
  let created   = $state<ProjectDTO | null>(null)

  const valid = $derived(
    name.trim().length >= 2 && envs.some(e => e.name.trim().length > 0)
  )

  function addEnv() {
    envs = [...envs, { id: nextId++, name: '', locked: false }]
    // focus happens via bind on the new input via tick, use setTimeout
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.env-input')
      inputs[inputs.length - 1]?.focus()
    }, 0)
  }

  function removeEnv(id: number) {
    envs = envs.filter(e => e.id !== id)
  }

  function updateEnvName(id: number, val: string) {
    envs = envs.map(e => e.id === id ? { ...e, name: val } : e)
  }

  async function handleCreate() {
    if (!valid || loading) return
    const orgId = orgStore.activeId
    if (!orgId) return
    loading = true
    apiError = null
    const envNames = envs.map(e => e.name.trim()).filter(Boolean)
    const r = await createProject(orgId, name.trim(), envNames)
    loading = false
    if (r.ok) {
      created = r.data
      notify.success('Project created', `"${r.data.name}" is ready.`)
    } else if (r.status === 422) {
      apiError = r.message
      notify.error('Project limit reached', 'Organizations are limited to 2 projects.')
    } else {
      apiError = r.message
      notify.error('Create failed', r.message)
    }
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overlay" onclick={handleOverlayClick} transition:fade={{ duration: 150 }}>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">

    {#if created}
      <!-- confirmation state -->
      <div class="confirm-body">
        <div class="confirm-flag" aria-hidden="true">
          <div class="flag-pole"></div>
          <div class="flag-pennant"></div>
        </div>
        <div class="confirm-eyebrow">Project created</div>
        <div class="confirm-name">{created.name}</div>
        <div class="confirm-envs">
          {#each (JSON.parse(created.environments) as string[]) as e}
            <span class="env-pill">{e}</span>
          {/each}
        </div>
        <button class="btn btn-primary" onclick={() => onCreated(created!)}>
          Go to project →
        </button>
      </div>

    {:else}
      <!-- form state -->
      <div class="dialog-header">
        <div class="dialog-title">
          <span class="title-icon" aria-hidden="true">⊞</span>
          <span id="dialog-title">New project</span>
        </div>
        <button class="close-btn" onclick={onClose} aria-label="Close">✕</button>
      </div>

      <div class="dialog-body">
        <div class="field">
          <label class="label" for="proj-name">
            Project name
            <span class="label-hint">required</span>
          </label>
          <input
            id="proj-name"
            class="text-input"
            type="text"
            placeholder="e.g. web-app"
            autocomplete="off"
            spellcheck="false"
            bind:value={name}
          />
        </div>

        <div class="field">
          <div class="env-label-row">
            <span class="label" style="margin:0">
              Environments
              <span class="label-hint">at least one</span>
            </span>
          </div>
          <div class="env-list">
            {#each envs as env (env.id)}
              <div class="env-row">
                <span
                  class="env-dot"
                  class:prod={env.name.trim() === 'production'}
                ></span>
                <input
                  class="text-input env-input"
                  type="text"
                  placeholder="environment name"
                  autocomplete="off"
                  spellcheck="false"
                  value={env.name}
                  readonly={env.locked}
                  style={env.locked ? 'color:#66666d;cursor:default' : ''}
                  oninput={(e) => updateEnvName(env.id, (e.target as HTMLInputElement).value)}
                />
                <button
                  class="env-remove"
                  onclick={() => removeEnv(env.id)}
                  disabled={env.locked}
                  aria-label="Remove"
                >✕</button>
              </div>
            {/each}
          </div>
          <button class="add-env" onclick={addEnv}>+ Add environment</button>
        </div>
      </div>

      {#if apiError}
        <div class="api-error">{apiError}</div>
      {/if}

      <div class="dialog-footer">
        <button class="btn btn-ghost" onclick={onClose}>Cancel</button>
        <button
          class="btn btn-primary"
          disabled={!valid || loading}
          onclick={handleCreate}
        >{loading ? 'Creating…' : 'Create project'}</button>
      </div>
    {/if}

  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 24px;
  }

  .dialog {
    width: 100%;
    max-width: 480px;
    background: #121214;
    border: 1px solid #26262a;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(0, 0, 0, 0.5);
    animation: dialogIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes dialogIn {
    from { opacity: 0; transform: scale(0.97) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }

  /* header */
  .dialog-header {
    padding: 20px 22px 16px;
    border-bottom: 1px solid #26262a;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dialog-title {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.015em;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .title-icon {
    width: 22px;
    height: 22px;
    background: rgba(229, 90, 1, 0.12);
    border: 1px solid rgba(229, 90, 1, 0.25);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: #e55a01;
    flex-shrink: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #3f3f45;
    font-size: 16px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
  }

  .close-btn:hover { color: #a4a4ac; background: #1a1a1d; }

  /* body */
  .dialog-body { padding: 22px 22px 0; }

  .field { margin-bottom: 20px; }

  .label {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font: 500 13px 'Geist', ui-sans-serif;
    color: #ededef;
    margin-bottom: 7px;
  }

  .label-hint {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: #66666d;
  }

  /* inputs */
  .text-input {
    width: 100%;
    background: #0a0a0b;
    border: 1px solid #26262a;
    border-radius: 7px;
    color: #ededef;
    font: 400 13.5px 'Geist Mono', ui-monospace, monospace;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    letter-spacing: -0.01em;
  }

  .text-input:focus {
    border-color: rgba(229, 90, 1, 0.5);
    box-shadow: 0 0 0 3px rgba(229, 90, 1, 0.08);
  }

  .text-input::placeholder { color: #3f3f45; }

  /* environments */
  .env-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .env-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .env-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .env-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3f3f45;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .env-dot.prod { background: #e55a01; }

  .env-input {
    flex: 1;
    padding: 9px 12px;
    font-size: 13px;
  }

  .env-remove {
    background: transparent;
    border: none;
    color: #3f3f45;
    font-size: 14px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .env-remove:hover { color: #e07070; }
  .env-remove:disabled { opacity: 0; pointer-events: none; }

  .add-env {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    background: transparent;
    border: 1px dashed #26262a;
    border-radius: 6px;
    color: #66666d;
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    padding: 7px 12px;
    cursor: pointer;
    margin-top: 2px;
    transition: border-color 0.15s, color 0.15s;
  }

  .add-env:hover { border-color: #333338; color: #a4a4ac; }

  /* footer */
  .dialog-footer {
    padding: 18px 22px 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #26262a;
    margin-top: 22px;
  }

  .api-error {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: #e07070;
    padding: 0 22px;
    margin-top: 12px;
  }

  /* buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 7px;
    font: 500 13.5px 'Geist', ui-sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s;
    letter-spacing: -0.01em;
  }

  .btn-ghost {
    background: transparent;
    color: #ededef;
    border-color: #333338;
  }

  .btn-ghost:hover { opacity: 0.8; }

  .btn-primary {
    background: #ededef;
    color: #0a0a0b;
  }

  .btn-primary:not(:disabled):hover { opacity: 0.88; }

  .btn-primary:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* confirmation state */
  .confirm-body {
    padding: 40px 28px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .confirm-flag {
    width: 36px;
    height: 36px;
    position: relative;
    margin-bottom: 20px;
  }

  .flag-pole {
    position: absolute;
    left: 17px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #ededef;
    border-radius: 2px;
  }

  .flag-pennant {
    position: absolute;
    left: 20px;
    top: 4px;
    width: 16px;
    height: 10px;
    background: #e55a01;
    clip-path: polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%);
  }

  .confirm-eyebrow {
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: #e55a01;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 10px;
  }

  .confirm-name {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .confirm-envs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    margin-bottom: 24px;
  }

  .env-pill {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    background: #1a1a1d;
    border: 1px solid #26262a;
    border-radius: 4px;
    padding: 2px 8px;
    color: #a4a4ac;
  }
</style>
