<script lang="ts">
  let {
    title,
    icon,
    accent = false,
    seg = false,
    dim = false,
    style: customStyle = '',
    children,
  }: {
    title: string
    icon?: string
    accent?: boolean
    seg?: boolean
    dim?: boolean
    style?: string
    children?: any
  } = $props()
</script>

<div class="node" class:accent class:seg class:dim style={customStyle}>
  <div class="node-header">
    {#if icon}<span class="node-icon">{icon}</span>{/if}
    <span class="node-title">{title}</span>
  </div>
  {#if children}<div class="node-body">{@render children()}</div>{/if}
</div>

<style>
  .node {
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 8px;
    padding: 11px 13px;
    opacity: 1;
    transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.2s;
  }

  .node.dim {
    opacity: 0.3;
  }

  .node.accent {
    background: var(--accent-dim);
    border-color: var(--accent-line);
    box-shadow: 0 0 16px 2px rgba(229, 90, 1, 0.12), 0 0 4px rgba(229, 90, 1, 0.08);
  }

  .node.seg {
    background: var(--seg-dim);
    border-color: var(--seg-line);
    box-shadow: 0 0 14px 2px rgba(184, 125, 232, 0.10), 0 0 4px rgba(184, 125, 232, 0.06);
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 9px;
  }

  .node-icon {
    font-size: 10px;
    color: var(--ink-3);
    transition: color 0.25s ease;
  }

  .node.accent .node-icon {
    color: var(--accent);
  }

  .node.seg .node-icon {
    color: var(--seg-color);
  }

  .node-title {
    font: 600 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: color 0.25s ease;
  }

  .node.accent .node-title {
    color: var(--accent);
  }

  .node.seg .node-title {
    color: var(--seg-color);
  }

  .node-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
</style>
