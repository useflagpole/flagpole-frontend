<script lang="ts">
  let { logic, onToggle }: {
    logic: 'AND' | 'OR'
    onToggle: (v: 'AND' | 'OR') => void
  } = $props()
</script>

<div class="connector">
  <div class="connector-line-v" />
  <button class="connector-badge" onclick={() => onToggle(logic === 'AND' ? 'OR' : 'AND')} title="Toggle match type">
    {logic}
  </button>
  <div class="connector-line-h" />
</div>

<style>
  .connector {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    padding-left: 22px;
  }

  .connector-line-v {
    width: 1px;
    height: 18px;
    background: var(--line);
    margin-left: 12px;
  }

  .connector-badge {
    background: var(--bg);
    color: var(--accent);
    border: 1px solid var(--accent-line);
    border-radius: 4px;
    padding: 2px 10px;
    font: 600 10.5px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: 0.12em;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }

  .connector-badge:hover {
    background: var(--bg-3);
  }

  .connector-line-h {
    flex: 1;
    height: 1px;
    background: var(--line);
  }
</style>
