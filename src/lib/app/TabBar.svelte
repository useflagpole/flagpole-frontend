<script lang="ts">
  let { tabs, activeTab, onTabChange, class: className = '' }: {
    tabs: { id: string; label: string }[]
    activeTab: string
    onTabChange: (id: string) => void
    class?: string
  } = $props()
</script>

<div class="tab-bar {className}">
  {#each tabs as tab}
    <button
      class="tab"
      class:active={activeTab === tab.id}
      onclick={() => onTabChange(tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</div>

<style>
  .tab-bar {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--line);
    padding: 0 32px;
    margin-bottom: 24px;
  }

  .tab {
    padding: 8px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    cursor: pointer;
    transition: color 0.1s;
  }

  .tab:hover { color: var(--ink); }

  .tab.active {
    color: var(--ink);
    border-bottom-color: var(--accent);
    font-weight: 500;
  }
</style>
