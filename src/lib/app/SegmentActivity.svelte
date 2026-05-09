<script lang="ts">
  let { recentAudit }: {
    recentAudit: { createdAt: string; actor: string; action: string; detail: string }[]
  } = $props()

  function timeAgo(dateStr: string): string {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return 'today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 30) return `${diffDays} days ago`
    const months = Math.floor(diffDays / 30)
    return months === 1 ? '1 month ago' : `${months} months ago`
  }
</script>

<div class="panel">
  <div class="panel-bar">
    <span>Recent activity</span>
    <span class="panel-bar-right">{recentAudit.length}</span>
  </div>
  {#if recentAudit.length === 0}
    <div class="empty-state small">
      <span class="empty-text mono">No activity yet</span>
    </div>
  {:else}
    <div class="activity-list">
      {#each recentAudit as e}
        <div class="activity-item">
          <span class="activity-dot" class:accent={e.action.includes('create')}></span>
          <div class="activity-body">
            <div class="activity-text">{e.actor} {e.detail.toLowerCase()}</div>
            <div class="activity-time mono">{timeAgo(e.createdAt)} · {e.createdAt}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
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

  .panel-bar-right {
    color: var(--ink-2);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .empty-state.small {
    padding: 24px 0;
  }

  .empty-text {
    font-size: 12px;
    color: var(--ink-3);
  }

  .activity-list {
    padding: 6px 0;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 16px;
  }

  .activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--line-2);
    margin-top: 7px;
    flex-shrink: 0;
  }

  .activity-dot.accent {
    background: var(--accent);
  }

  .activity-body {
    flex: 1;
    min-width: 0;
  }

  .activity-text {
    font: 400 12.5px 'Geist', ui-sans-serif;
    color: var(--ink-2);
    line-height: 1.5;
  }

  .activity-time {
    font-size: 11px;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>