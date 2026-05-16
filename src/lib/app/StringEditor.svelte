<script lang="ts">
  let { value, onchange, maxLength }: {
    value: string
    onchange: (v: string) => void
    maxLength: number
  } = $props()
</script>

<div class="string-editor">
  <div class="input-wrap">
    <input
      type="text"
      value={value}
      oninput={(e) => onchange((e.target as HTMLInputElement).value.slice(0, maxLength))}
      placeholder="(empty)"
      maxlength={maxLength}
    />
    <span class="char-counter">{value.length}/{maxLength}</span>
  </div>
</div>

<style>
  .string-editor {
    width: 100%;
  }

  .input-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 100%;
  }

  input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 4px 32px 4px 8px;
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

  .char-counter {
    position: absolute;
    right: 6px;
    font: 400 9px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    pointer-events: none;
  }
</style>