<script lang="ts">
  let { value, onchange }: {
    value: string
    onchange: (v: string) => void
  } = $props()
</script>

<div class="bool-editor">
  {#each ['false', 'true'] as v}
    {@const active = value === v || (value === '' && v === 'false')}
    <button
      class="bool-btn"
      class:active
      class:true-active={active && v === 'true'}
      onclick={() => onchange(v)}
    >{v}</button>
  {/each}
</div>

<style>
  .bool-editor {
    display: flex;
    gap: 4px;
  }

  .bool-btn {
    flex: 1;
    padding: 4px 0;
    border-radius: 4px;
    cursor: pointer;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    background: var(--bg);
    border: 1px solid var(--line);
    color: var(--ink-3);
    transition: all 0.15s;
  }

  .bool-btn.active {
    background: var(--bg-2);
    border-color: var(--line-2);
    color: var(--ink);
  }

  .bool-btn.true-active {
    background: var(--accent-dim);
    border-color: var(--accent-line);
    color: var(--accent);
  }

  .bool-btn:hover:not(.active) {
    border-color: var(--line-2);
  }
</style>
