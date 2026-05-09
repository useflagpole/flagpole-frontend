<script lang="ts">
  import { SEGMENT_OPERATORS, SEG_OP_BY_ID, SEG_OP_GROUPS, COMMON_ATTRS, type SegmentOperatorMeta } from '../api/flags'
  import SegmentChipInput from './SegmentChipInput.svelte'

  let {
    index,
    rule,
    onchange,
    onremove,
    onduplicate,
  }: {
    index: number
    rule: { id: string; attribute: string; operator: string; value: string }
    onchange: (patch: Partial<typeof rule>) => void
    onremove: () => void
    onduplicate: () => void
  } = $props()

  const op = $derived(SEG_OP_BY_ID[rule.operator] || SEG_OP_BY_ID['equals'])

  let attrFocus = $state(false)
  let opDropdownOpen = $state(false)
  let blurTimer: ReturnType<typeof setTimeout> | null = null

  const suggestions = $derived(
    (() => {
      const q = rule.attribute.toLowerCase()
      return COMMON_ATTRS.filter(a => !q || a.name.includes(q)).slice(0, 6)
    })()
  )

  function handleAttrBlur() {
    blurTimer = setTimeout(() => { attrFocus = false }, 120)
  }

  function handleAttrSelect(name: string) {
    if (blurTimer) clearTimeout(blurTimer)
    onchange({ attribute: name })
    attrFocus = false
  }

  function handleOperatorBlur() {
    blurTimer = setTimeout(() => { opDropdownOpen = false }, 120)
  }

  function handleOperatorSelect(opId: string) {
    if (blurTimer) clearTimeout(blurTimer)
    const next = SEG_OP_BY_ID[opId]
    const prev = SEG_OP_BY_ID[rule.operator]
    const value = next.kind === prev.kind ? rule.value : ''
    onchange({ operator: opId, value })
    opDropdownOpen = false
  }

  function formatListPreview(v: string): string {
    const t = parseChipValue(v)
    if (!t.length) return '…'
    if (t.length <= 3) return '[' + t.join(', ') + ']'
    return '[' + t.slice(0, 3).join(', ') + `, +${t.length - 3}]`
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

<div class="rule-row">
  <div class="rule-editor">
    <span class="rule-index">{String(index + 1).padStart(2, '0')}</span>

    <div class="rule-attr-wrap">
      <input
        value={rule.attribute}
        oninput={(e) => onchange({ attribute: (e.target as HTMLInputElement).value.replace(/\s/g, '_') })}
        onfocus={() => attrFocus = true}
        onblur={handleAttrBlur}
        placeholder="attribute"
        class="rule-input"
      />
      {#if attrFocus && suggestions.length > 0}
        <div class="attr-dropdown">
          {#each suggestions as s}
            <div class="attr-dropdown-item" onmousedown={() => handleAttrSelect(s.name)}>
              <span class="attr-dropdown-name">{s.name}</span>
              <span class="attr-dropdown-example">{s.example}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rule-op-wrap">
      <button
        class="rule-input rule-op-trigger"
        onclick={() => opDropdownOpen = !opDropdownOpen}
        onblur={handleOperatorBlur}
        type="button"
      >
        <span class="op-glyph">{op.glyph}</span>
        <span class="op-label">{op.label}</span>
        <span class="op-chevron">{opDropdownOpen ? '▾' : '▸'}</span>
      </button>
      {#if opDropdownOpen}
        <div class="op-dropdown">
          {#each SEG_OP_GROUPS as g}
            <div class="op-dropdown-group">
              <div class="op-dropdown-group-label">{g}</div>
              {#each SEGMENT_OPERATORS.filter(o => o.group === g) as o}
                <div
                  class="op-dropdown-item"
                  class:active={o.id === rule.operator}
                  onmousedown={() => handleOperatorSelect(o.id)}
                >
                  <span class="op-dropdown-glyph">{o.glyph}</span>
                  <span class="op-dropdown-label">{o.label}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rule-value-wrap">
      {#if op.kind === 'list'}
        <SegmentChipInput value={rule.value} onchange={v => onchange({ value: v })} />
      {:else if op.kind === 'number'}
        <input
          value={rule.value}
          oninput={(e) => onchange({ value: (e.target as HTMLInputElement).value.replace(/[^0-9.\-]/g, '') })}
          inputmode="decimal"
          placeholder="0"
          class="rule-input"
        />
      {:else}
        <input
          value={rule.value}
          oninput={(e) => onchange({ value: (e.target as HTMLInputElement).value })}
          placeholder="value"
          class="rule-input"
        />
      {/if}
    </div>

    <div class="rule-actions">
      <button class="icon-btn" onclick={onduplicate} title="Duplicate">⊕</button>
      <button class="icon-btn" onclick={onremove} title="Remove">✕</button>
    </div>
  </div>

  <div class="rule-preview">
    <span class="preview-attr">{rule.attribute || 'attribute'}</span>
    <span class="preview-glyph">{op.glyph}</span>
    <span class="preview-value">
      {#if op.kind === 'list'}
        {formatListPreview(rule.value)}
      {:else}
        {rule.value || '…'}
      {/if}
    </span>
    <span class="preview-kind">· {op.kind === 'number' ? 'numeric' : op.kind === 'list' ? 'list of values' : 'string'}</span>
  </div>
</div>

<style>
  .rule-row {
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .rule-editor {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rule-index {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    width: 22px;
    text-align: center;
    flex-shrink: 0;
  }

  .rule-attr-wrap {
    position: relative;
    flex: 1 1 200px;
    min-width: 140px;
  }

  .rule-input {
    width: 100%;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 6px 9px;
    color: var(--ink);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .rule-input:focus {
    border-color: var(--line-2);
  }

  .rule-op-wrap {
    position: relative;
    flex: 0 0 auto;
    min-width: 96px;
  }

  .rule-op-trigger {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    width: auto;
    min-width: 96px;
  }

  .op-glyph {
    color: var(--accent);
    flex-shrink: 0;
  }

  .op-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .op-chevron {
    color: var(--ink-3);
    flex-shrink: 0;
    font-size: 10px;
  }

  .op-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 160px;
    z-index: 5;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    max-height: 260px;
    overflow-y: auto;
  }

  .op-dropdown-group {
    border-bottom: 1px solid var(--line);
  }

  .op-dropdown-group:last-child {
    border-bottom: none;
  }

  .op-dropdown-group-label {
    padding: 5px 10px 3px;
    font: 600 9px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: var(--bg-3);
  }

  .op-dropdown-item {
    padding: 6px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.12s;
  }

  .op-dropdown-item:hover {
    background: var(--bg-3);
  }

  .op-dropdown-item.active {
    background: var(--accent-dim);
  }

  .op-dropdown-item.active:hover {
    background: var(--accent-dim);
  }

  .op-dropdown-glyph {
    color: var(--accent);
    font-size: 13px;
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }

  .op-dropdown-label {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
  }

  .rule-value-wrap {
    flex: 1 1 220px;
    min-width: 160px;
  }

  .rule-actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--ink-3);
    cursor: pointer;
    width: 26px;
    height: 26px;
    border-radius: 5px;
    font: 500 13px 'Geist Mono', ui-monospace, monospace;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.12s;
  }

  .icon-btn:hover {
    background: var(--bg-3);
    border-color: var(--line);
    color: var(--ink);
  }

  .attr-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 100%;
    z-index: 5;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    max-height: 220px;
    overflow-y: auto;
  }

  .attr-dropdown-item {
    padding: 7px 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px solid var(--line);
    transition: background 0.12s;
  }

  .attr-dropdown-item:hover {
    background: var(--bg-3);
  }

  .attr-dropdown-item:last-child {
    border-bottom: none;
  }

  .attr-dropdown-name {
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
  }

  .attr-dropdown-example {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .rule-preview {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding-left: 30px;
    margin-top: 6px;
  }

  .preview-attr {
    color: var(--ink-2);
  }

  .preview-glyph {
    color: var(--accent);
    margin: 0 4px;
  }

  .preview-value {
    color: var(--ink-2);
  }

  .preview-kind {
    margin-left: 10px;
    opacity: 0.7;
  }
</style>
