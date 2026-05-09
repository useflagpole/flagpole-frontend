<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { projectStore } from '../../project.svelte'
  import { getFlagDetail, getFlagAudit, createFlagEnvConfig, listSegments, type FlagDetailDTO, type SegmentDTO, type AuditLogDTO } from '../../api/flags'
  import { listEnvironments } from '../../api/environments'
  import EvalChart from '../EvalChart.svelte'
  import ActionBadge from '../ActionBadge.svelte'
  import FlagIcon from '../FlagIcon.svelte'
  import FlagConfigFlow from '../FlagConfigFlow.svelte'

  let { activeProject, projectName, activeFlag, nav }: {
    activeProject: string
    projectName: string
    activeFlag: number
    nav: (p: string) => void
  } = $props()

  const orgId = $derived(orgStore.activeId)
  const projId = $derived(projectStore.projects.find(p => String(p.id) === activeProject)?.id ?? 0)

  let flag = $state<FlagDetailDTO | null>(null)
  let segments = $state<SegmentDTO[]>([])
  let flagAudit = $state<AuditLogDTO[]>([])
  let chartSeries = $state<number[]>([])
  let envs = $state<string[]>([])
  let env = $state('')
  let configExists = $state(false)

  let loading = $state(false)
  let auditLoading = $state(false)

  function sparkline(peak: number, noise: number): number[] {
    return Array.from({ length: 28 }, (_, i) => {
      const base = Math.sin(i / 4) * 0.3 + 0.6
      return Math.max(0, Math.round(peak * base * (0.85 + Math.random() * noise)))
    })
  }

  const MOCK_EVAL_SERIES: Record<string, number[]> = {}

  async function loadFlag() {
    if (!activeFlag || !orgId || !projId || !env) return
    loading = true
    const r = await getFlagDetail(orgId, projId, activeFlag, env)
    if (r.ok) {
      flag = r.data
      configExists = r.data.status !== ''
      chartSeries = MOCK_EVAL_SERIES[r.data.key] ?? []
    }
    loading = false
  }

  async function loadSegments() {
    if (!orgId || !projId) return
    const r = await listSegments(orgId, projId)
    if (r.ok) segments = r.data
  }

  async function loadEnvs() {
    if (!orgId || !projId) return
    const r = await listEnvironments(orgId, projId)
    if (r.ok && r.data.length > 0) {
      envs = r.data
      env = r.data[0]
      loadFlag()
      loadAudit()
    }
  }

  async function loadAudit() {
    if (!orgId || !projId || !activeFlag || !env) return
    auditLoading = true
    const r = await getFlagAudit(orgId, projId, activeFlag, env)
    auditLoading = false
    if (r.ok) flagAudit = r.data.slice(0, 5)
    else flagAudit = []
  }

  async function createConfigForEnv() {
    if (!activeFlag || !orgId || !projId || !env) return
    const r = await createFlagEnvConfig(orgId, projId, activeFlag, env)
    if (r.ok) {
      configExists = true
      notify.success('Config created', `Configuration created for ${env}`)
      loadFlag()
      loadAudit()
    } else {
      notify.error('Failed', r.message)
    }
  }

  function switchEnv(e: string) {
    env = e
    configExists = false
    loading = true
    loadFlag()
    loadAudit()
  }

  $effect(() => {
    if (activeFlag) {
      flag = null
      configExists = false
      env = ''
      loadSegments()
      loadEnvs()
    }
  })

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  }

  function onFlagSaved() {
    loadFlag()
    loadAudit()
  }
</script>

{#if envs.length === 0}
  <div class="page-shell">
    <header class="page-header">
      <span class="eyebrow">{projectName}</span>
      <div class="title-row">
        <button class="back-btn" onclick={() => nav('flags')}>←</button>
        <h1><span class="page-icon"><FlagIcon size={22} /></span> <span class="title-prefix">flags /</span> <span class="mono">No environments</span></h1>
      </div>
    </header>
    <div class="content">
      <div class="empty-state">
        <div class="empty-icon">⚠</div>
        <h2>No environments configured</h2>
        <p>You need to add at least one environment before configuring flags.</p>
        <button class="btn btn-primary" onclick={() => nav('settings')}>Go to Project Settings →</button>
      </div>
    </div>
  </div>
{:else if flag || loading}
  <div class="page-shell">
    <header class="page-header">
      <span class="eyebrow">{projectName}</span>
      <div class="title-row">
        <button class="back-btn" onclick={() => nav('flags')}>←</button>
        <h1><span class="page-icon"><FlagIcon size={22} /></span> <span class="title-prefix">flags /</span> <span class="mono">{flag ? flag.key : activeFlag}</span></h1>
      </div>
    </header>

    <div class="content">
      <div class="env-tabs">
        {#each envs as e}
          <button class="env-tab" class:active={env === e} onclick={() => switchEnv(e)}>{e}</button>
        {/each}
      </div>

      {#if loading}
        <div class="empty mono" style="padding: 64px; color: var(--ink-3)">Loading…</div>
      {:else if !configExists}
        <div class="config-missing-state">
          <div class="missing-icon">◌</div>
          <h2>Not configured for {env}</h2>
          <p>This flag has no configuration for the <strong>{env}</strong> environment.</p>
          <button class="btn btn-primary" onclick={createConfigForEnv}>
            Create configuration for {env}
          </button>
        </div>
      {:else}
        <FlagConfigFlow
          flag={{
            key: flag.key,
            type: flag.type,
            desc: flag.description,
            status: flag.status,
            rollout: flag.rollout,
            rolloutEnabled: flag.rolloutEnabled,
            defaultValue: String(flag.defaultValue ?? ''),
            servedValue: String(flag.servedValue ?? ''),
            segmentOverrides: flag.segmentOverrides.map(o => ({
              id: String(o.segmentId),
              name: o.name,
              userCount: o.userCount,
              value: String(o.value),
              enabled: o.enabled,
              priority: o.priority,
            })),
          }}
          env={env}
          segments={segments.map(s => ({ id: String(s.id), name: s.name }))}
          orgId={orgId}
          projectId={projId}
          flagId={flag.id}
          onSave={onFlagSaved}
        />

        <div class="panel">
          <div class="panel-bar">
            <span>Audit trail · {flag.key} · {env}</span>
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
      {/if}
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

  .empty-state {
    text-align: center;
    padding: 80px 40px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    max-width: 500px;
    margin: 60px auto;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .empty-state p {
    font-size: 14px;
    color: var(--ink-3);
    margin: 0 0 24px;
  }

  .config-missing-state {
    text-align: center;
    padding: 80px 40px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    max-width: 500px;
    margin: 60px auto;
  }

  .missing-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--ink-3);
  }

  .config-missing-state h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .config-missing-state p {
    font-size: 14px;
    color: var(--ink-3);
    margin: 0 0 24px;
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

  .btn-primary {
    background: var(--ink);
    color: var(--bg);
  }

  .btn-primary:hover {
    opacity: 0.85;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
