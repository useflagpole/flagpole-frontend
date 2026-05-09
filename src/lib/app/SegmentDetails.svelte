<script lang="ts">
  let {
    detail,
    matchType,
    rulesCount,
    mockUserCount,
    createdAt,
    updatedAt,
  }: {
    detail: { id: number; name: string }
    matchType: string
    rulesCount: number
    mockUserCount: number
    createdAt: string
    updatedAt: string
  } = $props()
</script>

<div class="panel">
  <div class="panel-bar"><span>Details</span></div>
  <div class="details-list">
    {#each [
      ['ID', String(detail.id)],
      ['Name', detail.name],
      ['Match type', matchType],
      ['Rules', String(rulesCount)],
      ['Matched users', mockUserCount.toLocaleString()],
      ['Created', createdAt],
      ['Updated', updatedAt],
    ] as [k, v]}
      <div class="details-row">
        <span class="details-key">{k}</span>
        <span class="details-val mono">{v}</span>
      </div>
    {/each}
  </div>
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

  .details-list {
    padding: 12px 16px;
  }

  .details-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 0;
    border-bottom: 1px solid var(--line);
  }

  .details-row:last-child {
    border-bottom: none;
  }

  .details-key {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .details-val {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--ink);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>