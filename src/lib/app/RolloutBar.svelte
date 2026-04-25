<script lang="ts">
  let { pct, width = 140 }: { pct: number; width?: number } = $props()
</script>

<div class="rollout-bar" style="--w: {width}px">
  <div class="track">
    <div class="fill" style="width: {pct}%"></div>
  </div>
  <span class="label">{pct}%</span>
</div>

<style>
  .rollout-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .track {
    width: var(--w);
    height: 3px;
    background: var(--bg-3);
    border-radius: 99px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .fill {
    height: 100%;
    background: var(--accent);
  }

  .label {
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    min-width: 36px;
  }
</style>
