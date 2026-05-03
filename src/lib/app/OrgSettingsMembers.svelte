<script lang="ts">
  import { orgStore } from '../org.svelte'
  import { fetchOrgMembers, fetchOrgRoles, updateMemberRole, type OrgMemberDTO, type OrgRoleDTO } from '../api/organizations'
  import { notify } from '../toasts.svelte'
  import Panel from './Panel.svelte'

  const org = $derived(orgStore.activeOrg)

  let members = $state<OrgMemberDTO[]>([])
  let membersLoading = $state(false)
  let membersError = $state<string | null>(null)
  let inviteEmail = $state('')
  let openRoleMenuId = $state<string | null>(null)

  let roles = $state<OrgRoleDTO[]>([])
  let rolesLoading = $state(false)

  $effect(() => {
    if (!org?.id) return
    membersLoading = true
    membersError = null
    fetchOrgMembers(org.id).then(r => {
      membersLoading = false
      if (r.ok) members = r.data
      else membersError = r.message
    })
  })

  $effect(() => {
    if (!org?.id) return
    rolesLoading = true
    fetchOrgRoles(org.id).then(r => {
      rolesLoading = false
      if (r.ok) roles = r.data
    })
  })

  function toggleRoleMenu(memberId: string) {
    openRoleMenuId = openRoleMenuId === memberId ? null : memberId
  }

  async function setMemberRole(member: OrgMemberDTO, role: string) {
    if (!org?.id) return
    const targetRole = roles.find(r => r.name.toLowerCase() === role.toLowerCase())
    if (!targetRole) return

    const r = await updateMemberRole(org.id, member.userId, targetRole.id)
    if (r.ok) {
      member.role = role.toLowerCase()
      notify.success('Role updated', `${member.username} is now ${role.toLowerCase()}.`)
    } else {
      notify.error('Update failed', r.message)
    }
    openRoleMenuId = null
  }

  function closeRoleMenu() {
    openRoleMenuId = null
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.role-dropdown-wrapper')) {
      openRoleMenuId = null
    }
  }

  $effect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  })

  function memberInitials(m: OrgMemberDTO) {
    if (m.firstName) return m.firstName[0].toUpperCase()
    return m.username[0].toUpperCase()
  }

  function displayRole(m: OrgMemberDTO) {
    if (m.isOwner) return 'Owner'
    return m.role.toLowerCase()
  }

  function roleStyle(m: OrgMemberDTO) {
    if (m.isOwner) return 'background:rgba(229,90,1,0.18);border-color:rgba(229,90,1,0.4);color:#E55A01'
    const r = roles.find(r => r.name.toLowerCase() === m.role.toLowerCase())
    if (r?.isProtected && r.name.toLowerCase() === 'admin') {
      return 'background:rgba(229,90,1,0.18);border-color:rgba(229,90,1,0.4);color:#E55A01'
    }
    if (r?.isProtected && r.name.toLowerCase() === 'editor') {
      return 'background:rgba(143,168,232,0.15);border-color:rgba(143,168,232,0.4);color:#8fa8e8'
    }
    return 'background:#1a1a1d;border-color:#26262a;color:#66666d'
  }

  function isOwner(m: OrgMemberDTO) {
    return m.isOwner
  }
</script>

<div class="content content-members">
  <div class="invite-bar">
    <input class="text-input" placeholder="Invite by email address…" bind:value={inviteEmail} />
    <button class="btn btn-primary btn-sm">Send invite</button>
  </div>

  <Panel title={'Members ' + members.length} overflow="visible">
    {#if membersLoading}
      <div class="list-empty mono">Loading…</div>
    {:else if membersError}
      <div class="list-empty mono" style="color:#e07070">{membersError}</div>
    {:else if members.length === 0}
      <div class="list-empty mono">No members</div>
    {:else}
      {#each members as m}
        <div class="member-row">
          <div class="member-avatar">{memberInitials(m)}</div>
          <div class="member-info">
            <span class="member-name">{m.firstName} {m.lastName}</span>
            <span class="member-handle mono">@{m.username}</span>
          </div>
          <span class="member-email mono">{m.email}</span>
          <div class="role-dropdown-wrapper">
            {#if isOwner(m)}
              <button
                class="role-dropdown role-dropdown-owner"
                style={roleStyle(m)}
                disabled
              >
                <span class="role-label mono">{displayRole(m)}</span>
              </button>
            {:else}
              <button
                class="role-dropdown"
                class:open={openRoleMenuId === m.userId}
                style={roleStyle(m)}
                onclick={() => toggleRoleMenu(m.userId)}
              >
                <span class="role-label mono">{displayRole(m)}</span>
                <span class="role-chevron" aria-hidden="true">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </span>
              </button>

              {#if openRoleMenuId === m.userId}
                <div class="role-menu" role="menu" tabindex="-1" onpointerleave={closeRoleMenu}>
                  {#if rolesLoading}
                    <div class="role-menu-loading mono">Loading…</div>
                  {:else}
                    {#each roles as r}
                      <button
                        class="role-menu-item"
                        class:active={m.role.toLowerCase() === r.name.toLowerCase()}
                        style={m.role.toLowerCase() === r.name.toLowerCase() ? roleStyle(m) : ''}
                        onclick={() => setMemberRole(m, r.name)}
                      >
                        <span class="role-menu-check">{m.role.toLowerCase() === r.name.toLowerCase() ? '✓' : ''}</span>
                        <span class="mono">{r.name.toLowerCase()}</span>
                        {#if r.isProtected}
                          <span class="role-menu-badge mono">SYSTEM</span>
                        {/if}
                      </button>
                    {/each}
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
          {#if !isOwner(m)}
            <button class="btn btn-danger btn-sm">Remove</button>
          {/if}
        </div>
      {/each}
    {/if}
  </Panel>
</div>

<style>
  .content {
    padding: 0 32px 64px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .content-members { max-width: calc(760px + 64px); }

  .list-empty {
    font-size: 12px;
    color: var(--ink-3);
    padding: 24px;
    text-align: center;
  }

  .invite-bar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .invite-bar .text-input { flex: 1; }

  .text-input {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--ink);
    font: 400 13px 'Geist', ui-sans-serif;
    padding: 9px 12px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .text-input:focus { border-color: var(--line-2); }
  .text-input::placeholder { color: var(--ink-4); }

  .member-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--line);
    transition: background 0.12s;
  }

  .member-row:last-child { border-bottom: none; }
  .member-row:hover { background: var(--bg-3); }

  .member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font: 600 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .member-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .member-name {
    font: 500 14px 'Geist', ui-sans-serif;
    color: var(--ink);
  }

  .member-handle {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .member-email {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .role-dropdown-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .role-dropdown {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 5px;
    border: 1px solid;
    background: transparent;
    cursor: pointer;
    outline: none;
    transition: opacity 0.15s;
    font: 600 11px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .role-dropdown:hover { opacity: 0.85; }
  .role-dropdown:disabled { opacity: 1; cursor: default; }

  .role-dropdown-owner {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 5px;
    border: 1px solid;
    background: transparent;
    cursor: default;
    font: 600 11px 'Geist Mono', ui-monospace, monospace;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .owner-badge {
    font-size: 9px;
    padding: 1px 4px;
    background: rgba(229,90,1,0.18);
    border: 1px solid rgba(229,90,1,0.4);
    border-radius: 3px;
    color: #E55A01;
  }

  .role-chevron {
    display: inline-flex;
    color: currentColor;
    opacity: 0.7;
    transition: transform 0.15s;
  }

  .role-dropdown.open .role-chevron {
    transform: rotate(180deg);
  }

  .role-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 8px;
    overflow: hidden;
    z-index: 10;
    min-width: 140px;
  }

  .role-menu-loading {
    padding: 12px;
    text-align: center;
    font-size: 11px;
    color: var(--ink-3);
  }

  .role-menu-item {
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
    transition: background 0.1s, color 0.1s;
  }

  .role-menu-item:hover {
    background: var(--line);
    color: var(--ink);
  }

  .role-menu-item.active {
    color: var(--ink);
    font-weight: 500;
  }

  .role-menu-check {
    width: 14px;
    text-align: center;
    flex-shrink: 0;
    font-size: 11px;
    color: var(--accent);
  }

  .role-menu-badge {
    margin-left: auto;
    font-size: 9px;
    padding: 1px 4px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 3px;
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
    white-space: nowrap;
  }

  .btn-sm { font-size: 12px; padding: 5px 10px; }

  .btn-primary { background: var(--ink); color: var(--bg); }
  .btn-primary:hover { opacity: 0.85; }

  .btn-danger { background: transparent; color: #e07070; border-color: #7a3333; }
  .btn-danger:hover:not(:disabled) { opacity: 0.75; }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
