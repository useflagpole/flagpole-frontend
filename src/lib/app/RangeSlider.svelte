<script lang="ts">
  let {
    min = 0,
    max = 100,
    value = $bindable(),
    oninput,
  }: {
    min?: number
    max?: number
    value: number
    oninput?: () => void
  } = $props()

  let el = $state<HTMLInputElement | null>(null)

  function updateTrack() {
    if (!el) return
    const pct = ((value - min) / (max - min)) * 100
    el.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--line-2) ${pct}%, var(--line-2) 100%)`
  }

  $effect(() => {
    if (el) updateTrack()
  })
</script>

<input
  type="range"
  {min}
  {max}
  bind:value
  bind:this={el}
  oninput={oninput}
  class="slider"
/>

<style>
  .slider {
    width: 100%;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    outline: none;
    background: var(--line-2);
  }

  .slider::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
    background: transparent;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    margin-top: -6px;
  }

  .slider::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: transparent;
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: none;
  }
</style>
