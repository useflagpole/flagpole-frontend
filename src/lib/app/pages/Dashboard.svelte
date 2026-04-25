<script lang="ts">
  import { projects, flags, segments, auditLog, evalSeries } from '../data'
  import EvalChart from '../EvalChart.svelte'
  import MiniSparkline from '../MiniSparkline.svelte'
  import ActionBadge from '../ActionBadge.svelte'

  let { activeProject, projectName, nav, onSelectFlag }: {
    activeProject: string
    projectName: string
    nav: (p: string) => void
    onSelectFlag: (id: string) => void
  } = $props()

  const proj        = $derived(projects.find(p => p.id === activeProject) ?? projects[0])
  const projFlags   = $derived(flags[proj.id] ?? [])
  const topFlags    = $derived([...projFlags].filter(f => f.evals > 0).sort((a, b) => b.evals - a.evals).slice(0, 5))
  const recentAudit = $derived(auditLog.filter(a => a.projectId === proj.id).slice(0, 5))
  const enabledCount = $derived(projFlags.filter(f => f.status === 'on').length)
  const totalEvals   = $derived(topFlags.reduce((s, f) => s + f.evals, 0))
</script>

<div class="page-shell">
  <header class="page-header">
    <div class="page-title-area">
      <span class="eyebrow">{projectName}</span>
      <h1>Dashboard</h1>
    </div>
  </header>

  <div class="content">
    <div class="stat-grid">
      {#each [
        ['Total flags',  projFlags.length,            `${enabledCount} enabled`],
        ['Enabled',      enabledCount,                `${projFlags.length - enabledCount} off`],
        ['Segments',     segments.length,             'project-wide'],
        ['Evaluations',  totalEvals.toLocaleString(), 'last 7 days'],
      ] as [label, value, sub]}
        <div class="stat-card">
          <div class="stat-label">{label}</div>
          <div class="stat-value">{value}</div>
          <div class="stat-sub">{sub}</div>
        </div>
      {/each}
    </div>

    <div class="two-col">
      <div class="panel">
        <div class="panel-bar">
          <span>Evaluation volume · last 7 days</span>
          <span style="color: var(--ink-2)">production</span>
        </div>
        <div class="chart-wrap">
          <EvalChart series={evalSeries.total} />
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>Top flags by evaluations</span>
        </div>
        {#each topFlags as f}
          <button class="flag-row" onclick={() => onSelectFlag(f.id)}>
            <span class="pill" class:on={f.status === 'on'}>{f.status}</span>
            <span class="flag-key mono">{f.key}</span>
            <MiniSparkline data={evalSeries[f.key] ?? evalSeries['rate-limit-v3']} width={60} height={24} />
            <span class="evals-num mono">{f.evals.toLocaleString()}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="panel">
      <div class="panel-bar">
        <span>Recent changes</span>
        <button class="link-btn" onclick={() => nav('auditlog')}>View all →</button>
      </div>
      {#each recentAudit as a}
        <div class="audit-row">
          <span class="audit-time mono">{a.ts.split(' ')[1]}</span>
          <ActionBadge action={a.action} />
          <span class="target mono">{a.target}</span>
          <span class="detail">{a.detail}</span>
          <span class="actor">{a.actor}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .page-shell {
    flex: 1;
    overflow: auto;
    background: var(--bg);
  }

  .page-header {
    padding: 32px 32px 0;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
  }

  .page-title-area {
    padding-bottom: 20px;
  }

  h1 {
    margin: 0;
    font-weight: 500;
    font-size: clamp(22px, 2vw, 28px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .eyebrow {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .content {
    padding: 0 32px 64px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 20px 22px;
  }

  .stat-label {
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 36px;
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--ink);
    margin-bottom: 6px;
  }

  .stat-sub {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .two-col {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
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

  .chart-wrap {
    padding: 20px 24px;
  }

  .flag-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    transition: background .1s;
  }

  .flag-row:hover {
    background: var(--bg-3);
  }

  .flag-key {
    font-size: 12px;
    color: var(--ink);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .evals-num {
    font-size: 11.5px;
    color: var(--ink-3);
    min-width: 54px;
    text-align: right;
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
    white-space: nowrap;
  }

  .pill.on {
    color: var(--accent);
    border-color: var(--accent-line);
    background: var(--accent-dim);
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

  .audit-time {
    font-size: 11px;
    color: var(--ink-3);
    min-width: 60px;
    flex-shrink: 0;
  }

  .target {
    font-size: 12px;
    color: var(--ink);
  }

  .detail {
    color: var(--ink-3);
    font-size: 12px;
    flex: 1;
  }

  .actor {
    color: var(--ink-3);
    font-size: 12px;
  }

  .link-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--accent);
    font-size: 12px;
    padding: 0;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
