<script lang="ts">
  import { type SDKKeyDTO } from '../api/sdk_keys'

  let {
    k,
    shown,
    loading,
    copied,
    revoking,
    revealedKey,
    onShow,
    onCopy,
    onRevoke,
  }: {
    k:           SDKKeyDTO
    shown:       boolean
    loading:     boolean
    copied:      boolean
    revoking:    boolean
    revealedKey: string | undefined
    onShow:      () => void
    onCopy:      () => void
    onRevoke:    () => void
  } = $props()

  const isRevoked = $derived(!!k.revokedAt)

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatLastUsed(iso: string | null) {
    if (!iso) return 'never'
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'just now'
    if (m < 60) return `${m} min ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const hintPrefix = $derived(k.keyHint.slice(0, -4))
  const hintSuffix = $derived(k.keyHint.slice(-4))
  const displayName = $derived(k.name.replace(`${k.environmentName} — `, ''))
</script>

<div class="key-card" class:key-card--revoked={isRevoked}>
  <div class="key-card-top">
    <div class="key-card-meta">
      <div class="key-card-label-row">
        <span class="key-card-name">{displayName}</span>
        <span class="tag mono">{k.type}</span>
        {#if isRevoked}<span class="tag tag--revoked mono">revoked</span>{/if}
      </div>
      <div class="key-card-sub mono">
        created {formatDate(k.createdAt)} · last used {formatLastUsed(k.lastUsedAt)}
      </div>
    </div>
    {#if !isRevoked}
      <div class="key-card-actions">
        <button class="btn btn-ghost btn-sm" disabled={loading} onclick={onShow}>
          {loading ? '…' : shown ? 'Hide' : 'Show'}
        </button>
        <button class="btn btn-ghost btn-sm" onclick={onCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button class="btn btn-danger btn-sm" disabled={revoking} onclick={onRevoke}>
          {revoking ? '…' : 'Revoke'}
        </button>
      </div>
    {/if}
  </div>

  <div class="key-chip mono" class:key-chip--shown={shown && !!revealedKey}>
    {#if shown && revealedKey}
      {revealedKey}
    {:else}
      <span class="key-prefix">{hintPrefix}</span><span class="key-bullets">••••••••</span>{hintSuffix}
    {/if}
  </div>
</div>

<style>
  .key-card {
    padding: 12px 14px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 8px;
  }

  .key-card--revoked { opacity: 0.55; }

  .key-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .key-card-meta { flex: 1; min-width: 0; }

  .key-card-label-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .key-card-name {
    font-weight: 500;
    font-size: 13px;
    color: var(--ink);
  }

  .key-card-sub {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .key-card-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .key-chip {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 6px 9px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .key-chip--shown { color: var(--ink-2); }

  .key-prefix { color: var(--ink-4); }

  .key-bullets { letter-spacing: 0.15em; }

  .tag {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 2px 6px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--bg-3);
  }

  .tag--revoked {
    color: #e07070;
    border-color: #7a3333;
    background: transparent;
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
