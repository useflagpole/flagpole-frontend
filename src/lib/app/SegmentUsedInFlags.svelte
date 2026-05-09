<script lang="ts">
  let { flagsUsing }: {
    flagsUsing: { id: number; key: string }[]
  } = $props()
</script>

<div class="panel">
  <div class="panel-bar">
    <span>Used in flags</span>
    <span class="panel-bar-right">{flagsUsing.length}</span>
  </div>
  {#if flagsUsing.length === 0}
    <div class="empty-state small">
      <span class="empty-icon">⚑</span>
      <span class="empty-text mono">Not used in any flags yet</span>
    </div>
  {:else}
    {#each flagsUsing as f, i}
      <div class="flag-link-row" class:last={i === flagsUsing.length - 1}>
        <span class="pill on">on</span>
        <span class="flag-link-key mono">{f.key}</span>
        <span class="flag-link-arrow">→</span>
      </div>
    {/each}
  {/if}
</div>

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

  .panel-bar-right {
    color: var(--ink-2);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .empty-state.small {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 0;
  }

  .empty-icon {
    font-size: 20px;
    color: var(--ink-3);
  }

  .empty-text {
    font-size: 12px;
    color: var(--ink-3);
  }

  .flag-link-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    transition: background 0.12s;
  }

  .flag-link-row:hover {
    background: var(--bg-3);
  }

  .flag-link-row.last {
    border-bottom: none;
  }

  .flag-link-key {
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .flag-link-arrow {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .pill {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
  }

  .pill.on {
    color: var(--accent);
    border-color: var(--accent-line);
    background: var(--accent-dim);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>