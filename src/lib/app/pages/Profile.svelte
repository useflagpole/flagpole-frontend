<script lang="ts">
  import { session } from '../../session.svelte'
  import { userStore } from '../../user.svelte'
  import { updateUsername } from '../../api/users'
  import { notify } from '../../toasts.svelte'

  let usernameInput    = $state(userStore.username)
  let originalUsername = $state(userStore.username)
  let usernameSaving   = $state(false)
  let usernameError    = $state<string | null>(null)

  const saveUsername = async () => {
    if (!usernameInput.trim() || usernameInput.trim() === originalUsername) return
    usernameSaving = true
    usernameError = null
    const r = await updateUsername(session.userId, usernameInput.trim())
    usernameSaving = false
    if (r.ok) {
      originalUsername = r.data.username
      userStore.setUsername(r.data.username)
      notify.success('Username updated', `Now showing as @${r.data.username}.`)
    } else if (r.fields?.includes('username')) {
      usernameError = 'Username already taken.'
    } else {
      notify.error('Update failed', r.message)
    }
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">@{userStore.username}</span>
      <h1><span class="page-icon">◈</span> profile</h1>
    </div>
  </header>

  <div class="content">
    <div class="settings-col">

      <div class="panel">
        <div class="panel-bar"><span>Account</span></div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Email</div>
            </div>
            <span class="value-text mono">{userStore.email || '—'}</span>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">First name</div>
            </div>
            <span class="value-text mono">{userStore.firstName}</span>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Last name</div>
            </div>
            <span class="value-text mono">{userStore.lastName}</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar"><span>Username</span></div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Username</div>
              <div class="setting-sub mono">Shown in the sidebar</div>
            </div>
            <div>
              <input class="text-input" bind:value={usernameInput} autocomplete="off" spellcheck="false" />
              {#if usernameError}<div class="field-err mono">{usernameError}</div>{/if}
            </div>
          </div>
          <div class="save-row">
            <button
              class="btn btn-primary btn-sm"
              disabled={usernameInput.trim() === originalUsername || usernameSaving}
              onclick={saveUsername}
            >{usernameSaving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>

    </div>
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

  .text-input {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--ink);
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    padding: 9px 12px;
    outline: none;
    width: 100%;
  }

  .text-input:focus {
    border-color: var(--line-2);
  }

  .field-err {
    font-size: 11.5px;
    color: #e07070;
    margin-top: 5px;
  }

  .save-row {
    padding-top: 4px;
    display: flex;
    justify-content: flex-end;
  }

  .btn {
    display: inline-flex;
    align-items: center;
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

  .btn-primary:hover { opacity: 0.85; }

  .btn-primary:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
