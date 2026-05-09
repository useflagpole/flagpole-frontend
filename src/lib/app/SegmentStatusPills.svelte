<script lang="ts">
  let { ruleCount, matchType, flagsUsingCount, updatedAt, mockUserCount }: {
    ruleCount: number
    matchType: string
    flagsUsingCount: number
    updatedAt: string
    mockUserCount: number
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

<div class="status-pills">
  <span class="pill-active">
    <span class="pill-dot"></span>
    <span>active</span>
  </span>
  <span class="pill-sep"></span>
  <span>{mockUserCount.toLocaleString()} matched users</span>
  <span class="pill-sep"></span>
  <span>{ruleCount} rule{ruleCount !== 1 ? 's' : ''}</span>
  <span class="pill-sep"></span>
  <span>match <span class="pill-accent">{matchType}</span></span>
  <span class="pill-sep"></span>
  <span>{flagsUsingCount} flag{flagsUsingCount !== 1 ? 's' : ''} using</span>
  <span class="pill-sep"></span>
  <span>updated {timeAgo(updatedAt)}</span>
</div>

<style>
  .status-pills {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: -8px;
    margin-bottom: 24px;
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .pill-active {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
  }

  .pill-active span:last-child {
    color: var(--ink-2);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 10.5px;
    font-weight: 500;
  }

  .pill-sep {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--ink-4);
    display: inline-block;
    flex-shrink: 0;
  }

  .pill-accent {
    color: var(--accent);
    letter-spacing: 0.08em;
  }
</style>