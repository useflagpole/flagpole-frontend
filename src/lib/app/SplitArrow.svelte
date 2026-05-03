<script lang="ts">
  let {
    topLabel,
    topActive = true,
    bottomLabel,
  }: {
    topLabel?: string
    topActive?: boolean
    bottomLabel?: string
  } = $props()
</script>

<div class="split-arrow">
  <div class="arrow-row">
    {#if topLabel}<span class="arrow-label active">{topLabel}</span>{/if}
    <svg width="52" height="14" viewBox="0 0 52 14">
      <line x1="2" y1="7" x2="43" y2="7" stroke="var(--accent)" stroke-width="1.5" />
      <polyline
        points="39,3 47,7 39,11"
        fill="none"
        stroke="var(--accent)"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  </div>
  <div class="arrow-row">
    {#if bottomLabel}<span class="arrow-label">{bottomLabel}</span>{/if}
    <svg width="52" height="14" viewBox="0 0 52 14">
      <line x1="2" y1="7" x2="43" y2="7" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 3" />
      <polyline
        points="39,3 47,7 39,11"
        fill="none"
        stroke="var(--line-2)"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  </div>
</div>

<style>
  .split-arrow {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    margin: 0 2px;
    flex-shrink: 0;
  }

  .arrow-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .arrow-label {
    font: 400 9.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    white-space: nowrap;
  }

  .arrow-label.active {
    color: var(--accent);
  }
</style>
