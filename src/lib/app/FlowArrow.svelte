<script lang="ts">
  let {
    active = true,
    label,
    dashed = false,
  }: {
    active?: boolean
    label?: string
    dashed?: boolean
  } = $props()
</script>

<div class="arrow">
  {#if label}<span class="arrow-label" class:active>{label}</span>{/if}
  <svg width="44" height="14" viewBox="0 0 44 14">
    <line
      x1="2" y1="7" x2="36" y2="7"
      stroke={active ? 'var(--accent)' : 'var(--line-2)'}
      stroke-width="1.5"
      stroke-dasharray={dashed ? '4 3' : 'none'}
      style="transition: stroke 0.25s ease"
    />
    <polyline
      points="32,3 40,7 32,11"
      fill="none"
      stroke={active ? 'var(--accent)' : 'var(--line-2)'}
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
      style="transition: stroke 0.25s ease"
    />
  </svg>
</div>

<style>
  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin: 0 2px;
    flex-shrink: 0;
  }

  .arrow-label {
    font: 400 9px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    white-space: nowrap;
    transition: color 0.25s ease;
  }

  .arrow-label.active {
    color: var(--accent);
  }
</style>
