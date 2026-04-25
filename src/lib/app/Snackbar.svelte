<script lang="ts">
  import { toastStore, type Toast } from '../toasts.svelte'

  const ICONS: Record<Toast['type'], string> = {
    info:    'ℹ',
    success: '✓',
    warning: '⚠',
    error:   '✕',
  }

  const removing = new Set<string>()

  function dismiss(id: string) {
    if (removing.has(id)) return
    removing.add(id)
    const el = document.getElementById('snack-' + id)
    if (!el) { toastStore.remove(id); return }
    el.classList.add('removing')
    el.addEventListener('animationend', () => {
      toastStore.remove(id)
      removing.delete(id)
    }, { once: true })
  }

  function handleAction(toast: Toast) {
    toast.action?.fn()
    dismiss(toast.id)
  }
</script>

<div class="snack-stack" aria-live="polite" aria-label="Notifications">
  {#each toastStore.toasts as toast (toast.id)}
    <div
      id="snack-{toast.id}"
      class="snack snack-{toast.type}"
      role="status"
    >
      <span class="snack-icon" aria-hidden="true">{ICONS[toast.type]}</span>
      <div class="snack-body">
        <div class="snack-title">{toast.title}</div>
        <div class="snack-msg">{toast.message}</div>
      </div>
      {#if toast.action}
        <button class="snack-action" onclick={() => handleAction(toast)}>
          {toast.action.label}
        </button>
      {/if}
      <button class="snack-close" onclick={() => dismiss(toast.id)} aria-label="Dismiss">✕</button>
      <div
        class="snack-progress"
        style="animation-duration: {toast.duration}ms"
        onanimationend={() => dismiss(toast.id)}
      ></div>
    </div>
  {/each}
</div>

<style>
  .snack-stack {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 8px;
    width: max-content;
    max-width: calc(100vw - 32px);
    pointer-events: none;
  }

  .snack {
    pointer-events: all;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 9px;
    border: 1px solid transparent;
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    line-height: 1.5;
    min-width: 300px;
    max-width: 480px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55), 0 1px 4px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    position: relative;
    animation: snackIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .snack.removing {
    animation: snackOut 0.18s ease-in forwards;
  }

  @keyframes snackIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  @keyframes snackOut {
    from { opacity: 1; transform: translateY(0)   scale(1);    }
    to   { opacity: 0; transform: translateY(6px) scale(0.97); }
  }

  .snack-info {
    background: rgba(10, 14, 28, 0.88);
    border-color: rgba(99, 149, 220, 0.28);
  }

  .snack-success {
    background: rgba(8, 18, 14, 0.88);
    border-color: rgba(74, 180, 120, 0.28);
  }

  .snack-warning {
    background: rgba(20, 16, 8, 0.88);
    border-color: rgba(200, 160, 60, 0.28);
  }

  .snack-error {
    background: rgba(20, 8, 8, 0.88);
    border-color: rgba(220, 80, 80, 0.28);
  }

  .snack-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
    font-size: 13px;
  }

  .snack-info    .snack-icon { color: #7da8e8; }
  .snack-success .snack-icon { color: #6dc99a; }
  .snack-warning .snack-icon { color: #c8a844; }
  .snack-error   .snack-icon { color: #e07070; }

  .snack-body {
    flex: 1;
  }

  .snack-title {
    font-weight: 500;
    color: #ededef;
    margin-bottom: 2px;
    letter-spacing: -0.01em;
  }

  .snack-msg {
    color: #a4a4ac;
    font-size: 12px;
  }

  .snack-action {
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 3px;
    transition: opacity 0.15s;
    flex-shrink: 0;
    align-self: center;
    margin-left: 4px;
  }

  .snack-action:hover { opacity: 0.65; }

  .snack-info    .snack-action { color: #7da8e8; }
  .snack-success .snack-action { color: #6dc99a; }
  .snack-warning .snack-action { color: #c8a844; }
  .snack-error   .snack-action { color: #e07070; }

  .snack-close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #3f3f45;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 1px;
    transition: color 0.15s;
  }

  .snack-close:hover { color: #a4a4ac; }

  .snack-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    border-radius: 0 0 9px 9px;
    animation: snackProgress linear forwards;
  }

  .snack-info    .snack-progress { background: #7da8e8; }
  .snack-success .snack-progress { background: #6dc99a; }
  .snack-warning .snack-progress { background: #c8a844; }
  .snack-error   .snack-progress { background: #e07070; }

  @keyframes snackProgress {
    from { width: 100%; }
    to   { width: 0%; }
  }
</style>
