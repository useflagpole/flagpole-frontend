<script lang="ts">
  import { projects, flags, flagRules, evalSeries, auditLog } from '../data'
  import EvalChart from '../EvalChart.svelte'
  import Toggle from '../Toggle.svelte'
  import ActionBadge from '../ActionBadge.svelte'
  import FlagIcon from '../FlagIcon.svelte'

  let { activeProject, projectName, activeFlag, nav }: {
    activeProject: string
    projectName: string
    activeFlag: string
    nav: (p: string) => void
  } = $props()

  const proj        = $derived(projects.find(p => p.id === activeProject) ?? projects[0])
  const projFlags   = $derived(flags[proj.id] ?? [])
  const flag        = $derived(projFlags.find(f => f.id === activeFlag) ?? projFlags[0])
  const rules       = $derived(flagRules[flag?.id ?? ''] ?? [])
  const flagAudit   = $derived(auditLog.filter(a => a.target === flag?.key).slice(0, 5))
  const chartSeries = $derived(evalSeries[flag?.key ?? ''] ?? evalSeries['rate-limit-v3'])

  let rollout = $state(0)
  let status  = $state<'on' | 'off'>('off')
  let env     = $state('production')

  $effect(() => {
    rollout = flag?.rollout ?? 0
    status  = flag?.status ?? 'off'
    env     = proj.env[0] ?? 'production'
  })

  const OP_LABELS: Record<string, string> = {
    equals: '=',
    not_in: '∉',
    in: '∈',
    lt: '<',
    lte: '≤',
    gte: '≥',
    gt: '>',
    ends_with: 'ends with',
  }
</script>

{#if flag}
<div class="page-shell">
  <header class="page-header">
    <span class="eyebrow">{projectName}</span>
    <div class="title-row">
      <button class="back-btn" onclick={() => nav('flags')}>←</button>
      <h1><span class="page-icon"><FlagIcon size={22} /></span> <span class="title-prefix">flags /</span> <span class="mono">{flag.key}</span></h1>
      <div class="actions">
        <button class="btn btn-danger">Archive</button>
      </div>
    </div>
  </header>

  <div class="content">
    <div class="env-tabs">
      {#each proj.env as e}
        <button class="env-tab" class:active={env === e} onclick={() => env = e}>{e}</button>
      {/each}
    </div>

    <div class="two-col">
      <div class="panel">
        <div class="panel-bar">
          <span>Status &amp; rollout</span>
          <span class="panel-bar-right">{env}</span>
        </div>
        <div class="panel-body">
          <div class="toggle-row">
            <div>
              <div class="toggle-title">Flag enabled</div>
              <div class="toggle-sub mono">
                {status === 'on' ? 'Serving to rollout %' : 'Returning default value'}
              </div>
            </div>
            <Toggle on={status === 'on'} onchange={v => status = v ? 'on' : 'off'} />
          </div>
          <div class="rollout-label">
            <span class="rollout-name">Rollout percentage</span>
            <span class="rollout-pct mono">{rollout}%</span>
          </div>
          <input type="range" min={0} max={100} bind:value={rollout} class="slider" />
          <div class="range-ticks mono">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
          <div class="save-row">
            <button class="btn btn-primary btn-sm">Save changes</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>Evaluations · last 7 days</span>
          <span class="panel-bar-right">{flag.evals.toLocaleString()} total</span>
        </div>
        <div class="panel-body">
          <EvalChart series={chartSeries} />
          <div class="eval-stats">
            {#each [
              ['Avg / day', Math.round(flag.evals / 7).toLocaleString()],
              ['Peak',      Math.round(flag.evals / 5).toLocaleString()],
              ['Unique',    Math.round(flag.evals / 3.2).toLocaleString()],
            ] as [k, v]}
              <div>
                <div class="stat-label">{k}</div>
                <div class="stat-value">{v}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-bar">
        <span>Targeting rules</span>
        <button class="btn btn-ghost btn-sm">+ Add rule</button>
      </div>
      <div class="panel-body">
        {#if rules.length === 0}
          <p class="no-rules mono">No targeting rules — serving to all users based on rollout %.</p>
        {/if}
        {#each rules as r}
          <div class="rule-row">
            <span class="rule-if mono">IF</span>
            <code class="chip">{r.attr}</code>
            <span class="op mono">{OP_LABELS[r.op] ?? r.op}</span>
            <code class="chip accent">{r.value}</code>
            <span class="serve mono">→ serve</span>
            <code class="chip" style="color: {r.action === 'on' ? 'var(--accent)' : r.action.startsWith('variant:') ? '#8fa8e8' : 'var(--ink-3)'}">{r.action}</code>
            <button class="btn btn-ghost btn-sm edit-btn">Edit</button>
          </div>
        {/each}
        {#if rules.length > 0}
          <div class="default-rule mono">
            <span class="default-label">Default</span> → serve based on rollout % ({rollout}%)
          </div>
        {/if}
      </div>
    </div>

    <div class="panel">
      <div class="panel-bar">
        <span>Audit trail · {flag.key}</span>
      </div>
      {#if flagAudit.length === 0}
        <div class="empty mono">No audit events</div>
      {/if}
      {#each flagAudit as a}
        <div class="audit-row">
          <span class="audit-ts mono">{a.ts}</span>
          <ActionBadge action={a.action} />
          <span class="audit-detail">{a.detail}</span>
          <span class="audit-actor">{a.actor}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
{:else}
  <div class="empty mono" style="padding: 64px; color: var(--ink-3)">Flag not found</div>
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

  .title-prefix {
    color: var(--ink-3);
    font-weight: 400;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .content {
    padding: 0 32px 64px;
  }

  .env-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--line);
  }

  .env-tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 8px 14px;
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    cursor: pointer;
    margin-bottom: -1px;
    transition: color .1s;
  }

  .env-tab.active {
    color: var(--ink);
    border-bottom-color: var(--accent);
    font-weight: 500;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .two-col .panel {
    margin-bottom: 0;
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
    padding: 20px 22px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .toggle-title {
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 4px;
  }

  .toggle-sub {
    font-size: 12px;
    color: var(--ink-3);
  }

  .rollout-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .rollout-name {
    font-size: 13px;
    color: var(--ink-2);
  }

  .rollout-pct {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
  }

  .slider {
    width: 100%;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .range-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--ink-3);
    margin-top: 4px;
  }

  .save-row {
    margin-top: 20px;
  }

  .eval-stats {
    display: flex;
    gap: 24px;
    margin-top: 14px;
  }

  .stat-label {
    font: 400 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .stat-value {
    font-weight: 500;
    font-size: 16px;
    letter-spacing: -0.02em;
  }

  .rule-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 10px 14px;
    background: var(--bg-3);
    border-radius: 6px;
    margin-bottom: 6px;
  }

  .rule-if {
    font-size: 10.5px;
    color: var(--ink-3);
    min-width: 28px;
  }

  .op {
    font-size: 12px;
    color: var(--ink-3);
  }

  .serve {
    font-size: 10.5px;
    color: var(--ink-3);
    margin-left: 4px;
  }

  .chip {
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink);
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 2px 8px;
  }

  .chip.accent {
    color: var(--accent);
  }

  .edit-btn {
    margin-left: auto;
    padding: 2px 8px;
    font-size: 11px;
  }

  .no-rules {
    font-size: 12px;
    color: var(--ink-3);
    padding: 16px 0;
    margin: 0;
  }

  .default-rule {
    margin-top: 16px;
    padding: 12px 14px;
    background: var(--bg-3);
    border-radius: 6px;
    border: 1px solid var(--line);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .default-label {
    color: var(--ink-2);
  }

  .audit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
    color: var(--ink-2);
  }

  .audit-ts {
    font-size: 11px;
    color: var(--ink-3);
    min-width: 160px;
  }

  .audit-detail {
    color: var(--ink-3);
    flex: 1;
  }

  .audit-actor {
    color: var(--ink-3);
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-align: center;
    padding: 64px 24px;
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
