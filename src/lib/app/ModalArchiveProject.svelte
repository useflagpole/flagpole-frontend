<script lang="ts">
  import { fade, scale } from 'svelte/transition'

  let {
    projectName,
    onConfirm,
    onClose,
  }: {
    projectName: string
    onConfirm: () => Promise<string | null>
    onClose: () => void
  } = $props()

  let apiError = $state<string | null>(null)
  let loading  = $state(false)

  async function handleArchive() {
    loading  = true
    apiError = null
    const err = await onConfirm()
    loading = false
    if (err) { apiError = err; return }
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
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
      <div class="modal-icon" aria-hidden="true"><span class="icon-glyph">✉</span></div>

      <h2 class="modal-title" id="modal-title">Archive project?</h2>
      <p class="modal-sub">
        This will archive <strong class="proj-name">{projectName}</strong> and disable all its
        feature flags. You can unarchive it at any time from project settings.
      </p>

      <div class="consequences">
        <div class="consequence-item">All feature flags in this project will be disabled.</div>
        <div class="consequence-item">SDK keys will stop returning flag values.</div>
        <div class="consequence-item">Project data is preserved and fully recoverable.</div>
      </div>

      {#if apiError}
        <div class="api-error">{apiError}</div>
      {/if}

      <div class="modal-actions">
        <button class="btn btn-ghost" onclick={onClose}>Cancel</button>
        <button
          class="btn btn-warning"
          disabled={loading}
          onclick={handleArchive}
        >
          {loading ? 'Archiving…' : 'Archive project'}
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
    background: rgba(200, 130, 30, 0.12);
    border: 1px solid rgba(200, 130, 30, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    font-size: 22px;
    line-height: 1;
    color: #c88020;
  }

  .icon-glyph {
    display: block;
    transform: translateY(-2px);
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

  .consequences {
    background: rgba(200, 130, 30, 0.06);
    border: 1px solid rgba(200, 130, 30, 0.2);
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
    color: #c88020;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .api-error {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: #e07070;
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

  .btn-warning {
    background: #c88020;
    color: #fff;
    border-color: #c88020;
  }

  .btn-warning:not(:disabled):hover {
    background: #a86e18;
  }

  .btn-warning:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
