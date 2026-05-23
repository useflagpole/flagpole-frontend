<script lang="ts">
  import { notify } from '../toasts.svelte'
  import { type EnvironmentDTO } from '../api/environments'
  import {
    listSDKKeys,
    createSDKKey,
    revokeSDKKey,
    revealSDKKey,
    type SDKKeyDTO,
  } from '../api/sdk_keys'
  import SdkKeyCard from './SdkKeyCard.svelte'
  import ModalCreateSdkKey from './ModalCreateSdkKey.svelte'
  import ModalRevealSdkKey, { type RevealState } from './ModalRevealSdkKey.svelte'

  let {
    orgId,
    projId,
    envs,
    currentUserEmail,
    onCreateEnv,
    onRenameEnv,
    onDeleteEnv,
    onEnvsChanged,
  }: {
    orgId:            number
    projId:           number
    envs:             EnvironmentDTO[]
    currentUserEmail: string
    onCreateEnv:      (name: string) => Promise<EnvironmentDTO[] | null>
    onRenameEnv:      (env: EnvironmentDTO) => void
    onDeleteEnv:      (env: EnvironmentDTO) => void
    onEnvsChanged:    (envs: EnvironmentDTO[]) => void
  } = $props()

  let selectedEnvId = $state<number>(envs[0]?.id ?? 0)
  let creatingEnv   = $state(false)
  let newEnvName    = $state('')
  let addLoading    = $state(false)

  const selectedEnv = $derived(envs.find(e => e.id === selectedEnvId) ?? envs[0] ?? null)

  $effect(() => {
    if (selectedEnvId && !envs.find(e => e.id === selectedEnvId)) {
      selectedEnvId = envs[0]?.id ?? 0
    }
  })

  async function submitNewEnv() {
    if (!newEnvName.trim()) return
    addLoading = true
    const updated = await onCreateEnv(newEnvName.trim())
    addLoading = false
    if (updated) {
      const created = updated.find(e => e.name === newEnvName.trim())
      onEnvsChanged(updated)
      if (created) selectedEnvId = created.id
      newEnvName = ''; creatingEnv = false
    }
  }

  let sdkKeys:   SDKKeyDTO[] = $state([])
  let keysLoaded = $state(false)

  $effect(() => {
    if (orgId && projId) {
      keysLoaded = false
      listSDKKeys(orgId, projId).then(r => {
        if (r.ok) sdkKeys = r.data
        keysLoaded = true
      })
    }
  })

  const envKeys   = $derived(selectedEnv ? sdkKeys.filter(k => k.environmentId === selectedEnv.id) : [])
  const totalKeys = $derived(sdkKeys.length)

  let revealedKeys: Record<number, string> = $state({})
  let shown:        Record<number, boolean> = $state({})
  let keyLoading:   Record<number, boolean> = $state({})
  let copied:       number | null           = $state(null)
  let revoking:     number | null           = $state(null)

  async function ensureRevealed(k: SDKKeyDTO): Promise<string | null> {
    if (revealedKeys[k.id]) return revealedKeys[k.id]
    keyLoading = { ...keyLoading, [k.id]: true }
    const r = await revealSDKKey(orgId, projId, k.id)
    keyLoading = { ...keyLoading, [k.id]: false }
    if (!r.ok) { notify.error('Reveal failed', r.message); return null }
    revealedKeys = { ...revealedKeys, [k.id]: r.data.key }
    return r.data.key
  }

  async function handleShow(k: SDKKeyDTO) {
    if (shown[k.id]) { shown = { ...shown, [k.id]: false }; return }
    const key = await ensureRevealed(k)
    if (key) shown = { ...shown, [k.id]: true }
  }

  async function handleCopy(k: SDKKeyDTO) {
    const key = await ensureRevealed(k)
    if (!key) return
    navigator.clipboard?.writeText(key).catch(() => {})
    copied = k.id
    setTimeout(() => { copied = null }, 1800)
  }

  async function handleRevoke(keyId: number) {
    revoking = keyId
    const r = await revokeSDKKey(orgId, projId, keyId)
    revoking = null
    if (r.ok) {
      sdkKeys = sdkKeys.map(k => k.id === keyId ? { ...k, revokedAt: new Date().toISOString() } : k)
      notify.success('Key revoked', 'The SDK key has been permanently revoked.')
    } else {
      notify.error('Revoke failed', r.message)
    }
  }

  let creatingKey:    boolean = $state(false)
  let revealDialogKey: RevealState | null = $state(null)

  async function handleCreateKey(name: string, type: 'server' | 'client'): Promise<string | null> {
    if (!selectedEnv) return 'No environment selected'
    const r = await createSDKKey(orgId, projId, selectedEnv.id, type, name)
    if (!r.ok) return r.message
    const prefix = r.data.type === 'server' ? 'fp_srv_' : 'fp_cli_'
    const newEntry: SDKKeyDTO = { ...r.data, keyHint: prefix + r.data.key.slice(-4) }
    sdkKeys = [...sdkKeys, newEntry]
    revealedKeys = { ...revealedKeys, [r.data.id]: r.data.key }
    creatingKey = false
    revealDialogKey = {
      label:     r.data.name,
      keyType:   r.data.type,
      envName:   r.data.environmentName,
      fullKey:   r.data.key,
      createdAt: r.data.createdAt,
    }
    return null
  }

  function envColor(name: string) {
    if (name === 'production') return '#E55A01'
    if (name === 'staging')    return '#8fa8e8'
    return '#74c99a'
  }
</script>

<div class="panel">
  <div class="panel-bar">
    <span>Environments &amp; access</span>
    <span class="panel-bar-meta">{envs.length} env{envs.length === 1 ? '' : 's'} · {totalKeys} key{totalKeys === 1 ? '' : 's'}</span>
  </div>

  <div class="env-panel-grid">

    <div class="env-rail">
      <div class="rail-heading">Environments</div>

      {#each envs as e (e.id)}
        {@const active = e.id === selectedEnvId}
        {@const kCount = sdkKeys.filter(k => k.environmentId === e.id).length}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
          class="rail-row"
          class:rail-row--active={active}
          onclick={() => { selectedEnvId = e.id; creatingEnv = false }}
        >
          <div class="rail-row-top">
            <span class="env-dot" style="background:{envColor(e.name)}"></span>
            <span class="rail-name" class:rail-name--active={active}>{e.name}</span>
            <span class="rail-count">{kCount}</span>
          </div>
          <div class="rail-sub">
            {kCount === 0 ? 'no keys yet' : kCount === 1 ? '1 key' : `${kCount} keys`}{#if e.name === 'production'}<span class="rail-protected"> · protected</span>{/if}
          </div>
        </div>
      {/each}

      <div class="rail-divider"></div>

      {#if !creatingEnv}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="rail-new-idle" onclick={() => { creatingEnv = true; newEnvName = '' }}>
          <span class="new-env-dot"></span>
          <span class="rail-new-label">+ new env</span>
        </div>
      {:else}
        <div class="rail-new-form">
          <!-- svelte-ignore a11y_autofocus -->
          <input
            class="env-name-input mono"
            value={newEnvName}
            placeholder="env name"
            autofocus
            oninput={(ev) => { newEnvName = (ev.target as HTMLInputElement).value.toLowerCase().replace(/[^a-z0-9-]/g, '') }}
            onkeydown={(ev) => {
              if (ev.key === 'Escape') { creatingEnv = false }
              if (ev.key === 'Enter' && newEnvName.trim()) submitNewEnv()
            }}
          />
          <div class="rail-new-btns">
            <button class="btn btn-primary btn-sm rail-create-btn" disabled={addLoading || !newEnvName.trim()} onclick={submitNewEnv}>
              {addLoading ? '…' : 'Create'}
            </button>
            <button class="btn btn-ghost btn-sm" onclick={() => { creatingEnv = false; newEnvName = '' }}>Cancel</button>
          </div>
        </div>
      {/if}
    </div>

    {#if selectedEnv}
      {@const isProd = selectedEnv.name === 'production'}
      <div class="detail-pane">

        <div class="env-header">
          <span class="env-dot env-dot--lg" style="background:{envColor(selectedEnv.name)}"></span>
          <div class="env-header-info">
            <div class="env-header-name">
              {selectedEnv.name}
              <span class="tag mono">{isProd ? 'protected' : 'mutable'}</span>
            </div>
            <div class="env-header-sub">{envKeys.length} SDK key{envKeys.length === 1 ? '' : 's'}</div>
          </div>
          <div class="env-header-actions">
            {#if !isProd}
              <button class="btn btn-ghost btn-sm" onclick={() => onRenameEnv(selectedEnv)}>Rename</button>
              <button class="btn btn-danger btn-sm" onclick={() => onDeleteEnv(selectedEnv)}>Delete env</button>
            {/if}
          </div>
        </div>

        <div class="keys-inset">
          <div class="keys-top-row">
            <span class="keys-label">SDK Keys</span>
            <button class="btn btn-ghost btn-sm" onclick={() => { creatingKey = true }}>+ Create key</button>
          </div>

          {#if !keysLoaded}
            <div class="keys-empty-state">
              <div class="keys-empty-text">Loading…</div>
            </div>
          {:else if envKeys.length === 0}
            <div class="keys-empty-state">
              <div class="keys-empty-text">No SDK keys in <span class="empty-env-name">{selectedEnv.name}</span> yet.</div>
              <button class="btn btn-primary btn-sm" onclick={() => { creatingKey = true }}>Create the first one</button>
            </div>
          {:else}
            <div class="key-list">
              {#each envKeys as k (k.id)}
                <SdkKeyCard
                  {k}
                  shown={!!shown[k.id] && !!revealedKeys[k.id]}
                  loading={!!keyLoading[k.id]}
                  copied={copied === k.id}
                  revoking={revoking === k.id}
                  revealedKey={revealedKeys[k.id]}
                  onShow={() => handleShow(k)}
                  onCopy={() => handleCopy(k)}
                  onRevoke={() => handleRevoke(k.id)}
                />
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

{#if creatingKey && selectedEnv}
  <ModalCreateSdkKey
    envName={selectedEnv.name}
    onSubmit={handleCreateKey}
    onClose={() => { creatingKey = false }}
  />
{/if}

{#if revealDialogKey}
  <ModalRevealSdkKey
    reveal={revealDialogKey}
    {currentUserEmail}
    onClose={() => { revealDialogKey = null }}
  />
{/if}

<style>
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
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

  .panel-bar-meta {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .env-panel-grid {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 360px;
  }

  .env-rail {
    border-right: 1px solid var(--line);
    padding: 8px;
    background: var(--bg-2);
  }

  .rail-heading {
    font: 500 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 6px 8px 8px;
  }

  .rail-row {
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 5px;
    border: 1px solid transparent;
    margin-bottom: 2px;
    transition: background 0.1s;
  }

  .rail-row:hover:not(.rail-row--active) { background: var(--bg-3); }

  .rail-row--active {
    background: var(--bg-3);
    border-color: var(--line-2);
  }

  .rail-row-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .env-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-block;
  }

  .env-dot--lg {
    width: 10px;
    height: 10px;
  }

  .rail-name {
    font: 500 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rail-name--active { color: var(--ink); }

  .rail-count {
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .rail-sub {
    font: 400 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-top: 4px;
    margin-left: 16px;
  }

  .rail-protected { color: #E55A01; }

  .rail-divider {
    border-top: 1px solid var(--line);
    margin: 8px 0;
  }

  .rail-new-idle {
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-3);
    transition: background 0.1s;
  }

  .rail-new-idle:hover { background: var(--bg-3); }

  .new-env-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px dashed var(--line-2);
    flex-shrink: 0;
  }

  .rail-new-label {
    font: 500 12.5px 'Geist Mono', ui-monospace, monospace;
  }

  .rail-new-form { padding: 8px 10px; }

  .env-name-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 5px;
    color: var(--ink);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    padding: 6px 8px;
    outline: none;
    margin-bottom: 6px;
  }

  .rail-new-btns { display: flex; gap: 4px; }

  .rail-create-btn { flex: 1; }

  .detail-pane {
    display: flex;
    flex-direction: column;
  }

  .env-header {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-2);
  }

  .env-header-info { flex: 1; min-width: 0; }

  .env-header-name {
    font: 500 14px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .env-header-sub {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .env-header-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .keys-inset {
    background: var(--bg);
    padding: 16px;
    flex: 1;
  }

  .keys-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .keys-label {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .keys-empty-state {
    padding: 36px 18px;
    text-align: center;
    background: var(--bg-2);
    border: 1px dashed var(--line-2);
    border-radius: 8px;
  }

  .keys-empty-text {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-bottom: 12px;
  }

  .empty-env-name { color: var(--ink-2); }

  .key-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tag {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 2px 6px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--bg-3);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 6px;
    font: 500 13.5px 'Geist', ui-sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-sm { font-size: 12px; padding: 5px 10px; }

  .btn-primary {
    background: var(--ink);
    color: var(--bg);
    border-color: var(--ink);
  }

  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.35; cursor: default; }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover:not(:disabled) { border-color: var(--ink); }
  .btn-ghost:disabled { opacity: 0.35; cursor: default; }

  .btn-danger {
    background: transparent;
    color: #e07070;
    border-color: #7a3333;
  }

  .btn-danger:hover:not(:disabled) { opacity: 0.75; }
  .btn-danger:disabled { opacity: 0.35; cursor: default; }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
