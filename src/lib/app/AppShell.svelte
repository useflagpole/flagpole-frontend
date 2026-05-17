<script lang="ts">
  import { session } from '../session.svelte'
  import { userStore } from '../user.svelte'
  import { orgStore } from '../org.svelte'
  import { projectStore } from '../project.svelte'
  import FlagIcon      from './FlagIcon.svelte'
  import Onboarding    from './Onboarding.svelte'
  import Dashboard     from './pages/Dashboard.svelte'
  import Projects      from './pages/Projects.svelte'
  import Flags         from './pages/Flags.svelte'
  import FlagDetail    from './pages/FlagDetail.svelte'
  import Segments      from './pages/Segments.svelte'
  import NewSegment    from './pages/NewSegment.svelte'
  import SegmentDetail from './pages/SegmentDetail.svelte'
  import AuditLog      from './pages/AuditLog.svelte'
  import Settings      from './pages/Settings.svelte'
  import Organizations from './pages/Organizations.svelte'
  import OrgSettings   from './pages/OrgSettings.svelte'
  import Profile       from './pages/Profile.svelte'
  import Snackbar      from './Snackbar.svelte'

  let page          = $state('dashboard')
  let activeProject = $state<number | null>(null)
  let activeFlag    = $state<number | null>(null)
  let activeSegment = $state('s1')
  let userMenuOpen  = $state(false)

  $effect(() => {
    if (session.isAuthenticated && session.userId) {
      userStore.fetch(session.userId)
    }
  })

  $effect(() => {
    const orgId = orgStore.activeId
    if (orgId) {
      projectStore.fetch(orgId).then(() => {
        activeProject = projectStore.projects[0]?.id ?? null
      })
    }
  })

  $effect(() => {
    activeProject
    activeFlag    = null
    activeSegment = 's1'
  })

  const activeProjectName = $derived(
    projectStore.projects.find(p => p.id === activeProject)?.name ?? ''
  )

  const activeOrgRole = $derived(
    orgStore.activeOrg?.role ?? ''
  )

  const nav = (p: string) => { page = p }

  $effect(() => {
    if (!userMenuOpen) return
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.user-wrap')) userMenuOpen = false
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  })

  const navItems = [
    { id: 'dashboard', label: 'dashboard', icon: '▲' },
    { id: 'flags',     label: 'flags',     icon: '⚑' },
    { id: 'segments',  label: 'segments',  icon: '◎' },
    { id: 'auditlog',  label: 'audit log', icon: '≡' },
    { id: 'settings',  label: 'settings',  icon: '⚙' },
  ]
</script>

{#if !orgStore.ready}
  <!-- fetching orgs, render nothing to avoid flash -->
{:else if orgStore.orgs.length === 0}
  <Onboarding onDone={() => { /* orgStore already has the new org from push() */ }} />
{:else}

<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">
        <div class="logo-pole"></div>
        <div class="logo-flag"></div>
      </div>
      <span class="brand-name">flagpole</span>
      <span class="brand-ver">v0.12</span>
    </div>

    <div class="project-switcher">
      <button class="section-label" class:active={page === 'projects'} onclick={() => nav('projects')}>
        <span>▦</span> projects
      </button>
      {#if projectStore.loading}
        <span class="proj-loading mono">loading…</span>
      {:else}
        {#each projectStore.projects as p}
          <button
            class="project-item"
            class:active={activeProject === p.id}
            onclick={() => { activeProject = p.id }}
          >
            <span class="mono" style="font-size: 12px">{p.name}</span>
          </button>
        {/each}
      {/if}
    </div>

    <nav class="nav">
      {#each navItems as item}
        <button
          class="nav-item"
          class:active={page === item.id}
          onclick={() => nav(item.id)}
        >
          {#if item.id === 'flags'}
            <span class="nav-icon" class:accent={page === item.id}><FlagIcon size={16} /></span>
          {:else}
            <span class="nav-icon" class:accent={page === item.id} class:lg={item.id === 'settings'}>{item.icon}</span>
          {/if}
          {item.label}
        </button>
      {/each}
    </nav>

    <div class="user-wrap">
      {#if userMenuOpen}
        <div class="user-menu">
          <button class="section-label menu-section-label" class:active={page === 'organizations'} onclick={() => { nav('organizations'); userMenuOpen = false }}>
            <span>⊞</span> Organizations
          </button>
          {#each orgStore.orgs as o}
            <div class="menu-org-row">
              <button
                class="menu-item menu-org-item"
                class:active={orgStore.activeId === o.id}
                onclick={() => orgStore.setActive(o.id)}
              >
                <span class="menu-check">{orgStore.activeId === o.id ? '✓' : ''}</span>
                {o.name}
              </button>
              <button class="org-cog" onclick={() => { nav('org-settings'); userMenuOpen = false }}>⚙</button>
            </div>
          {/each}
          <div class="menu-divider"></div>
          <button class="menu-item" onclick={() => { nav('profile'); userMenuOpen = false }}>
            <span class="menu-icon">◈</span> Profile
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item danger" onclick={() => { session.clear(); userStore.clear(); orgStore.clear(); window.location.hash = '#/login'; userMenuOpen = false }}>
            <span class="menu-icon">←</span> Log out
          </button>
        </div>
      {/if}

      <button
        class="user-row"
        class:open={userMenuOpen}
        onclick={() => userMenuOpen = !userMenuOpen}
      >
        <div class="avatar">{userStore.firstName ? userStore.firstName[0].toUpperCase() : '?'}</div>
        <div class="user-info">
          <div class="user-name">{userStore.username}</div>
          <div class="user-org mono">{orgStore.activeOrg?.name ?? '—'}<span class="user-role"> · {activeOrgRole}</span></div>
        </div>
      </button>
    </div>
  </aside>

  <main class="main">
    {#if page === 'dashboard'}
      <Dashboard
        activeProject={String(activeProject ?? '')}
        projectName={activeProjectName}
        {nav}
        onSelectFlag={id => { activeFlag = Number(id); nav('flagdetail') }}
      />
    {:else if page === 'projects'}
      <Projects
        activeProject={String(activeProject ?? '')}
        projectName={activeProjectName}
        orgName={orgStore.activeOrg?.name ?? ''}
        onSelectProject={id => { activeProject = Number(id); nav('flags') }}
        onOpenSettings={id => { activeProject = Number(id); nav('settings') }}
      />
    {:else if page === 'flags'}
      <Flags
        activeProject={String(activeProject ?? '')}
        projectName={activeProjectName}
        {nav}
        onSelectFlag={id => { activeFlag = Number(id); nav('flagdetail') }}
      />
    {:else if page === 'flagdetail'}
      <FlagDetail activeProject={String(activeProject ?? '')} projectName={activeProjectName} activeFlag={activeFlag ?? 0} {nav} />
    {:else if page === 'segments'}
      <Segments
        activeProject={String(activeProject ?? '')}
        projectName={activeProjectName}
        {nav}
        onSelectSegment={id => { activeSegment = id; nav('segmentdetail') }}
      />
    {:else if page === 'segmentnew'}
      <NewSegment
        activeProject={String(activeProject ?? '')}
        projectName={activeProjectName}
        {nav}
      />
    {:else if page === 'segmentdetail'}
      <SegmentDetail activeProject={String(activeProject ?? '')} projectName={activeProjectName} {activeSegment} {nav} />
    {:else if page === 'auditlog'}
      <AuditLog activeProject={String(activeProject ?? '')} projectName={activeProjectName} />
    {:else if page === 'settings'}
      <Settings activeProject={String(activeProject ?? '')} projectName={activeProjectName} />
    {:else if page === 'profile'}
      <Profile />
    {:else if page === 'organizations'}
      <Organizations {nav} onSelectOrg={id => { orgStore.setActive(id); nav('organizations') }} />
    {:else if page === 'org-settings'}
      <OrgSettings />
    {/if}
  </main>
</div>

<Snackbar />

{/if}

<style>
  .shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--bg-2);
    border-right: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;
  }

  .brand {
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo {
    width: 18px;
    height: 18px;
    position: relative;
    flex-shrink: 0;
  }

  .logo-pole {
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--ink);
  }

  .logo-flag {
    position: absolute;
    left: 10px;
    top: 2px;
    width: 7px;
    height: 5px;
    background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%);
  }

  .brand-name {
    font-weight: 600;
    letter-spacing: -0.01em;
    font-size: 14px;
  }

  .brand-ver {
    margin-left: auto;
    font: 500 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    background: var(--bg-3);
    border: 1px solid var(--line);
    padding: 2px 5px;
    border-radius: 4px;
  }

  .project-switcher {
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
  }

  .section-label span {
    font-size: 16px;
    line-height: 1;
  }

  .section-label {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    font: 500 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
    transition: color .1s;
  }

  .section-label:hover,
  .section-label.active {
    color: var(--accent);
  }

  .project-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: var(--ink-2);
    font-size: 13px;
    text-align: left;
    transition: background .1s;
  }

  .project-item:hover,
  .project-item.active {
    background: var(--bg-3);
    color: var(--ink);
  }

  .proj-loading {
    display: block;
    font-size: 11px;
    color: var(--ink-3);
    padding: 4px 8px;
  }

  .nav {
    padding: 10px 12px;
    flex: 1;
  }

  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 8px;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 2px;
    background: transparent;
    border: none;
    color: var(--ink-2);
    font-size: 13.5px;
    font-weight: 400;
    text-align: left;
    transition: background .1s;
  }

  .nav-item:hover,
  .nav-item.active {
    background: var(--bg-3);
    color: var(--ink);
  }

  .nav-item.active {
    font-weight: 500;
  }

  .nav-icon {
    font-size: 16px;
    color: var(--ink-3);
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .nav-icon.lg {
    font-size: 20px;
  }

  .nav-icon.accent {
    color: var(--accent);
  }

  .user-wrap {
    position: relative;
    border-top: 1px solid var(--line);
  }

  .user-menu {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 8px;
    right: 8px;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 8px;
    overflow: hidden;
    z-index: 10;
  }


  .menu-section-label {
    padding: 8px 12px 4px;
    margin-bottom: 0;
  }

  .menu-org-row {
    display: flex;
    align-items: center;
    transition: background .1s;
  }

  .menu-org-row:hover {
    background: var(--line);
  }

  .menu-org-row .menu-org-item {
    flex: 1;
  }

  .menu-org-row .menu-org-item:hover {
    background: transparent;
    color: var(--ink);
  }

  .org-cog {
    background: none;
    border: none;
    color: var(--ink-3);
    font-size: 16px;
    padding: 0 8px;
    cursor: pointer;
    opacity: 0;
    transition: opacity .15s, color .15s;
    flex-shrink: 0;
  }

  .menu-org-row:hover .org-cog {
    opacity: 1;
  }

  .org-cog:hover {
    color: var(--ink);
  }

  .menu-org-item {
    padding-left: 10px;
  }

  .menu-check {
    width: 14px;
    text-align: center;
    flex-shrink: 0;
    font-size: 11px;
    color: var(--accent);
  }

  .menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: transparent;
    border: none;
    color: var(--ink-2);
    font: 400 13px 'Geist', ui-sans-serif;
    cursor: pointer;
    text-align: left;
    transition: background .1s, color .1s;
  }

  .menu-item:hover {
    background: var(--line);
    color: var(--ink);
  }

  .menu-item.active {
    color: var(--ink);
  }

  .menu-item.danger {
    color: #e07070;
  }

  .menu-item.danger:hover {
    background: rgba(224, 112, 112, 0.1);
    color: #e07070;
  }

  .menu-icon {
    font-size: 12px;
    width: 14px;
    text-align: center;
    flex-shrink: 0;
  }

  .menu-divider {
    height: 1px;
    background: var(--line);
    margin: 2px 0;
  }

  .user-row {
    width: 100%;
    padding: 12px 8px 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background .1s;
  }

  .user-row:hover,
  .user-row.open {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .user-info {
    min-width: 0;
    flex: 1;
  }

  .user-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-org {
    font: 500 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--accent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }

  .user-role {
    padding-left: 6px;
    color: var(--ink-3);
  }

  .main {
    flex: 1;
    overflow: auto;
    background: var(--bg);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
