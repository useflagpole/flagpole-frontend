<script lang="ts">
  import { orgStore } from '../org.svelte'
  import { notify } from '../toasts.svelte'
  import {
    fetchOrgRoles,
    createOrgRole,
    deleteOrgRole,
    updateOrgRolePermissions,
    type OrgRoleDTO,
  } from '../api/organizations'
  import { PERMS, TOTAL_PERMS } from '../utils/permissions'

  const org = $derived(orgStore.activeOrg)

  let roles = $state<OrgRoleDTO[]>([])
  let rolesLoading = $state(false)
  let rolesError = $state<string | null>(null)

  let selectedRoleId = $state<number | null>(null)
  let rolesDirty = $state(false)
  let rolePerms = $state<Set<string>>(new Set())

  let addingRole = $state(false)
  let newRoleName = $state('')
  let newRoleNameDisplay = $state('')
  let roleSaving = $state(false)

  $effect(() => {
    if (!org?.id) return
    rolesLoading = true
    rolesError = null
    fetchOrgRoles(org.id).then(r => {
      rolesLoading = false
      if (r.ok) {
        roles = r.data
        if (roles.length > 0 && selectedRoleId === null) {
          selectRole(roles[0].id)
        }
      } else {
        rolesError = r.message
      }
    })
  })

  function selectRole(id: number) {
    const role = roles.find(r => r.id === id)
    if (!role) return
    selectedRoleId = id
    rolePerms = new Set(role.permissions)
    rolesDirty = false
  }

  const selectedRole = $derived(roles.find(r => r.id === selectedRoleId) ?? null)
  const enabledCount = $derived(rolePerms.size)

  function togglePerm(code: string) {
    if (selectedRole?.isProtected) return
    const next = new Set(rolePerms)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    rolePerms = next
    rolesDirty = true
  }

  function groupEnabledCount(groupItems: { code: string }[]) {
    return groupItems.filter(i => rolePerms.has(i.code)).length
  }

  function enableAll(groupItems: { code: string }[]) {
    if (selectedRole?.isProtected) return
    const next = new Set(rolePerms)
    groupItems.forEach(i => next.add(i.code))
    rolePerms = next
    rolesDirty = true
  }

  function disableAll(groupItems: { code: string }[]) {
    if (selectedRole?.isProtected) return
    const next = new Set(rolePerms)
    groupItems.forEach(i => next.delete(i.code))
    rolePerms = next
    rolesDirty = true
  }

  async function saveRolePerms() {
    if (!org || !selectedRole || selectedRole.isProtected) return
    roleSaving = true
    const r = await updateOrgRolePermissions(org.id, selectedRole.id, [...rolePerms])
    roleSaving = false
    if (r.ok) {
      roles = roles.map(ro => ro.id === r.data.id ? { ...ro, permissions: r.data.permissions } : ro)
      rolesDirty = false
              notify.success('Permissions saved', `"${selectedRole.name.toLowerCase()}" updated.`)
    } else {
      notify.error('Save failed', r.message)
    }
  }

  async function handleDeleteRole() {
    if (!org || !selectedRole || selectedRole.isProtected) return
    if (!confirm(`Delete role "${selectedRole.name.toLowerCase()}"?`)) return
    const r = await deleteOrgRole(org.id, selectedRole.id)
    if (r.ok) {
      roles = roles.filter(ro => ro.id !== selectedRole.id)
      selectedRoleId = roles[0]?.id ?? null
      if (selectedRoleId) selectRole(selectedRoleId)
      notify.success('Role deleted', '')
    } else {
      notify.error('Delete failed', r.message)
    }
  }

  async function confirmAddRole(e: KeyboardEvent | MouseEvent) {
    if (e instanceof KeyboardEvent && e.key !== 'Enter') return
    const trimmed = newRoleName.trim()
    if (!org || trimmed.length < 2) return
    const r = await createOrgRole(org.id, trimmed)
    if (r.ok) {
      roles = [...roles, r.data]
      addingRole = false
      newRoleName = ''
      newRoleNameDisplay = ''
      selectRole(r.data.id)
    } else {
      notify.error('Create failed', r.message)
    }
  }

  function cancelAddRole() {
    addingRole = false
    newRoleName = ''
    newRoleNameDisplay = ''
  }

  function openAddRole() {
    addingRole = true
    newRoleNameDisplay = ''
    setTimeout(() => {
      const el = document.getElementById('new-role-input')
      el?.focus()
    }, 40)
  }
</script>

<div class="content content-roles">
  {#if rolesLoading}
    <div class="list-empty mono">Loading…</div>
  {:else if rolesError}
    <div class="list-empty mono" style="color:#e07070">{rolesError}</div>
  {:else}
    <div class="roles-grid">
      <div class="role-list">
        {#each roles as role}
          <button
            class="role-card"
            class:active={selectedRoleId === role.id}
            onclick={() => selectRole(role.id)}
          >
            <div class="role-card-top">
              <span class="role-card-name" class:active={selectedRoleId === role.id}>{role.name.toLowerCase()}</span>
              {#if role.isProtected}
                <span class="system-badge mono">SYSTEM</span>
              {/if}
            </div>
            <span class="role-perm-count mono">{role.permissions.length}/{TOTAL_PERMS} perms</span>
          </button>
        {/each}

        {#if addingRole}
          <div class="add-role-form">
            <input
              id="new-role-input"
              class="add-role-input"
              bind:value={newRoleNameDisplay}
              placeholder="Role name…"
              oninput={() => { newRoleName = newRoleNameDisplay.trimStart().toLowerCase() }}
              onkeydown={e => {
                if (e.key === 'Enter') confirmAddRole(e)
                if (e.key === 'Escape') cancelAddRole()
              }}
            />
            <div class="add-role-btns">
              <button class="btn btn-primary btn-sm" style="flex:1" disabled={newRoleName.trim().length < 2} onclick={confirmAddRole}>Add</button>
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick={cancelAddRole}>Cancel</button>
            </div>
          </div>
        {:else}
          <button class="add-role-btn" onclick={openAddRole}>+ New role</button>
        {/if}
      </div>

      {#if selectedRole}
        <div class="panel perm-panel">
          <div class="perm-panel-header">
            <div>
              <div class="perm-panel-title">{selectedRole.name.toLowerCase()}</div>
              <div class="perm-panel-sub mono">
                {enabledCount} of {TOTAL_PERMS} permissions enabled
                {#if selectedRole.isProtected}
                  <span style="color:#c8a855"> · system role · read-only</span>
                {/if}
              </div>
            </div>
            <div class="perm-panel-actions">
              {#if !selectedRole.isProtected}
                <button class="btn btn-primary btn-sm" disabled={!rolesDirty || roleSaving} onclick={saveRolePerms}>
                  {roleSaving ? 'Saving…' : 'Save'}
                </button>
                <button class="btn btn-danger btn-sm" onclick={handleDeleteRole}>Delete role</button>
              {/if}
            </div>
          </div>

          {#each PERMS as group}
            {@const enabledInGroup = groupEnabledCount(group.items)}
            {@const allOn = enabledInGroup === group.items.length}
            <div class="perm-group">
              <div class="group-header">
                <div class="group-left">
                  <span class="group-name mono">{group.group.toUpperCase()}</span>
                  <span class="group-count mono">{enabledInGroup}/{group.items.length}</span>
                </div>
                {#if !selectedRole.isProtected}
                  <button
                    class="group-toggle mono"
                    style={allOn ? 'color:#E55A01' : 'color:#66666d'}
                    onclick={() => allOn ? disableAll(group.items) : enableAll(group.items)}
                  >
                    {allOn ? 'Disable all' : 'Enable all'}
                  </button>
                {/if}
              </div>

              {#each group.items as perm}
                {@const on = rolePerms.has(perm.code)}
                <button
                  class="perm-row"
                  class:perm-on={on}
                  disabled={selectedRole.isProtected}
                  onclick={() => togglePerm(perm.code)}
                >
                  <span class="perm-dot" class:perm-dot-on={on}></span>
                  <span class="perm-label" class:perm-label-on={on}>{perm.label}</span>
                  <span class="perm-toggle" class:perm-toggle-on={on} aria-hidden="true">
                    <span class="perm-thumb" class:perm-thumb-on={on}></span>
                  </span>
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .content {
    padding: 0 32px 64px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .content-roles { max-width: calc(900px + 64px); }

  .list-empty {
    font-size: 12px;
    color: var(--ink-3);
    padding: 24px;
    text-align: center;
  }

  .roles-grid {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 14px;
    align-items: start;
  }

  .role-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .role-card {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
  }

  .role-card:hover:not(.active) {
    background: var(--bg-3);
    border-color: var(--line);
  }

  .role-card.active {
    background: var(--bg-3);
    border-color: var(--line-2);
  }

  .role-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 3px;
  }

  .role-card-name {
    font: 500 13.5px 'Geist', ui-sans-serif;
    color: var(--ink-2);
  }

  .role-card-name.active { color: var(--ink); }

  .system-badge {
    font: 500 9.5px 'Geist Mono', ui-monospace, monospace;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .role-perm-count {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .add-role-btn {
    width: 100%;
    text-align: left;
    padding: 9px 12px;
    background: transparent;
    border: 1px dashed var(--line-2);
    border-radius: 8px;
    color: var(--ink-3);
    font: 400 13px 'Geist', ui-sans-serif;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    margin-top: 4px;
  }

  .add-role-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .add-role-form {
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }

  .add-role-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--ink);
    font: 400 13px 'Geist', ui-sans-serif;
    width: 100%;
  }

  .add-role-input::placeholder { color: var(--ink-4); }

  .add-role-btns {
    display: flex;
    gap: 5px;
  }

  .perm-panel {
    overflow: visible;
  }

  .perm-panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .perm-panel-title {
    font: 600 15px 'Geist', ui-sans-serif;
    color: var(--ink);
    margin-bottom: 3px;
  }

  .perm-panel-sub {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .perm-panel-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .perm-group {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-bottom: 1px solid var(--line);
  }

  .perm-group:last-child { border-bottom: none; }

  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: var(--bg-3);
    border-radius: 6px;
    margin-bottom: 4px;
  }

  .group-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-name {
    font: 600 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    letter-spacing: 0.08em;
  }

  .group-count {
    font: 400 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .group-toggle {
    background: none;
    border: none;
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.15s;
  }

  .group-toggle:hover { opacity: 0.75; }

  .perm-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px 9px 14px;
    border-radius: 5px;
    border: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background 0.12s;
  }

  .perm-row:not(:disabled):hover { background: var(--bg-3); }
  .perm-row:disabled { cursor: default; }

  .perm-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--line-2);
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .perm-dot.perm-dot-on { background: var(--accent); }

  .perm-label {
    flex: 1;
    font-size: 13.5px;
    color: var(--ink-3);
    transition: color 0.15s;
  }

  .perm-label.perm-label-on { color: var(--ink); }

  .perm-toggle {
    width: 36px;
    height: 20px;
    border-radius: 99px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    position: relative;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
    display: inline-block;
  }

  .perm-toggle.perm-toggle-on {
    background: rgba(229,90,1,0.18);
    border-color: rgba(229,90,1,0.4);
  }

  .perm-thumb {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--ink-4);
    transition: left 0.15s, background 0.15s;
  }

  .perm-thumb.perm-thumb-on {
    left: 17px;
    background: var(--accent);
  }

  .perm-row:disabled .perm-toggle { opacity: 0.5; }

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
  .btn-primary:disabled { opacity: 0.35; cursor: default; }

  .btn-ghost { background: transparent; color: var(--ink); border-color: var(--line-2); }
  .btn-ghost:hover { border-color: var(--ink); }

  .btn-danger { background: transparent; color: #e07070; border-color: #7a3333; }
  .btn-danger:hover:not(:disabled) { opacity: 0.75; }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
