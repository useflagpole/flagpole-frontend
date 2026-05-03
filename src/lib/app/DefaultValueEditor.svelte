<script lang="ts">
  let { type, value, onchange }: {
    type: 'bool' | 'string' | 'number'
    value: string
    onchange: (v: string) => void
  } = $props()
</script>

{#if type === 'bool'}
  <div class="bool-editor">
    {#each ['false', 'true'] as v}
      {@const active = value === v || (value === '' && v === 'false')}
      <button
        class="bool-btn"
        class:active
        class:true-active={active && v === 'true'}
        onclick={() => onchange(v)}
      >{v}</button>
    {/each}
  </div>
{:else if type === 'string'}
  <div class="input-wrapper">
    <input
      class="text-input"
      type="text"
      bind:value
      oninput={() => onchange(value.slice(0, 50))}
      placeholder="(empty string)"
      maxlength={50}
    />
    <span class="char-count" class:warn={value.length > 40}>{value.length}/50</span>
  </div>
{:else}
  <input
    class="text-input"
    type="text"
    bind:value
    oninput={() => onchange(value.replace(/[^0-9.\-]/g, ''))}
    placeholder="0"
  />
{/if}

<style>
  .bool-editor {
    display: flex;
    gap: 6px;
  }

  .bool-btn {
    flex: 1;
    padding: 7px 0;
    border-radius: 6px;
    cursor: pointer;
    font: 500 13px 'Geist Mono', ui-monospace, monospace;
    background: var(--bg);
    border: 1px solid var(--line);
    color: var(--ink-3);
    transition: all .15s;
  }

  .bool-btn.active {
    background: var(--bg-3);
    border-color: var(--line-2);
    color: var(--ink);
  }

  .bool-btn.true-active {
    background: var(--accent-dim);
    border-color: var(--accent-line);
    color: var(--accent);
  }

  .bool-btn:hover:not(.active) {
    border-color: var(--line-2);
  }

  .input-wrapper {
    position: relative;
  }

  .text-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 8px 11px;
    color: var(--ink);
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    outline: none;
    box-sizing: border-box;
    transition: border-color .15s;
  }

  .text-input:focus {
    border-color: var(--line-2);
  }

  .text-input::placeholder {
    color: var(--ink-4);
  }

  .char-count {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font: 400 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    pointer-events: none;
    transition: color .15s;
  }

  .char-count.warn {
    color: var(--accent);
  }
</style>
