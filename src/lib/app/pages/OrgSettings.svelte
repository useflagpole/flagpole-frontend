<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import { userStore } from '../../user.svelte'
  import { fetchOrgMembers, type OrgMemberDTO } from '../../api/organizations'

  const org     = $derived(orgStore.activeOrg)
  const isAdmin = $derived(org?.role === 'admin')

  let members        = $state<OrgMemberDTO[]>([])
  let membersLoading = $state(false)
  let membersError   = $state<string | null>(null)

  $effect(() => {
    if (!org?.id) return
    membersLoading = true
    membersError   = null
    fetchOrgMembers(org.id).then(r => {
      membersLoading = false
      if (r.ok) members = r.data
      else membersError = r.message
    })
  })
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{org?.name ?? '—'}</span>
      <h1><span class="page-icon">⚙</span> organization settings</h1>
    </div>
  </header>

  <div class="content">
    {#if !org}
      <div class="empty mono">No organization selected</div>
    {:else}
    <div class="settings-col">

      <div class="panel">
        <div class="panel-bar"><span>Organization</span></div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Name</div>
              <div class="setting-sub mono">Unique identifier for your organization</div>
            </div>
            <span class="value-text mono">{org.name}</span>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Owner</div>
              <div class="setting-sub mono">Account that created this organization</div>
            </div>
            <span class="value-text mono">{userStore.username}</span>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Plan</div>
              <div class="setting-sub mono">Current billing plan</div>
            </div>
            <span class="plan-pill mono">free</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>Members <span class="member-count">{members.length}</span></span>
        </div>
        <div class="member-list">
          {#if membersLoading}
            <div class="list-empty mono">Loading…</div>
          {:else if membersError}
            <div class="list-empty mono" style="color:#e07070">{membersError}</div>
          {:else if members.length === 0}
            <div class="list-empty mono">No members found</div>
          {:else}
            {#each members as m, i}
              <div class="member-row" class:last={i === members.length - 1}>
                <div class="member-avatar">{m.firstName ? m.firstName[0].toUpperCase() : m.username[0].toUpperCase()}</div>
                <div class="member-info">
                  <span class="member-name">{m.firstName} {m.lastName}</span>
                  <span class="member-username mono">@{m.username}</span>
                </div>
                <span class="member-email mono">{m.email}</span>
                <span class="role-pill mono" class:admin={m.role === 'admin'}>{m.role}</span>
              </div>
            {/each}
          {/if}
        </div>
      </div>

    </div>
    {/if}
  </div>
</div>

<style>
  .page-shell {
    flex: 1;
    background: var(--bg);
  }

  .page-header {
    padding: 32px 32px 20px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 32px;
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

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 64px 24px;
    text-align: center;
  }

  .settings-col {
    max-width: 760px;
    display: flex;
    flex-direction: column;
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

  .member-count {
    color: var(--ink-4);
    margin-left: 6px;
  }

  .panel-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .setting-row {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 24px;
    align-items: center;
  }

  .setting-title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 3px;
  }

  .setting-sub {
    font-size: 12px;
    color: var(--ink-3);
  }

  .value-text {
    font-size: 13px;
    color: var(--ink-2);
  }

  .plan-pill {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
  }

  .member-list {
    padding: 0;
  }

  .list-empty {
    font-size: 12px;
    color: var(--ink-3);
    padding: 24px;
    text-align: center;
  }

  .member-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
  }

  .member-row.last {
    border-bottom: none;
  }

  .member-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font: 600 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .member-info {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1;
    min-width: 0;
  }

  .member-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
  }

  .member-username {
    font-size: 11.5px;
    color: var(--ink-3);
  }

  .member-email {
    font-size: 11.5px;
    color: var(--ink-3);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  .role-pill {
    font-size: 10.5px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 7px;
    border-radius: 4px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .role-pill.admin {
    color: var(--accent);
    border-color: var(--accent-line);
    background: var(--accent-dim);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
