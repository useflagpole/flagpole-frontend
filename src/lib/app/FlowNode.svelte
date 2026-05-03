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
    transition: opacity 0.2s;
  }

  .node.dim {
    opacity: 0.3;
  }

  .node.accent {
    background: var(--accent-dim);
    border-color: var(--accent-line);
  }

  .node.seg {
    background: var(--seg-dim);
    border-color: var(--seg-line);
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
