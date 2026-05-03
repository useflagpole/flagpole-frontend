<script lang="ts">
  import { orgStore } from '../org.svelte'
  import { userStore } from '../user.svelte'
  import { notify } from '../toasts.svelte'
  import { updateOrganization, deleteOrganization } from '../api/organizations'
  import Panel from './Panel.svelte'

  const org = $derived(orgStore.activeOrg)

  let orgName = $state('')
  let orgNameOrig = $state('')
  let orgSaving = $state(false)
  let orgDeleting = $state(false)

  $effect(() => {
    if (org) { orgName = org.name; orgNameOrig = org.name }
  })

  const orgDirty = $derived(orgName.trim() !== orgNameOrig)

  async function saveOrgName() {
    if (!org || !orgDirty) return
    orgSaving = true
    const r = await updateOrganization(org.id, orgName.trim())
    orgSaving = false
    if (r.ok) {
      orgNameOrig = r.data.name
      orgName = r.data.name
      notify.success('Organization updated', `Renamed to "${r.data.name}".`)
    } else {
      notify.error('Update failed', r.message)
    }
  }

  async function doDeleteOrg() {
    if (!org) return
    if (!confirm(`Delete "${org.name}"? This cannot be undone.`)) return
    orgDeleting = true
    const r = await deleteOrganization(org.id)
    orgDeleting = false
    if (r.ok) {
      notify.success('Organization deleted', '')
      orgStore.clear()
      window.location.hash = '#/app'
    } else {
      notify.error('Delete failed', r.message)
    }
  }
</script>

<div class="content content-general">
  <Panel title="Organization">
    <div class="panel-body">
      <div class="field-row">
        <div class="field-label">
          <div class="field-title">Name</div>
          <div class="field-sub mono">Unique identifier for your organization</div>
        </div>
        <input class="text-input" bind:value={orgName} onkeydown={e => e.key === 'Enter' && orgDirty && saveOrgName()} />
      </div>
      <div class="field-row">
        <div class="field-label">
          <div class="field-title">Owner</div>
          <div class="field-sub mono">Account that created this organization</div>
        </div>
        <span class="field-value mono">{userStore.username}</span>
      </div>
      <div class="field-row">
        <div class="field-label">
          <div class="field-title">Plan</div>
          <div class="field-sub mono">Current billing plan</div>
        </div>
        <div class="plan-row">
          <span class="plan-badge mono">FREE</span>
          <a class="upgrade-link mono" href="#/app">Upgrade →</a>
        </div>
      </div>
      {#if orgDirty}
        <div class="save-row">
          <button class="btn btn-primary btn-sm" disabled={orgSaving} onclick={saveOrgName}>
            {orgSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      {/if}
    </div>
  </Panel>

  <Panel title="Danger zone" variant="danger">
    <div class="panel-body">
      <div class="field-row">
        <div class="field-label">
          <div class="field-title">Delete organization</div>
          <div class="field-sub mono">Permanently deletes all projects, flags, and members. Not reversible.</div>
        </div>
        <div>
          <button class="btn btn-danger" disabled={orgDeleting || true} onclick={doDeleteOrg}>
            {orgDeleting ? 'Deleting…' : 'Delete organization'}
          </button>
        </div>
      </div>
    </div>
  </Panel>
</div>

<style>
  .content {
    padding: 0 32px 64px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .content-general { max-width: calc(680px + 64px); }

  .panel-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 24px;
    align-items: center;
  }

  .field-title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 3px;
    color: var(--ink);
  }

  .field-sub {
    font-size: 12px;
    color: var(--ink-3);
  }

  .field-value {
    font-size: 13px;
    color: var(--ink-2);
  }

  .plan-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .plan-badge {
    font: 600 12px 'Geist Mono', ui-monospace, monospace;
    padding: 5px 12px;
    border-radius: 5px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    letter-spacing: 0.08em;
    color: var(--ink-3);
  }

  .upgrade-link {
    color: var(--accent);
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    text-decoration: none;
  }

  .upgrade-link:hover { text-decoration: underline; }

  .save-row {
    display: flex;
    justify-content: flex-end;
    padding-top: 4px;
  }

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

  .btn-danger { background: transparent; color: #e07070; border-color: #7a3333; }
  .btn-danger:hover:not(:disabled) { opacity: 0.75; }
  .btn-danger:disabled { opacity: 0.35; cursor: default; }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }
</style>
