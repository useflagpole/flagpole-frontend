<script lang="ts">
  let {
    detail,
    desc,
    matchType,
    rules,
  }: {
    detail: { id: number; name: string }
    desc: string
    matchType: string
    rules: { attribute: string; operator: string; value: string }[]
  } = $props()

  let open = $state(false)
</script>

<div class="panel">
  <button class="payload-header" onclick={() => open = !open}>
    <span>API representation</span>
    <span class="payload-toggle mono">{open ? '▾' : '▸'} GET</span>
  </button>
  {#if open}
    <pre class="payload-body mono">{JSON.stringify({
      id: detail.id,
      name: detail.name,
      description: desc,
      matchType,
      rules: rules.map((r, i) => ({
        id: i + 1,
        attribute: r.attribute,
        operator: r.operator,
        value: r.value,
      })),
    }, null, 2)}</pre>
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
    max-height: 240px;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>