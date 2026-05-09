<script lang="ts">
  import { COMMON_ATTRS } from '../api/flags'

  let {
    onAdd,
  }: {
    onAdd: (preset: { attribute?: string; operator?: string; value?: string }) => void
  } = $props()
</script>

<div class="panel">
  <div class="panel-bar">
    <span>Common attributes</span>
    <span class="panel-bar-right">click to add</span>
  </div>
  <div class="suggestions-body">
    {#each COMMON_ATTRS as a}
      <button class="suggestion-chip" onclick={() => onAdd({ attribute: a.name })} title={a.example}>
        {a.name}
      </button>
    {/each}
  </div>
</div>

<style>
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: visible;
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
  }

  .suggestions-body {
    padding: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .suggestion-chip {
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-2);
    border-radius: 4px;
    padding: 4px 8px;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    cursor: pointer;
    transition: all 0.12s;
  }

  .suggestion-chip:hover {
    border-color: var(--accent-line);
    color: var(--accent);
  }
</style>