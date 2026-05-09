<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { projectStore } from '../../project.svelte'
  import { getSegmentDetail, updateSegment, type SegmentDetailDTO, type SegmentRuleDTO } from '../../api/flags'
  import { SEGMENT_OPERATORS, SEG_OP_BY_ID } from '../../api/flags'
  import { notify } from '../../toasts.svelte'
  import SegmentStatusPills from '../SegmentStatusPills.svelte'
  import SegmentHeroStrip from '../SegmentHeroStrip.svelte'
  import SegmentUsedInFlags from '../SegmentUsedInFlags.svelte'
  import SegmentActivity from '../SegmentActivity.svelte'
  import SegmentDetails from '../SegmentDetails.svelte'
  import SegmentPayload from '../SegmentPayload.svelte'

  let { activeProject, projectName, activeSegment, nav }: {
    activeProject: string
    projectName: string
    activeSegment: string
    nav: (p: string) => void
  } = $props()

  const orgId = $derived(orgStore.activeId)
  const projId = $derived(projectStore.projects.find(p => String(p.id) === activeProject)?.id ?? 0)

  let detail = $state<SegmentDetailDTO | null>(null)
  let editing = $state(false)
  let loading = $state(true)

  let desc = $state('')
  let matchType = $state('AND')
  let rules = $state<SegmentRuleDTO[]>([])

  $effect(() => {
    if (orgId && projId && activeSegment) {
      loading = true
      getSegmentDetail(orgId, projId, Number(activeSegment)).then(r => {
        if (r.ok) {
          detail = r.data
          desc = r.data.description
          matchType = r.data.matchType
          rules = r.data.rules
        }
        loading = false
      })
    }
  })

  $effect(() => {
    activeSegment
    editing = false
  })

  const segId = $derived(detail?.id ?? 0)
  const ruleCount = $derived(detail?.rules?.length ?? 0)
  const flagsUsing = $derived(detail?.flagsUsing ?? [])
  const recentAudit = $derived(detail?.recentAudit ?? [])
  const createdAt = $derived(detail?.createdAt ?? '')
  const updatedAt = $derived(detail?.updatedAt ?? '')

  const TOTAL_USERS = 30000
  const mockUserCount = $derived(ruleCount > 0 ? Math.floor(TOTAL_USERS * (0.15 + (ruleCount * 0.05))) : 0)
  const reachPct = $derived(detail ? Math.min(100, (mockUserCount / TOTAL_USERS) * 100) : 0)
  const sparkline = $derived(generateSparkline(segId))
  const sampleUsers = $derived(generateSampleUsers(rules))

  function onCancelEdit() {
    if (detail) {
      desc = detail.description
      matchType = detail.matchType
      rules = detail.rules
    }
    editing = false
  }

  async function onSave() {
    if (!detail) return
    const r = await updateSegment(orgId, projId, detail.id, {
      description: desc,
      matchType,
      rules: rules.map(r => ({ attribute: r.attribute, operator: r.operator, value: r.value })),
    })
    if (r.ok) {
      notify.success('Saved', `Segment "${detail.name}" updated`)
      editing = false
      loadDetail()
    } else {
      notify.error('Failed', r.message)
    }
  }

  function loadDetail() {
    if (orgId && projId && activeSegment) {
      getSegmentDetail(orgId, projId, Number(activeSegment)).then(r => {
        if (r.ok) {
          detail = r.data
          desc = r.data.description
          matchType = r.data.matchType
          rules = r.data.rules
        }
      })
    }
  }

  function addRule() {
    rules = [...rules, { id: Date.now(), segmentId: segId, attribute: '', operator: 'equals', value: '' }]
  }

  function removeRule(id: number) {
    rules = rules.filter(r => r.id !== id)
  }

  function updateRule(id: number, patch: Partial<SegmentRuleDTO>) {
    rules = rules.map(r => r.id === id ? { ...r, ...patch } : r)
  }

  function generateSparkline(seedKey: number): number[] {
    let seed = seedKey || 42
    const rand = () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed % 1000) / 1000 }
    const pts: number[] = []
    let v = 0.4 + rand() * 0.3
    for (let i = 0; i < 24; i++) {
      v += (rand() - 0.45) * 0.18
      v = Math.max(0.1, Math.min(1, v))
      pts.push(v)
    }
    pts[pts.length - 1] = Math.max(pts[pts.length - 1], 0.75)
    return pts
  }

  function generateSampleUsers(currentRules: SegmentRuleDTO[]) {
    const ids = ['user_8f3k2', 'user_9x1mq', 'user_3c7pa', 'user_5d2nv']
    return ids.map(id => {
      const attrs = currentRules.length === 0
        ? [{ k: 'plan', v: 'pro' }, { k: 'country', v: 'US' }]
        : currentRules.slice(0, 3).map(r => {
            const tokens = parseListValue(r.value)
            const val = tokens.length ? tokens[0] : (r.value || '—')
            return { k: r.attribute || '—', v: String(val) }
          })
      return { id, attrs }
    })
  }

  function parseListValue(v: string): string[] {
    if (!v) return []
    if (v.trim().startsWith('[')) {
      try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr.map(String) : [] } catch {}
    }
    return v.split(',').map(t => t.trim()).filter(Boolean)
  }
</script>

{#if loading}
  <div class="page-shell">
    <div class="loading-state mono">Loading segment…</div>
  </div>
{:else if !detail}
  <div class="page-shell">
    <div class="empty mono">Segment not found</div>
  </div>
{:else}
<div class="page-shell">
  <header class="page-header">
    <span class="eyebrow">{projectName}</span>
    <div class="title-row">
      <button class="back-btn" onclick={() => nav('segments')}>←</button>
      <h1><span class="page-icon">◎</span> <span class="title-prefix">segments /</span> <span class="mono">{detail.name}</span></h1>
      <div class="actions">
        {#if editing}
          <button class="btn btn-ghost" onclick={onCancelEdit}>Cancel</button>
          <button class="btn btn-primary" onclick={onSave}>Save changes</button>
        {:else}
          <button class="btn btn-danger" onclick={() => {}}>Delete</button>
          <button class="btn btn-primary" onclick={() => editing = true}>Edit segment</button>
        {/if}
      </div>
    </div>
  </header>

  <div class="content">
    <SegmentStatusPills
      {ruleCount}
      {matchType}
      flagsUsingCount={flagsUsing.length}
      {updatedAt}
      {mockUserCount}
    />

    <SegmentHeroStrip
      {desc}
      {editing}
      {matchType}
      {ruleCount}
      {mockUserCount}
      {reachPct}
      {sparkline}
      flagsUsingCount={flagsUsing.length}
      onDescChange={v => desc = v}
    />

    <div class="two-col">
      <div class="col-left">
        <div class="panel">
          <div class="panel-bar">
            <span>Membership rules</span>
            <span class="panel-bar-right">
              {#if editing}
                <span class="seg-toggle">
                  <button class="seg-toggle-btn" class:active={matchType === 'AND'} onclick={() => matchType = 'AND'}>AND</button>
                  <button class="seg-toggle-btn" class:active={matchType === 'OR'} onclick={() => matchType = 'OR'}>OR</button>
                </span>
              {:else}
                <span class="match-badge">match <span class="match-badge-val">{matchType}</span></span>
              {/if}
            </span>
          </div>
          <div class="rule-helper mono">{matchType === 'AND' ? 'A user must match all rules.' : 'A user can match any one rule.'}</div>

          <div class="rules-list">
            {#if rules.length === 0}
              <div class="empty-state">
                <span class="empty-icon">◎</span>
                <span class="empty-text mono">No rules — this segment matches no users.</span>
              </div>
            {:else}
              {#each rules as r, i}
                {#if i > 0}
                  <div class="rule-connector">
                    <span class="rule-connector-badge mono">{matchType}</span>
                    <span class="rule-connector-line"></span>
                  </div>
                {/if}

                {#if editing}
                  <div class="rule-edit-card">
                    <span class="rule-num mono">{String(i + 1).padStart(2, '0')}</span>
                    <input
                      value={r.attribute}
                      oninput={e => updateRule(r.id, { attribute: (e.target as HTMLInputElement).value.replace(/\s/g, '_') })}
                      placeholder="attribute"
                      class="rule-edit-input"
                    />
                    <select
                      value={r.operator}
                      onchange={e => updateRule(r.id, { operator: (e.target as HTMLSelectElement).value })}
                      class="rule-edit-select"
                    >
                      {#each SEGMENT_OPERATORS as o}
                        <option value={o.id}>{o.glyph}  {o.label}</option>
                      {/each}
                    </select>
                    <input
                      value={r.value}
                      oninput={e => updateRule(r.id, { value: (e.target as HTMLInputElement).value })}
                      placeholder="value"
                      class="rule-edit-input rule-edit-input-wide"
                    />
                    <button class="rule-remove-btn" onclick={() => removeRule(r.id)} title="Remove">✕</button>
                  </div>
                {:else}
                  <div class="rule-view-card">
                    <span class="rule-num mono">{String(i + 1).padStart(2, '0')}</span>
                    <div class="rule-view-body">
                      <div class="rule-expression">
                        <span class="rule-attr">{r.attribute}</span>
                        <span class="rule-op-badge" title={SEG_OP_BY_ID[r.operator]?.label ?? r.operator}>
                          {SEG_OP_BY_ID[r.operator]?.glyph ?? '='}
                        </span>
                        <span class="rule-val">"{r.value}"</span>
                      </div>
                      <div class="rule-meta mono">
                        {SEG_OP_BY_ID[r.operator]?.label ?? r.operator} · {SEG_OP_BY_ID[r.operator]?.kind ?? 'string'}
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            {/if}

            {#if editing}
              <button class="btn btn-ghost btn-sm rule-add-btn" onclick={addRule}>+ Add rule</button>
            {/if}
          </div>
        </div>

        <div class="panel panel-spacer">
          <div class="panel-bar">
            <span>Sample matched users</span>
            <span class="panel-bar-right">showing {sampleUsers.length} of {mockUserCount.toLocaleString()}</span>
          </div>
          <div>
            {#each sampleUsers as u, i}
              <div class="sample-row" class:last={i === sampleUsers.length - 1}>
                <div class="sample-avatar mono">{u.id.slice(5, 7).toUpperCase()}</div>
                <span class="sample-id mono">{u.id}</span>
                <span class="sample-attrs">
                  {#each u.attrs as a}
                    <span class="sample-attr mono">
                      <span class="sample-attr-k">{a.k}</span>
                      <span class="sample-attr-eq"> = </span>
                      <span class="sample-attr-v">{a.v}</span>
                    </span>
                  {/each}
                </span>
                <span class="sample-matched mono">✓ matched</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="col-right">
        <SegmentUsedInFlags {flagsUsing} />
        <SegmentActivity {recentAudit} />
        <SegmentDetails
          {detail}
          {matchType}
          rulesCount={rules.length}
          {mockUserCount}
          {createdAt}
          {updatedAt}
        />
        <SegmentPayload {detail} {desc} {matchType} {rules} />
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  .page-shell {
    flex: 1;
    background: var(--bg);
    min-height: 100%;
  }

  .loading-state,
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
    color: var(--ink-3);
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
    transition: border-color 0.15s, color 0.15s;
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
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .title-prefix {
    color: var(--ink-3);
    font-weight: 400;
  }

  .page-icon {
    display: inline-block;
    vertical-align: -0.05em;
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
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
    gap: 20px;
    align-items: start;
    margin-top: 20px;
  }

  .col-left, .col-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .col-left {
    min-width: 0;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
  }

  .panel-spacer {
    margin-top: 0;
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
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .match-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: 0.08em;
    color: var(--ink-3);
    text-transform: uppercase;
  }

  .match-badge-val {
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid var(--accent-line);
    border-radius: 3px;
    padding: 1px 7px;
    letter-spacing: 0.1em;
  }

  .seg-toggle {
    display: inline-flex;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
  }

  .seg-toggle-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--ink-2);
    border-radius: 4px;
    padding: 3px 10px;
    font: 600 10.5px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.1s;
  }

  .seg-toggle-btn.active {
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    color: var(--ink);
  }

  .rule-helper {
    padding: 10px 18px;
    border-bottom: 1px solid var(--line);
    font-size: 12px;
    color: var(--ink-3);
    background: var(--bg);
  }

  .rules-list {
    padding: 18px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 0;
  }

  .empty-icon {
    font-size: 20px;
    color: var(--ink-3);
  }

  .empty-text {
    font-size: 12px;
    color: var(--ink-3);
  }

  .rule-connector {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
    padding-left: 38px;
  }

  .rule-connector-badge {
    background: var(--bg);
    color: var(--accent);
    border: 1px solid var(--accent-line);
    border-radius: 4px;
    padding: 2px 10px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
  }

  .rule-connector-line {
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  .rule-view-card {
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 16px 18px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .rule-edit-card {
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rule-num {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--ink-3);
    width: 24px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .rule-view-body {
    flex: 1;
    min-width: 0;
  }

  .rule-expression {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    font: 500 16px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: -0.005em;
  }

  .rule-attr {
    color: var(--ink);
  }

  .rule-op-badge {
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid var(--accent-line);
    border-radius: 4px;
    padding: 1px 8px;
    font-size: 14px;
    font-weight: 600;
  }

  .rule-val {
    color: var(--ink);
  }

  .rule-meta {
    margin-top: 8px;
    font-size: 11.5px;
    color: var(--ink-3);
  }

  .rule-edit-input {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 5px;
    color: var(--ink);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    padding: 6px 9px;
    outline: none;
    box-sizing: border-box;
    flex: 1 1 180px;
    min-width: 130px;
  }

  .rule-edit-input-wide {
    flex: 1 1 200px;
    min-width: 140px;
  }

  .rule-edit-select {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 5px;
    color: var(--ink);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    padding: 6px 9px;
    outline: none;
    cursor: pointer;
    min-width: 90px;
  }

  .rule-remove-btn {
    background: transparent;
    border: none;
    color: var(--ink-3);
    cursor: pointer;
    font-size: 14px;
    padding: 4px 6px;
    line-height: 1;
  }

  .rule-add-btn {
    margin-top: 14px;
  }

  .sample-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--line);
  }

  .sample-row.last {
    border-bottom: none;
  }

  .sample-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .sample-id {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink);
    min-width: 110px;
  }

  .sample-attrs {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  .sample-attr {
    font-size: 11px;
    color: var(--ink-3);
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: 1px 6px;
  }

  .sample-attr-k {
    color: var(--ink-3);
  }

  .sample-attr-eq {
    color: var(--ink-2);
  }

  .sample-attr-v {
    color: var(--ink);
  }

  .sample-matched {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
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