<script lang="ts">
  import { segments, flags, flagRules } from '../data'

  let { activeProject, activeSegment, nav }: {
    activeProject: string
    activeSegment: string
    nav: (p: string) => void
  } = $props()

  const projSegments = $derived(segments.filter(s => s.projectId === activeProject))
  const seg = $derived(projSegments.find(s => s.id === activeSegment) ?? projSegments[0])

  const OPS = ['equals', 'not_equals', 'in', 'not_in', 'lt', 'lte', 'gt', 'gte', 'contains', 'ends_with', 'starts_with']
  const OP_LABELS: Record<string, string> = {
    equals: '=',
    not_equals: '≠',
    in: '∈',
    not_in: '∉',
    lt: '<',
    lte: '≤',
    gt: '>',
    gte: '≥',
    contains: 'contains',
    ends_with: 'ends with',
    starts_with: 'starts with',
  }

  type Rule = { id: string; attr: string; op: string; value: string }
  let rules = $state<Rule[]>([])
  let logic = $state('AND')

  $effect(() => {
    rules = (seg?.rules ?? []).map((r, i) => ({ ...r, id: 'sr' + i }))
  })

  const addRule    = () => { rules = [...rules, { id: 'sr' + Date.now(), attr: '', op: 'equals', value: '' }] }
  const removeRule = (id: string) => { rules = rules.filter(r => r.id !== id) }
  const updateRule = (id: string, key: string, val: string) => {
    rules = rules.map(r => r.id === id ? { ...r, [key]: val } : r)
  }

  const usedInFlags = $derived(
    Object.values(flags).flat().filter(f => {
      const rs = flagRules[f.id] ?? []
      return rs.some(r => r.value && r.value.includes(seg?.name ?? ''))
    })
  )

  const pct = $derived(seg ? Math.min(100, (seg.userCount / 30000) * 100) : 0)
</script>

{#if seg}
<div class="page-shell">
  <header class="page-header">
    <span class="eyebrow">Segments</span>
    <div class="title-row">
      <button class="back-btn" onclick={() => nav('segments')}>←</button>
      <h1 class="mono">{seg.name}</h1>
      <div class="actions">
        <button class="btn btn-danger">Delete</button>
        <button class="btn btn-primary">Save segment</button>
      </div>
    </div>
  </header>

  <div class="content">
    <div class="two-col">
      <div>
        <div class="panel">
          <div class="panel-bar">
            <span>Membership rules</span>
            <div class="logic-controls">
              <span class="logic-label mono">Match</span>
              {#each ['AND', 'OR'] as l}
                <button class="logic-btn" class:active={logic === l} onclick={() => logic = l}>{l}</button>
              {/each}
              <span class="logic-label mono">rules</span>
            </div>
          </div>
          <div class="panel-body">
            {#if rules.length === 0}
              <p class="no-rules mono">No rules — this segment matches all users.</p>
            {/if}
            {#each rules as r, i}
              {#if i > 0}
                <div class="logic-sep">{logic}</div>
              {/if}
              <div class="rule-editor">
                <input
                  value={r.attr}
                  oninput={e => updateRule(r.id, 'attr', (e.target as HTMLInputElement).value)}
                  placeholder="attribute"
                  class="rule-input"
                  style="width: 140px"
                />
                <select
                  value={r.op}
                  onchange={e => updateRule(r.id, 'op', (e.target as HTMLSelectElement).value)}
                  class="rule-select"
                >
                  {#each OPS as o}<option value={o}>{OP_LABELS[o] ?? o}</option>{/each}
                </select>
                <input
                  value={r.value}
                  oninput={e => updateRule(r.id, 'value', (e.target as HTMLInputElement).value)}
                  placeholder="value"
                  class="rule-input"
                  style="flex: 1; min-width: 100px"
                />
                <button class="remove-btn" onclick={() => removeRule(r.id)}>✕</button>
              </div>
            {/each}
            <button class="btn btn-ghost btn-sm" onclick={addRule} style="margin-top: 10px">+ Add rule</button>
          </div>
        </div>

        <div class="panel" style="margin-top: 16px">
          <div class="panel-bar">
            <span>Preview</span>
            <span class="panel-bar-right">~{seg.userCount.toLocaleString()} matched</span>
          </div>
          <div class="panel-body">
            <div class="preview-bar-row">
              <div class="preview-track">
                <div class="preview-fill" style="width: {pct.toFixed(1)}%"></div>
              </div>
              <span class="preview-pct mono">{pct.toFixed(1)}%</span>
            </div>
            <div class="preview-sub mono">of total user base (30,000 users)</div>

            <div class="sample-users">
              <div class="sample-label mono">Sample users</div>
              {#each ['user_8f3k2', 'user_9x1mq', 'user_3c7pa', 'user_5d2nv'] as u}
                <div class="sample-row">
                  <div class="mini-avatar">U</div>
                  <span class="mono sample-id">{u}</span>
                  <span class="mono sample-matched">✓ matched</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="panel">
          <div class="panel-bar">
            <span>Used in flags</span>
            <span class="panel-bar-right">{usedInFlags.length}</span>
          </div>
          {#if usedInFlags.length === 0}
            <div class="empty mono">Not used in any flags yet</div>
          {:else}
            {#each usedInFlags as f}
              <div class="flag-row">
                <span class="pill" class:on={f.status === 'on'}>{f.status}</span>
                <span class="flag-key mono">{f.key}</span>
              </div>
            {/each}
          {/if}
        </div>

        <div class="panel" style="margin-top: 16px">
          <div class="panel-bar"><span>Details</span></div>
          <div class="panel-body">
            {#each [
              ['ID',            seg.id],
              ['Matched users', seg.userCount.toLocaleString()],
              ['Rules',         seg.rules.length],
              ['Logic',         logic],
            ] as [k, v]}
              <div class="meta-row">
                <span class="meta-key">{k}</span>
                <span class="meta-val mono">{v}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
  <div class="empty mono" style="padding: 64px; color: var(--ink-3)">Segment not found</div>
{/if}

<style>
  .page-shell {
    flex: 1;
    background: var(--bg);
  }

  .page-header {
    padding: 32px 32px 20px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
    display: flex;
    flex-direction: column;
  }

  .eyebrow {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--line-2);
    border-radius: 6px;
    color: var(--ink-2);
    font-size: 16px;
    cursor: pointer;
    transition: border-color .15s, color .15s;
  }

  .back-btn:hover {
    border-color: var(--ink);
    color: var(--ink);
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
    margin-left: auto;
  }

  .content {
    padding: 0 32px 64px;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 16px;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
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
    padding: 16px;
  }

  .logic-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logic-label {
    font-size: 11.5px;
    color: var(--ink-3);
  }

  .logic-btn {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--ink-2);
    border-radius: 4px;
    padding: 3px 8px;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    cursor: pointer;
  }

  .logic-btn.active {
    background: var(--bg-3);
    border-color: var(--line-2);
    color: var(--ink);
  }

  .logic-sep {
    text-align: center;
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    margin: 6px 0;
    letter-spacing: 0.08em;
  }

  .rule-editor {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    background: var(--bg-3);
    border-radius: 6px;
    padding: 8px 10px;
    border: 1px solid var(--line);
    margin-bottom: 6px;
  }

  .rule-input {
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 5px;
    color: var(--ink);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    padding: 6px 10px;
    outline: none;
  }

  .rule-select {
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 5px;
    color: var(--ink);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    padding: 6px 10px;
    outline: none;
    cursor: pointer;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: var(--ink-3);
    cursor: pointer;
    font-size: 14px;
    padding: 0 4px;
  }

  .no-rules {
    font-size: 12px;
    color: var(--ink-3);
    margin-bottom: 12px;
    margin-top: 0;
  }

  .preview-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .preview-track {
    flex: 1;
    background: var(--bg-3);
    border-radius: 999px;
    height: 8px;
    overflow: hidden;
  }

  .preview-fill {
    height: 100%;
    background: var(--accent);
  }

  .preview-pct {
    font-size: 13px;
    min-width: 80px;
  }

  .preview-sub {
    font-size: 12px;
    color: var(--ink-3);
  }

  .sample-users {
    margin-top: 20px;
    border-top: 1px solid var(--line);
    padding-top: 16px;
  }

  .sample-label {
    font-size: 10.5px;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }

  .sample-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid var(--line);
  }

  .mini-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: var(--ink-3);
  }

  .sample-id {
    font-size: 12px;
    color: var(--ink);
  }

  .sample-matched {
    font-size: 12px;
    color: var(--accent);
    margin-left: auto;
  }

  .flag-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
  }

  .flag-key {
    font-size: 12px;
    color: var(--ink);
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 13px;
  }

  .meta-key {
    color: var(--ink-3);
  }

  .meta-val {
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-align: center;
    padding: 48px 24px;
  }

  .pill {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
  }

  .pill.on {
    color: var(--accent);
    border-color: var(--accent-line);
    background: var(--accent-dim);
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
    transition: opacity .15s;
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

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover {
    border-color: var(--ink);
  }

  .btn-danger {
    background: transparent;
    color: #e07070;
    border-color: #7a3333;
  }

  .btn-danger:hover {
    opacity: 0.75;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
