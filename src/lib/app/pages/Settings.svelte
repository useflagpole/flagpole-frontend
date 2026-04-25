<script lang="ts">
  import { projects, sdkKeys } from '../data'

  let { activeProject, projectName }: { activeProject: string; projectName: string } = $props()

  const proj = $derived(projects.find(p => p.id === activeProject) ?? projects[0])
  let copied = $state<string | null>(null)

  const copyKey = (id: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {})
    copied = id
    setTimeout(() => { copied = null }, 1800)
  }
</script>

<div class="page-shell">
  <header class="page-header">
    <div>
      <span class="eyebrow">{projectName}</span>
      <h1><span class="page-icon">⚙</span> settings</h1>
    </div>
  </header>

  <div class="content">
    <div class="settings-col">

      <div class="panel">
        <div class="panel-bar"><span>Project</span></div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Project name</div>
              <div class="setting-sub mono">Used in the SDK and dashboard</div>
            </div>
            <input class="text-input" value={proj.name} />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Owner</div>
              <div class="setting-sub mono">Workspace that owns this project</div>
            </div>
            <input class="text-input" value={proj.owner} readonly />
          </div>
          <div class="save-row">
            <button class="btn btn-primary btn-sm">Save</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>Environments</span>
          <button class="btn btn-ghost btn-sm">+ Add environment</button>
        </div>
        <div class="env-list">
          {#each proj.env as e}
            <div class="env-row">
              <div class="env-dot" class:prod={e === 'production'}></div>
              <span class="env-name mono">{e}</span>
              <span class="tag mono">{e === 'production' ? 'protected' : 'mutable'}</span>
              <button class="btn btn-ghost btn-sm">Rename</button>
              {#if e !== 'production'}
                <button class="btn btn-danger btn-sm">Delete</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="panel">
        <div class="panel-bar">
          <span>SDK keys</span>
          <button class="btn btn-ghost btn-sm">+ Create key</button>
        </div>
        <div>
          {#each sdkKeys as k, i}
            <div class="key-row" class:last={i === sdkKeys.length - 1}>
              <div class="key-header">
                <div>
                  <div class="key-label">{k.label}</div>
                  <div class="key-tags">
                    <span class="tag mono">{k.env}</span>
                    <span class="tag mono">{k.type}</span>
                  </div>
                </div>
                <div class="key-actions">
                  <span class="last-used mono">last used {k.lastUsed}</span>
                  <button class="btn btn-ghost btn-sm" onclick={() => copyKey(k.id, k.key)}>
                    {copied === k.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button class="btn btn-danger btn-sm">Revoke</button>
                </div>
              </div>
              <div class="key-val mono">{k.key}</div>
            </div>
          {/each}
        </div>
      </div>

      <div class="panel danger-panel">
        <div class="panel-bar">
          <span class="danger-title">Danger zone</span>
        </div>
        <div class="panel-body">
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Archive project</div>
              <div class="setting-sub mono">Disables all flags and removes from the dashboard. Reversible.</div>
            </div>
            <div><button class="btn btn-danger">Archive project</button></div>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <div class="setting-title">Delete project</div>
              <div class="setting-sub mono">Permanently deletes all flags, segments and SDK keys. Not reversible.</div>
            </div>
            <div><button class="btn btn-danger">Delete project</button></div>
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

  .danger-panel {
    border-color: #7a3333;
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

  .danger-title {
    color: #e07070;
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

  .save-row {
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
  }

  .text-input:focus {
    border-color: var(--line-2);
  }

  .env-list {
    padding: 14px 18px;
  }

  .env-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--line);
  }

  .env-row:last-child {
    border-bottom: none;
  }

  .env-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ink-4);
  }

  .env-dot.prod {
    background: var(--accent);
  }

  .env-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
    flex: 1;
  }

  .tag {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    padding: 2px 6px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--bg-3);
  }

  .key-row {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
  }

  .key-row.last {
    border-bottom: none;
  }

  .key-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .key-label {
    font-weight: 500;
    font-size: 13.5px;
    color: var(--ink);
  }

  .key-tags {
    display: flex;
    gap: 6px;
    margin-top: 5px;
  }

  .key-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .last-used {
    font-size: 11px;
    color: var(--ink-3);
  }

  .key-val {
    font-size: 12px;
    color: var(--ink-3);
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 7px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
