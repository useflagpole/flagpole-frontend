<script lang="ts">
  let { action }: { action: string } = $props()

  const colors: Record<string, [string, string]> = {
    'flag.toggle':  ['var(--accent-dim)', 'var(--accent)'],
    'flag.create':  ['rgba(80,180,120,0.15)', '#74c99a'],
    'flag.rollout': ['rgba(100,130,220,0.15)', '#8fa8e8'],
    'flag.rules':   ['rgba(100,130,220,0.15)', '#8fa8e8'],
    'segment.edit': ['rgba(180,140,80,0.15)', '#c8a855'],
    'flag.eval':    ['var(--bg-3)', 'var(--ink-3)'],
    'segment.eval': ['var(--bg-3)', 'var(--ink-3)'],
  }

  const [bg, color] = $derived(colors[action] ?? ['var(--bg-3)', 'var(--ink-3)'])
</script>

<span class="badge" style="background: {bg}; color: {color}">{action}</span>

<style>
  .badge {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }
</style>
