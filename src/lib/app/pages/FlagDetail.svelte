<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { projectStore } from '../../project.svelte'
  import { fetchProjectAuditLog, type AuditLogDTO } from '../../api/projects'
  import EvalChart from '../EvalChart.svelte'
  import ActionBadge from '../ActionBadge.svelte'
  import FlagIcon from '../FlagIcon.svelte'
  import FlagConfigFlow from '../FlagConfigFlow.svelte'

  let { activeProject, projectName, activeFlag, nav }: {
    activeProject: string
    projectName: string
    activeFlag: string
    nav: (p: string) => void
  } = $props()

  const orgId = $derived(orgStore.activeId)
  const projId = $derived(projectStore.projects.find(p => String(p.id) === activeProject)?.id ?? 0)

  type MockFlag = {
    id: string
    key: string
    type: 'bool' | 'string' | 'number'
    status: 'on' | 'off'
    rollout: number
    rolloutEnabled: boolean
    defaultValue: string
    servedValue: string
    desc: string
    envs: Record<string, number>
    evals: number
    segmentOverrides: {
      id: string
      name: string
      userCount: number
      value: string
      enabled: boolean
    }[]
  }

  const MOCK_FLAGS: MockFlag[] = [
    { id: 'f1',  key: 'new-checkout-v2',    type: 'bool',   status: 'on',  rollout: 74,  rolloutEnabled: true,  defaultValue: 'false', servedValue: 'true',  desc: 'New redesigned checkout flow.',       envs: { production: 74, staging: 100, dev: 100 }, evals: 182400, segmentOverrides: [
      { id: 's1', name: 'beta-users', userCount: 1240, value: 'true', enabled: true },
      { id: 's2', name: 'pro-plan', userCount: 8420, value: 'true', enabled: true },
    ]},
    { id: 'f2',  key: 'dark-mode',           type: 'bool',   status: 'on',  rollout: 50,  rolloutEnabled: true,  defaultValue: 'false', servedValue: 'true',  desc: 'Dark mode toggle for all authenticated users.',            envs: { production: 50,  staging: 100, dev: 100 }, evals: 94200,  segmentOverrides: [] },
    { id: 'f3',  key: 'ai-summaries',        type: 'bool',   status: 'off', rollout: 0,   rolloutEnabled: false, defaultValue: 'false', servedValue: 'true',  desc: 'AI-generated invoice and report summaries.',               envs: { production: 0,   staging: 10,  dev: 100 }, evals: 0,      segmentOverrides: [] },
    { id: 'f4',  key: 'rate-limit-v3',       type: 'number', status: 'on',  rollout: 30,  rolloutEnabled: true,  defaultValue: '1000',  servedValue: '500',   desc: 'New rate limiting algorithm, rolling out to 30%.',         envs: { production: 30,  staging: 100, dev: 100 }, evals: 54800,  segmentOverrides: [] },
    { id: 'f5',  key: 'billing-weekly',      type: 'bool',   status: 'on',  rollout: 12,  rolloutEnabled: true,  defaultValue: 'false', servedValue: 'true',  desc: 'Weekly billing cycle option for Pro plans.',               envs: { production: 12,  staging: 100, dev: 100 }, evals: 21000,  segmentOverrides: [] },
    { id: 'f6',  key: 'referral-program',    type: 'string', status: 'off', rollout: 0,   rolloutEnabled: false, defaultValue: '',      servedValue: 'bonus', desc: 'New referral incentive program.',                          envs: { production: 0,   staging: 0,   dev: 0   }, evals: 0,      segmentOverrides: [] },
    { id: 'f7',  key: 'onboarding-split-a',  type: 'string', status: 'on',  rollout: 50,  rolloutEnabled: true,  defaultValue: 'control', servedValue: 'new',   desc: 'A/B test: new vs classic onboarding flow.',                envs: { production: 50,  staging: 100, dev: 100 }, evals: 8800,   segmentOverrides: [] },
    { id: 'f8',  key: 'sentry-replay',       type: 'bool',   status: 'on',  rollout: 100, rolloutEnabled: false, defaultValue: 'true',  servedValue: 'true',  desc: 'Session replay enabled for all sessions.',                 envs: { production: 100, staging: 100, dev: 0   }, evals: 182000, segmentOverrides: [] },
  ]

  const MOCK_ENVS = ['production', 'staging', 'dev']

  function sparkline(peak: number, noise: number): number[] {
    return Array.from({ length: 28 }, (_, i) => {
      const base = Math.sin(i / 4) * 0.3 + 0.6
      return Math.max(0, Math.round(peak * base * (0.85 + Math.random() * noise)))
    })
  }

  const MOCK_EVAL_SERIES: Record<string, number[]> = {
    'new-checkout-v2': sparkline(7200, 0.15),
    'dark-mode':       sparkline(3800, 0.25),
    'sentry-replay':   sparkline(7000, 0.12),
    'rate-limit-v3':   sparkline(2200, 0.35),
    'billing-weekly':  sparkline(850,  0.4),
  }

  const MOCK_AUDIT: AuditLogDTO[] = [
    { id: 1, createdAt: '2026-04-19T14:32:00Z', orgId: 1, projectId: 1, actor: 'sarah@acme.co',  action: 'flag.toggle',  target: 'new-checkout-v2',  detail: 'Enabled in production',                    env: 'production' },
    { id: 2, createdAt: '2026-04-19T13:18:00Z', orgId: 1, projectId: 1, actor: 'dan@acme.co',    action: 'flag.rollout', target: 'dark-mode',        detail: 'Rollout changed 50% → 74%',                env: 'production' },
    { id: 3, createdAt: '2026-04-19T11:45:00Z', orgId: 1, projectId: 1, actor: 'dan@acme.co',    action: 'flag.create',  target: 'csv-export-v2',    detail: 'Flag created',                             env: 'staging'    },
    { id: 4, createdAt: '2026-04-19T10:02:00Z', orgId: 1, projectId: 1, actor: 'api-key',        action: 'flag.eval',    target: 'rate-limit-v3',    detail: '54,800 evaluations in last hour',          env: 'production' },
    { id: 5, createdAt: '2026-04-18T17:50:00Z', orgId: 1, projectId: 1, actor: 'sarah@acme.co',  action: 'segment.edit', target: 'beta-users',       detail: 'Added rule: email ends_with @partner.io',  env: '' },
    { id: 6, createdAt: '2026-04-18T16:22:00Z', orgId: 1, projectId: 1, actor: 'jay@acme.co',    action: 'flag.toggle',  target: 'ai-summaries',     detail: 'Disabled in production',                   env: 'production' },
    { id: 7, createdAt: '2026-04-18T14:00:00Z', orgId: 1, projectId: 1, actor: 'jay@acme.co',    action: 'flag.rollout', target: 'billing-weekly',   detail: 'Rollout changed 5% → 12%',                 env: 'production' },
    { id: 8, createdAt: '2026-04-18T11:30:00Z', orgId: 1, projectId: 1, actor: 'sarah@acme.co',  action: 'flag.rules',   target: 'new-checkout-v2',  detail: 'Added targeting rule: plan = pro',         env: 'production' },
  ]

  let flag = $state<MockFlag | null>(null)
  let flagAudit = $state<AuditLogDTO[]>([])
  let chartSeries = $state<number[]>([])

  let env = $state('production')
  let loading = $state(false)
  let auditLoading = $state(false)

  function loadFlag() {
    if (!activeFlag) return
    loading = true
    const found = MOCK_FLAGS.find(f => f.id === activeFlag) ?? MOCK_FLAGS[0]
    flag = found
    flagAudit = MOCK_AUDIT.filter(a => a.target === found.key).slice(0, 5)
    chartSeries = MOCK_EVAL_SERIES[found.key] ?? MOCK_EVAL_SERIES['rate-limit-v3'] ?? []
    loading = false
  }

  $effect(() => {
    if (activeFlag) loadFlag()
  })

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  }
</script>

{#if loading && !flag}
  <div class="page-shell">
    <div class="empty mono" style="padding: 64px; color: var(--ink-3)">Loading…</div>
  </div>
{:else if flag}
<div class="page-shell">
  <header class="page-header">
    <span class="eyebrow">{projectName}</span>
    <div class="title-row">
      <button class="back-btn" onclick={() => nav('flags')}>←</button>
      <h1><span class="page-icon"><FlagIcon size={22} /></span> <span class="title-prefix">flags /</span> <span class="mono">{flag.key}</span></h1>
      <div class="actions">
        <button class="btn btn-danger btn-sm">Archive</button>
      </div>
    </div>
  </header>

  <div class="content">
    <div class="env-tabs">
      {#each MOCK_ENVS as e}
        <button class="env-tab" class:active={env === e} onclick={() => env = e}>{e}</button>
      {/each}
    </div>

    <FlagConfigFlow flag={{
      key: flag.key,
      type: flag.type,
      desc: flag.desc,
      status: flag.status,
      rollout: flag.envs[env] ?? flag.rollout,
      rolloutEnabled: flag.rolloutEnabled,
      defaultValue: flag.defaultValue,
      servedValue: flag.servedValue,
      segmentOverrides: flag.segmentOverrides,
    }} />

    <div class="panel">
      <div class="panel-bar">
        <span>Evaluations · last 7 days</span>
        <span class="panel-bar-right">{flag.evals > 0 ? `${flag.evals.toLocaleString()} total` : '—'}</span>
      </div>
      <div class="panel-body">
        {#if flag.evals > 0}
          <EvalChart series={chartSeries} />
          <div class="eval-stats">
            {#each [
              ['AVG / DAY', Math.round(flag.evals / 7).toLocaleString()],
              ['PEAK',      Math.round(flag.evals / 5).toLocaleString()],
              ['UNIQUE',    Math.round(flag.evals / 3.2).toLocaleString()],
            ] as [k, v]}
              <div>
                <div class="stat-label mono">{k}</div>
                <div class="stat-value">{v}</div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon">◌</div>
            <div class="empty-text mono">No evaluations yet</div>
          </div>
        {/if}
      </div>
    </div>

    <div class="panel">
      <div class="panel-bar">
        <span>Audit trail · {flag.key}</span>
      </div>
      {#if auditLoading}
        <div class="empty mono">Loading…</div>
      {:else if flagAudit.length === 0}
        <div class="empty mono">No audit events</div>
      {:else}
        {#each flagAudit as a}
          <div class="audit-row">
            <span class="audit-ts mono">{formatDate(a.createdAt)}</span>
            <ActionBadge action={a.action} />
            <span class="audit-detail">{a.detail}</span>
            <span class="audit-actor mono">{a.actor}</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
{:else}
  <div class="page-shell">
    <div class="empty mono" style="padding: 64px; color: var(--ink-3)">Flag not found</div>
  </div>
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
    transition: color 0.1s;
  }

  .env-tab.active {
    color: var(--ink);
    border-bottom-color: var(--accent);
    font-weight: 500;
  }

  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 16px;
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

  .eval-stats {
    display: flex;
    gap: 24px;
    margin-top: 14px;
  }

  .stat-label {
    font-size: 10.5px;
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

  .empty-state {
    text-align: center;
    padding: 40px 0;
  }

  .empty-icon {
    font-size: 28px;
    margin-bottom: 12px;
    color: var(--ink-3);
  }

  .empty-text {
    font-size: 13px;
    color: var(--ink-3);
  }

  .audit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
    color: var(--ink-2);
    transition: background 0.1s;
  }

  .audit-row:hover {
    background: var(--bg-3);
  }

  .audit-row:last-child {
    border-bottom: none;
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
    font-size: 11px;
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
