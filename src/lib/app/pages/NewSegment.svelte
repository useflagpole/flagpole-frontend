<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { projectStore } from '../../project.svelte'
  import { listSegments, createSegment, SEG_OP_BY_ID } from '../../api/flags'
  import { notify } from '../../toasts.svelte'
  import SegmentRuleRow from '../SegmentRuleRow.svelte'
  import SegmentConnector from '../SegmentConnector.svelte'
  import SegmentIdentityPanel from '../SegmentIdentityPanel.svelte'
  import SegmentChecklist from '../SegmentChecklist.svelte'
  import SegmentAttrSuggestions from '../SegmentAttrSuggestions.svelte'
  import SegmentPayloadPreview from '../SegmentPayloadPreview.svelte'

  let {
    nav,
    activeProject,
    projectName,
  }: {
    nav: (p: string) => void
    activeProject: string
    projectName: string
  } = $props()

  const orgId = $derived(orgStore.activeId)
  const projId = $derived(projectStore.projects.find(p => String(p.id) === activeProject)?.id ?? 0)

  const MAX_RULES = 20

  let name = $state('')
  let desc = $state('')
  let matchType = $state<'AND' | 'OR'>('AND')
  let rules = $state<{ id: string; attribute: string; operator: string; value: string }[]>([])
  let submitAttempted = $state(false)
  let saving = $state(false)
  let existingNames = $state<Set<string>>(new Set())
  let nameRef: HTMLInputElement | undefined = $state()

  $effect(() => {
    if (orgId && projId) {
      listSegments(orgId, projId).then(r => {
        if (r.ok) {
          existingNames = new Set(r.data.map(s => s.name))
        }
      })
      setTimeout(() => nameRef?.focus(), 80)
    }
  })

  function addRule(preset?: { attribute?: string; operator?: string; value?: string }) {
    if (rules.length >= MAX_RULES) return
    const id = 'r' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    rules = [...rules, { id, attribute: preset?.attribute || '', operator: preset?.operator || 'equals', value: preset?.value || '' }]
  }

  function updateRule(id: string, patch: Partial<typeof rules[number]>) {
    rules = rules.map(x => x.id === id ? { ...x, ...patch } : x)
  }

  function removeRule(id: string) {
    rules = rules.filter(x => x.id !== id)
  }

  function duplicateRule(id: string) {
    const i = rules.findIndex(x => x.id === id)
    if (i < 0) return
    const copy = { ...rules[i], id: 'r' + Date.now() }
    rules = [...rules.slice(0, i + 1), copy, ...rules.slice(i + 1)]
  }

  const trimmed = $derived(name.trim())
  const isDuplicate = $derived(trimmed.length > 0 && existingNames.has(trimmed))

  const issues = $derived.by(() => {
    const list: { key: string; level: 'error' | 'warn'; msg: string }[] = []
    if (!trimmed) list.push({ key: 'name', level: 'error', msg: 'Segment name is required.' })
    else if (isDuplicate) list.push({ key: 'name', level: 'error', msg: `"${trimmed}" already exists in this project.` })
    rules.forEach((r, i) => {
      const missing: string[] = []
      if (!r.attribute.trim()) missing.push('attribute')
      if (!r.operator) missing.push('operator')
      if (!String(r.value).trim()) missing.push('value')
      if (missing.length) list.push({ key: 'rule:' + r.id, level: 'warn', msg: `Rule ${i + 1}: missing ${missing.join(', ')}.` })
    })
    return list
  })

  const canSave = $derived(
    trimmed.length > 0 && !isDuplicate && rules.every(r => r.attribute.trim() && String(r.value).trim())
  )

  const estimate = $derived.by(() => {
    if (rules.length === 0) return { count: 0, pct: 0 }
    const TOTAL = 30000
    const wellFormed = rules.filter(r => r.attribute && r.value).length
    if (wellFormed === 0) return { count: 0, pct: 0 }
    const base = matchType === 'AND'
      ? TOTAL / Math.pow(1.8, wellFormed)
      : Math.min(TOTAL, TOTAL * 0.18 * wellFormed)
    const count = Math.round(base)
    return { count, pct: (count / TOTAL) * 100 }
  })

  const payload = $derived.by(() => ({
    name: trimmed,
    ...(desc.trim() ? { description: desc.trim() } : {}),
    matchType,
    rules: rules.map(r => ({
      attribute: r.attribute.trim(),
      operator: r.operator,
      value: SEG_OP_BY_ID[r.operator]?.kind === 'list' ? toJsonArray(r.value) : r.value,
    })),
  }))

  function toJsonArray(v: string): string {
    const t = parseChipValue(v)
    return JSON.stringify(t)
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

  async function handleSubmit() {
    submitAttempted = true
    if (!canSave || !orgId || !projId) return
    saving = true
    const r = await createSegment(orgId, projId, {
      name: trimmed,
      description: desc.trim() || undefined,
      matchType,
      rules: rules.map(r => ({
        attribute: r.attribute.trim(),
        operator: r.operator,
        value: SEG_OP_BY_ID[r.operator]?.kind === 'list' ? toJsonArray(r.value) : r.value,
      })),
    })
    saving = false
    if (r.ok) {
      notify.success('Created', `Segment "${trimmed}" created`)
      nav('segments')
    } else if (r.status === 409) {
      notify.error('Conflict', r.message)
      existingNames.add(trimmed)
    } else {
      notify.error('Failed', r.message)
    }
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">Segments / new</span>
      <h1>{trimmed || 'New segment'}</h1>
    </div>
    <div class="actions">
      <button class="btn btn-ghost btn-sm" onclick={() => nav('segments')}>Cancel</button>
      <button class="btn btn-primary btn-sm" onclick={handleSubmit} class:disabled={!canSave} disabled={!canSave}>
        {saving ? 'Creating…' : 'Create segment'}
      </button>
    </div>
  </header>

  <div class="page-grid">
    <div class="builder-col">
      <SegmentIdentityPanel
        {name}
        {desc}
        {trimmed}
        {isDuplicate}
        {submitAttempted}
        onNameChange={(v) => name = v}
        onDescChange={(v) => desc = v}
      />

      <div class="panel">
        <div class="panel-bar">
          <span>02 — Membership rules</span>
          <span class="panel-bar-right">{rules.length}/{MAX_RULES}</span>
        </div>

        <div class="match-bar">
          <span class="match-label">Match type</span>
          <div class="segmented">
            <button class:active={matchType === 'AND'} onclick={() => matchType = 'AND'}>AND</button>
            <button class:active={matchType === 'OR'} onclick={() => matchType = 'OR'}>OR</button>
          </div>
          <span class="match-hint">
            {matchType === 'AND' ? 'A user must match all rules.' : 'A user can match any one rule.'}
          </span>
        </div>

        <div class="rules-body">
          {#if rules.length === 0}
            <div class="empty-rules">
              <div class="empty-rules-icon">◎</div>
              <div class="empty-rules-title">No rules yet</div>
              <div class="empty-rules-desc">A segment with zero rules matches no users. Add your first rule to define who belongs.</div>
              <button class="btn btn-primary btn-sm" onclick={() => addRule()}>+ Add first rule</button>
            </div>
          {/if}

          {#each rules as r, i}
            {#if i > 0}
              <SegmentConnector logic={matchType} onToggle={(v) => matchType = v} />
            {/if}
            <SegmentRuleRow
              index={i}
              rule={r}
              onchange={(patch) => updateRule(r.id, patch)}
              onremove={() => removeRule(r.id)}
              onduplicate={() => duplicateRule(r.id)}
            />
          {/each}

          {#if rules.length > 0}
            <div class="add-rule-row">
              <button class="btn btn-ghost btn-sm" onclick={() => addRule()} class:disabled={rules.length >= MAX_RULES} disabled={rules.length >= MAX_RULES}>
                + Add rule
              </button>
              {#if rules.length >= MAX_RULES}
                <span class="add-rule-hint">Maximum {MAX_RULES} rules per segment.</span>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="rail-col">
      <div class="panel">
        <div class="panel-bar">
          <span>Estimated reach</span>
          <span class="panel-bar-right">{rules.length === 0 ? '—' : `~${estimate.count.toLocaleString()}`}</span>
        </div>
        <div class="panel-body">
          <div class="reach-number">
            <span class="reach-count">{rules.length === 0 ? '0' : estimate.count.toLocaleString()}</span>
            <span class="reach-unit">users</span>
          </div>
          <div class="reach-bar">
            <div class="reach-fill" style="width: {rules.length === 0 ? 0 : Math.max(0.5, Math.min(100, estimate.pct))}%" />
          </div>
          <div class="reach-caption">
            {#if rules.length === 0}
              Add rules to estimate reach.
            {:else}
              {estimate.pct.toFixed(1)}% of 30,000 users · {rules.length} rule{rules.length !== 1 ? 's' : ''} · {matchType}
            {/if}
          </div>
        </div>
      </div>

      <SegmentAttrSuggestions onAdd={addRule} />

      <SegmentChecklist {trimmed} {isDuplicate} {issues} />

      <SegmentPayloadPreview {payload} />
    </div>
  </div>
</div>

<style>
  .page-shell {
    flex: 1;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .page-header {
    padding: 32px 32px 20px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .eyebrow {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  h1 {
    margin: 0;
    font-weight: 500;
    font-size: clamp(22px, 2vw, 28px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .page-grid {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 20px;
    align-items: start;
    padding: 0 32px 64px;
  }

  .builder-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .rail-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 20px;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: visible;
  }

  .panel-bar {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .panel-bar-right {
    color: var(--ink-2);
  }

  .panel-body {
    padding: 18px;
  }

  .match-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--line);
    background: var(--bg);
  }

  .match-label {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .segmented {
    display: inline-flex;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
  }

  .segmented button {
    background: transparent;
    border: 1px solid transparent;
    color: var(--ink-2);
    border-radius: 4px;
    padding: 4px 12px;
    font: 600 11px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.12s;
  }

  .segmented button.active {
    background: var(--bg-3);
    border-color: var(--line-2);
    color: var(--ink);
  }

  .match-hint {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-left: auto;
  }

  .rules-body {
    padding: 18px;
  }

  .empty-rules {
    border: 1px dashed var(--line-2);
    border-radius: 10px;
    padding: 32px 20px;
    text-align: center;
    background: repeating-linear-gradient(135deg, transparent 0 8px, rgba(255, 255, 255, 0.012) 8px 16px);
  }

  .empty-rules-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: 500 16px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    margin-bottom: 12px;
  }

  .empty-rules-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 6px;
  }

  .empty-rules-desc {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    max-width: 360px;
    margin: 0 auto 16px;
    line-height: 1.55;
  }

  .add-rule-row {
    display: flex;
    gap: 8px;
    margin-top: 14px;
    align-items: center;
  }

  .add-rule-hint {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .reach-number {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
  }

  .reach-count {
    font: 500 22px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: -0.02em;
  }

  .reach-unit {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .reach-bar {
    background: var(--bg-3);
    border-radius: 999px;
    height: 6px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .reach-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.25s ease;
  }

  .reach-caption {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 6px;
    font: 500 13.5px 'Geist', ui-sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-sm {
    font-size: 12px;
    padding: 5px 10px;
  }

  .btn-primary {
    background: var(--ink);
    color: var(--bg);
  }

  .btn-primary:hover {
    opacity: 0.85;
  }

  .btn-primary.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover {
    border-color: var(--ink);
  }

  .btn-ghost.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>