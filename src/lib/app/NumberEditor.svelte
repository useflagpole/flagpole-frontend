<script lang="ts">
  let { value = $bindable(), onchange }: {
    value: string
    onchange?: (v: string) => void
  } = $props()

  function filterNumeric(raw: string): string {
    return raw.replace(/[^0-9.\-]/g, '')
  }
</script>

<div class="number-editor">
  <input
    type="text"
    inputmode="decimal"
    bind:value
    oninput={(e) => {
      const input = e.target as HTMLInputElement
      const filtered = filterNumeric(input.value)
      if (filtered !== input.value) {
        input.value = filtered
        value = filtered
      }
      onchange?.(value)
    }}
    placeholder="0"
  />
</div>

<style>
  .number-editor {
    width: 100%;
  }

  input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 4px 8px;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  input:focus {
    border-color: var(--line-2);
  }

  input::placeholder {
    color: var(--ink-3);
  }
</style>