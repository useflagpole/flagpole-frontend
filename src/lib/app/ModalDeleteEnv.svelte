<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { notify } from '../toasts.svelte'

  let {
    envName,
    projectName,
    onConfirm,
    onClose,
  }: {
    envName: string
    projectName: string
    onConfirm: () => Promise<string | null>
    onClose: () => void
  } = $props()

  let confirmValue = $state('')
  let apiError     = $state<string | null>(null)
  let loading      = $state(false)

  const canDelete = $derived(confirmValue.trim() === envName)

  async function handleDelete() {
    loading = true
    apiError = null
    const err = await onConfirm()
    loading = false
    if (err) { apiError = err; return }
    notify.success('Environment deleted', `"${envName}" has been permanently removed.`)
    onClose()
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={handleOverlayClick} transition:fade={{ duration: 150 }}>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    transition:scale={{ start: 0.96, duration: 180 }}
  >
    <div class="stripe-bar" aria-hidden="true"></div>

    <div class="modal-body">
      <div class="modal-icon" aria-hidden="true">⚠</div>

      <h2 class="modal-title" id="modal-title">Delete environment?</h2>
      <p class="modal-sub">
        This will permanently delete the environment and all its configuration from
        <strong class="proj-name">{projectName}</strong>. This action cannot be undone.
      </p>

      <div class="env-pill">
        <span class="env-dot"></span>
        <span class="env-name">{envName}</span>
      </div>

      <div class="consequences">
        <div class="consequence-item">All flag states and rollout rules for this environment will be erased.</div>
        <div class="consequence-item">SDK keys scoped to this environment will stop working immediately.</div>
        <div class="consequence-item">Audit log entries will be retained but marked as archived.</div>
      </div>

      <label class="confirm-label" for="confirmInput">
        Type <code>{envName}</code> to confirm
      </label>
      <input
        id="confirmInput"
        class="confirm-input"
        type="text"
        placeholder={envName}
        autocomplete="off"
        spellcheck="false"
        bind:value={confirmValue}
      />
      {#if apiError}
        <div class="api-error">{apiError}</div>
      {/if}

      <div class="modal-actions">
        <button class="btn btn-ghost" onclick={onClose}>Cancel</button>
        <button
          class="btn btn-danger"
          disabled={!canDelete || loading}
          onclick={handleDelete}
        >
          {loading ? 'Deleting…' : 'Delete environment'}
        </button>
      </div>
    </div>

    <div class="stripe-bar bottom" aria-hidden="true"></div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 24px;
  }

  .modal {
    width: 100%;
    max-width: 440px;
    background: #121214;
    border: 1px solid #26262a;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .stripe-bar {
    height: 22px;
    background: repeating-linear-gradient(
      -45deg,
      #1e1e21 0px,
      #1e1e21 12px,
      #2c2c30 12px,
      #2c2c30 24px
    );
    border-bottom: 1px solid #333338;
    flex-shrink: 0;
  }

  .stripe-bar.bottom {
    border-bottom: none;
    border-top: 1px solid #333338;
  }

  .modal-body {
    padding: 28px 28px 24px;
  }

  .modal-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(220, 80, 80, 0.12);
    border: 1px solid rgba(220, 80, 80, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    font-size: 18px;
  }

  .modal-title {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
    color: #ededef;
  }

  .modal-sub {
    font-size: 13.5px;
    color: #a4a4ac;
    margin: 0 0 20px;
    line-height: 1.55;
  }

  .proj-name {
    color: #ededef;
    font-weight: 600;
  }

  .env-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #1a1a1d;
    border: 1px solid #333338;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 20px;
  }

  .env-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: oklch(0.78 0.14 65);
    flex-shrink: 0;
  }

  .env-name {
    font: 600 13px 'Geist Mono', ui-monospace, monospace;
    color: #ededef;
    letter-spacing: -0.01em;
  }

  .consequences {
    background: rgba(220, 80, 80, 0.06);
    border: 1px solid rgba(220, 80, 80, 0.15);
    border-radius: 7px;
    padding: 12px 14px;
    margin-bottom: 24px;
  }

  .consequence-item {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font: 400 12.5px 'Geist Mono', ui-monospace, monospace;
    color: #a4a4ac;
    line-height: 1.5;
    margin-bottom: 7px;
  }

  .consequence-item:last-child {
    margin-bottom: 0;
  }

  .consequence-item::before {
    content: '·';
    color: #e07070;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .confirm-label {
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    color: #66666d;
    margin-bottom: 7px;
    display: block;
  }

  .confirm-label code {
    color: #ededef;
    background: #1a1a1d;
    border: 1px solid #26262a;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 11.5px;
  }

  .confirm-input {
    width: 100%;
    background: #0a0a0b;
    border: 1px solid #26262a;
    border-radius: 6px;
    color: #ededef;
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    letter-spacing: -0.01em;
    margin-bottom: 20px;
  }

  .confirm-input:focus {
    border-color: #e07070;
    box-shadow: 0 0 0 3px rgba(220, 80, 80, 0.08);
  }

  .confirm-input::placeholder {
    color: #3f3f45;
  }

  .api-error {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: #e07070;
    margin-top: -14px;
    margin-bottom: 14px;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 16px;
    border-radius: 7px;
    font: 500 13.5px 'Geist', ui-sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
    letter-spacing: -0.01em;
  }

  .btn-ghost {
    background: transparent;
    color: #ededef;
    border-color: #333338;
  }

  .btn-ghost:hover {
    opacity: 0.8;
  }

  .btn-danger {
    background: #c0392b;
    color: #fff;
    border-color: #c0392b;
  }

  .btn-danger:not(:disabled):hover {
    background: #a93226;
  }

  .btn-danger:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
