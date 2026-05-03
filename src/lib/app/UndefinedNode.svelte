<script lang="ts">
  import FlowNode from './FlowNode.svelte'
</script>

<FlowNode title="Result" icon="∅">
  <div class="undefined-content">
    <div class="undefined-badge">undefined</div>
    <div class="undefined-hint">flag is off</div>
  </div>
</FlowNode>

<style>
  .undefined-content {
    text-align: center;
    padding: 4px 0;
  }

  .undefined-badge {
    font: 600 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-4);
    padding: 4px 12px;
    background: var(--bg-2);
    border: 1px dashed var(--line-2);
    border-radius: 4px;
    display: inline-block;
  }

  .undefined-hint {
    font: 400 9.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-top: 5px;
  }
</style>
