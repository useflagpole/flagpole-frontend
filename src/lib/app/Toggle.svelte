<script lang="ts">
  let { on, onchange, size = 'md', label = '', labelPosition = 'right', class: className = '' }: {
    on: boolean
    onchange: (v: boolean) => void
    size?: 'sm' | 'md'
    label?: string
    labelPosition?: 'left' | 'right'
    class?: string
  } = $props()
</script>

{#if label}
  <span class="wrapper {className}" class:reverse={labelPosition === 'left'} onclick={() => onchange(!on)}>
    {#if labelPosition === 'left'}<span class="label">{label}</span>{/if}
    <div
      role="switch"
      aria-checked={on}
      tabindex="0"
      class="toggle"
      class:on
      class:sm={size === 'sm'}
      onkeydown={e => e.key === 'Enter' && onchange(!on)}
    >
      <div class="knob"></div>
    </div>
    {#if labelPosition === 'right'}<span class="label">{label}</span>{/if}
  </span>
{:else}
  <div
    role="switch"
    aria-checked={on}
    tabindex="0"
    class="toggle"
    class:on
    class:sm={size === 'sm'}
    onclick={() => onchange(!on)}
    onkeydown={e => e.key === 'Enter' && onchange(!on)}
  >
    <div class="knob"></div>
  </div>
{/if}

<style>
  .wrapper {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .label {
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    user-select: none;
  }

  .toggle {
    width: 44px;
    height: 24px;
    border-radius: 99px;
    cursor: pointer;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    position: relative;
    transition: background .2s, border-color .2s;
    flex-shrink: 0;
  }

  .toggle.on {
    background: var(--accent);
    border-color: var(--accent);
  }

  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--ink-3);
    transition: left .2s, background .2s;
  }

  .toggle.on .knob {
    left: 22px;
    background: var(--bg);
  }

  .toggle.sm {
    width: 30px;
    height: 17px;
  }

  .toggle.sm .knob {
    width: 12px;
    height: 12px;
    top: 2px;
    left: 2px;
  }

  .toggle.sm.on .knob {
    left: 15px;
  }
</style>
