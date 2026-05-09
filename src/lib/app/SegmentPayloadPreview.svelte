<script lang="ts">
  let {
    payload,
  }: {
    payload: Record<string, unknown>
  } = $props()

  let open = $state(false)
</script>

<div class="panel">
  <button class="payload-header" onclick={() => open = !open}>
    <span>API request</span>
    <span class="payload-toggle mono">{open ? '▾' : '▸'} POST</span>
  </button>
  {#if open}
    <pre class="payload-body mono">{JSON.stringify(payload, null, 2)}</pre>
  {/if}
</div>

<style>
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  .payload-header {
    padding: 10px 14px;
    border-bottom: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
  }

  .payload-toggle {
    color: var(--ink-2);
  }

  .payload-body {
    margin: 0;
    padding: 12px 14px;
    font-size: 11px;
    color: var(--ink-2);
    background: var(--bg);
    line-height: 1.5;
    white-space: pre;
    overflow-x: auto;
    max-height: 260px;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>