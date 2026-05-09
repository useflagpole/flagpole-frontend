<script lang="ts">
  let { value, onchange }: {
    value: string
    onchange: (v: string) => void
  } = $props()

  let draft = $state('')

  const tokens = $derived(parseChipValue(value))

  function commit(raw: string) {
    const tok = raw.trim().replace(/^,+|,+$/g, '')
    if (!tok) return
    const next = [...tokens, tok]
    onchange(next.join(', '))
    draft = ''
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (draft.trim()) {
        e.preventDefault()
        commit(draft)
      }
    } else if (e.key === 'Backspace' && !draft && tokens.length) {
      onchange(tokens.slice(0, -1).join(', '))
    }
  }

  function remove(i: number) {
    const next = tokens.filter((_, idx) => idx !== i)
    onchange(next.join(', '))
  }

  function parseChipValue(v: string): string[] {
    if (!v) return []
    if (v.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(v)
        return Array.isArray(arr) ? arr.map(String) : []
      } catch { /* fall through */ }
    }
    return v.split(',').map(t => t.trim()).filter(Boolean)
  }
</script>

<div class="chip-input">
  {#each tokens as t, i}
    <span class="chip">
      {t}
      <button class="chip-remove" onclick={() => remove(i)}>×</button>
    </span>
  {/each}
  <input
    bind:value={draft}
    onkeydown={onKey}
    onblur={() => draft.trim() && commit(draft)}
    placeholder={tokens.length ? '' : 'value, value, …'}
    class="chip-draft"
  />
</div>

<style>
  .chip-input {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 4px 6px;
    min-height: 30px;
    align-items: center;
    transition: border-color 0.15s;
  }

  .chip-input:focus-within {
    border-color: var(--line-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 3px;
    padding: 2px 4px 2px 7px;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
  }

  .chip-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-3);
    padding: 0 3px;
    font-size: 12px;
    line-height: 1;
    transition: color 0.12s;
  }

  .chip-remove:hover {
    color: var(--ink);
  }

  .chip-draft {
    flex: 1;
    min-width: 60px;
    background: transparent;
    border: none;
    outline: none;
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
    padding: 3px 4px;
  }

  .chip-draft::placeholder {
    color: var(--ink-3);
  }
</style>
