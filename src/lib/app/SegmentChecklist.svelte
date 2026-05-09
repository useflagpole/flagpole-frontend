<script lang="ts">
  let {
    trimmed,
    isDuplicate,
    issues,
  }: {
    trimmed: string
    isDuplicate: boolean
    issues: { key: string; level: 'error' | 'warn'; msg: string }[]
  } = $props()
</script>

<div class="panel">
  <div class="panel-bar">
    <span>Checklist</span>
    <span class="panel-bar-right">{issues.length > 0 ? `${issues.length} to fix` : 'all set'}</span>
  </div>
  <div class="checklist-body">
    <div class="checklist-item">
      <span class="check-box" class:check-ok={trimmed && !isDuplicate}>
        {#if trimmed && !isDuplicate}✓{/if}
      </span>
      <span class="check-msg">{trimmed && !isDuplicate ? `Name "${trimmed}" is valid` : 'Name required & unique'}</span>
    </div>
    <div class="checklist-item">
      <span class="check-box" class:check-ok={!issues.some(i => i.key.startsWith('rule:'))}>
        {#if !issues.some(i => i.key.startsWith('rule:'))}✓{/if}
      </span>
      <span class="check-msg">All rules complete</span>
    </div>
    {#if issues.length > 0}
      <div class="checklist-issues">
        {#each issues as i}
          <div class="checklist-issue" class:issue-error={i.level === 'error'}>· {i.msg}</div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: visible;
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

  .checklist-body {
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12.5px;
  }

  .check-box {
    width: 14px;
    height: 14px;
    margin-top: 1px;
    flex-shrink: 0;
    border-radius: 3px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: var(--ink-3);
    line-height: 1;
  }

  .check-box.check-ok {
    background: var(--accent-dim);
    border-color: var(--accent-line);
    color: var(--accent);
  }

  .check-msg {
    color: var(--ink-2);
  }

  .checklist-issues {
    margin-top: 6px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .checklist-issue {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    line-height: 1.45;
  }

  .checklist-issue.issue-error {
    color: #c07070;
  }
</style>