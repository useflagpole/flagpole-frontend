<script lang="ts">
  let { title, subtitle, variant = 'default', overflow = 'hidden', class: className = '' }: {
    title?: string
    subtitle?: string
    variant?: 'default' | 'danger'
    overflow?: 'hidden' | 'visible'
    class?: string
  } = $props()
</script>

<div class="panel {className}" class:danger-panel={variant === 'danger'} style="overflow: {overflow};">
  {#if title}
    <div class="panel-bar">
      <span>
        {title}
        {#if subtitle}<span class="panel-subtitle">{subtitle}</span>{/if}
      </span>
      <slot name="actions" />
    </div>
  {/if}
  <slot />
</div>

<style>
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  .danger-panel { border-color: #7a3333; }

  .panel-bar {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .panel-subtitle {
    color: var(--ink-4);
    margin-left: 6px;
  }
</style>
