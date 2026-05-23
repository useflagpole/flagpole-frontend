<script lang="ts">
  import { fade, scale } from 'svelte/transition'

  let {
    envName,
    onSubmit,
    onClose,
  }: {
    envName:  string
    onSubmit: (name: string, type: 'server' | 'client') => Promise<string | null>
    onClose:  () => void
  } = $props()

  let name    = $state('')
  let keyType = $state<'server' | 'client'>('server')
  let loading = $state(false)
  let error   = $state<string | null>(null)

  async function submit() {
    if (!name.trim()) return
    loading = true; error = null
    const err = await onSubmit(name.trim(), keyType)
    loading = false
    if (err) error = err
    // on success the parent unmounts this component
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) onClose() }} transition:fade={{ duration: 150 }}>
  <div class="modal" role="dialog" aria-modal="true" transition:scale={{ start: 0.96, duration: 180 }}>
    <div class="modal-header">
      <div>
        <div class="modal-title">Create SDK key</div>
        <div class="modal-sub mono">{envName} environment</div>
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <span class="modal-close" onclick={onClose}>×</span>
    </div>

    <div class="modal-body">
      <label class="field-label mono" for="keyName">Key name</label>
      <input
        id="keyName"
        class="field-input mono"
        bind:value={name}
        placeholder="e.g. API workers"
        maxlength={64}
        onkeydown={(ev) => { if (ev.key === 'Enter') submit() }}
      />

      <div class="field-label mono" style="margin-top:14px">Key type</div>
      <div class="type-row">
        {#each (['server', 'client'] as const) as t}
          <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
          <div class="type-option" class:type-option--active={keyType === t} onclick={() => { keyType = t }}>
            <span class="tag mono">{t}</span>
            <span class="type-desc mono">{t === 'server' ? 'Secret, backend only' : 'Public-safe, browser/mobile'}</span>
          </div>
        {/each}
      </div>

      {#if error}
        <div class="field-error mono">{error}</div>
      {/if}

      <div class="modal-actions">
        <button class="btn btn-ghost btn-sm" onclick={onClose}>Cancel</button>
        <button class="btn btn-primary btn-sm" disabled={!name.trim() || loading} onclick={submit}>
          {loading ? 'Creating…' : 'Create key'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay {
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

  .modal {
    width: 100%;
    max-width: 440px;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 10px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
  }

  .modal-title {
    font-weight: 500;
    font-size: 14px;
    color: var(--ink);
  }

  .modal-sub {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .modal-close {
    color: var(--ink-3);
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    user-select: none;
  }

  .modal-close:hover { color: var(--ink); }

  .modal-body { padding: 16px 18px; }

  .field-label {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }

  .field-input {
    width: 100%;
    box-sizing: border-box;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--ink);
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    padding: 9px 12px;
    outline: none;
  }

  .field-input:focus { border-color: var(--line-2); }

  .type-row {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
  }

  .type-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 6px;
    cursor: pointer;
    background: var(--bg);
    transition: border-color 0.1s, background 0.1s;
  }

  .type-option--active {
    border-color: var(--line-2);
    background: var(--bg-3);
  }

  .type-desc {
    font: 400 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .field-error {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: #e07070;
    margin-top: 10px;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
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

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
