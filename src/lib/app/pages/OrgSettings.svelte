<script lang="ts">
  import { orgStore } from '../../org.svelte'
  import TabBar from '../TabBar.svelte'
  import OrgSettingsGeneral from '../OrgSettingsGeneral.svelte'
  import OrgSettingsMembers from '../OrgSettingsMembers.svelte'
  import OrgSettingsRoles from '../OrgSettingsRoles.svelte'

  const org = $derived(orgStore.activeOrg)

  type Tab = 'general' | 'members' | 'roles'
  let activeTab = $state<Tab>('general')
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{org?.name ?? '—'}</span>
      <h1><span class="page-icon">⚙</span> organization settings</h1>
    </div>
  </header>

  {#if !org}
    <div class="content"><div class="empty mono">No organization selected</div></div>
  {:else}
    <TabBar
      tabs={[
        { id: 'general', label: 'General' },
        { id: 'members', label: 'Members' },
        { id: 'roles',   label: 'Roles' },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => activeTab = id as Tab}
    />

    {#if activeTab === 'general'}
      <OrgSettingsGeneral />
    {:else if activeTab === 'members'}
      <OrgSettingsMembers />
    {:else if activeTab === 'roles'}
      <OrgSettingsRoles />
    {/if}
  {/if}
</div>

<style>
  .page-shell {
    flex: 1;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }

  .page-header {
    padding: 32px 32px 20px;
    border-bottom: 1px solid var(--line);
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
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty {
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 64px 24px;
    text-align: center;
  }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
