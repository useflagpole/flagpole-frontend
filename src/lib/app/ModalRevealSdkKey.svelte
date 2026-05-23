<script lang="ts">
  import { fade, scale } from 'svelte/transition'

  export type RevealState = {
    label:     string
    keyType:   'server' | 'client'
    envName:   string
    fullKey:   string
    createdAt: string
  }

  let {
    reveal,
    currentUserEmail,
    onClose,
  }: {
    reveal:           RevealState
    currentUserEmail: string
    onClose:          () => void
  } = $props()

  let copied = $state(false)

  function copyKey() {
    navigator.clipboard?.writeText(reveal.fullKey).catch(() => {})
    copied = true
    setTimeout(() => { copied = false }, 1800)
  }

  function envColor(name: string) {
    if (name === 'production') return '#E55A01'
    if (name === 'staging')    return '#8fa8e8'
    return '#74c99a'
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) onClose() }} transition:fade={{ duration: 150 }}>
  <div class="modal" role="dialog" aria-modal="true" transition:scale={{ start: 0.96, duration: 180 }}>
    <div class="modal-header">
      <div>
        <div class="modal-title">Key created</div>
        <div class="modal-sub mono">{reveal.envName} · {reveal.keyType} · ready to use</div>
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <span class="modal-close" onclick={onClose}>×</span>
    </div>

    <div class="modal-body">
      <div class="eyebrow mono">Key</div>
      <div class="key-block mono">{reveal.fullKey}</div>

      <div class="key-actions">
        <button class="btn btn-primary btn-sm" onclick={copyKey}>
          {copied ? '✓ Copied' : 'Copy key'}
        </button>
        <button class="btn btn-ghost btn-sm">Download .env</button>
      </div>

      <div class="meta">
        <div class="meta-row">
          <span class="meta-label mono">Environment</span>
          <span class="meta-val">
            <span class="env-dot" style="background:{envColor(reveal.envName)}"></span>
            {reveal.envName}
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-label mono">Type</span>
          <span class="meta-val">{reveal.keyType}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label mono">Created by</span>
          <span class="meta-val">{currentUserEmail}</span>
        </div>
      </div>

      <div class="footer-actions">
        <button class="btn btn-primary btn-sm" onclick={onClose}>Done</button>
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
    max-width: 520px;
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

  .eyebrow {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .key-block {
    font: 500 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
    background: var(--bg);
    border: 1px solid var(--line-2);
    border-radius: 6px;
    padding: 12px 14px;
    word-break: break-all;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .key-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }

  .meta {
    border-top: 1px solid var(--line);
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .meta-label {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .meta-val {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--ink-2);
  }

  .env-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-block;
  }

  .footer-actions {
    display: flex;
    justify-content: flex-end;
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

  .btn-primary:hover { opacity: 0.85; }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover { border-color: var(--ink); }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
