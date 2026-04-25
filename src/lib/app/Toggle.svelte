<script lang="ts">
  let { on, onchange }: { on: boolean; onchange: (v: boolean) => void } = $props()
</script>

<div
  role="switch"
  aria-checked={on}
  tabindex="0"
  class="toggle"
  class:on
  onclick={() => onchange(!on)}
  onkeydown={e => e.key === 'Enter' && onchange(!on)}
>
  <div class="knob"></div>
</div>

<style>
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
</style>
