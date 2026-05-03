<script lang="ts">
  let { action }: { action: string } = $props()

  const colors: Record<string, [string, string]> = {
    'flag.toggle':  ['var(--accent-dim)',        'var(--accent)'],
    'flag.create':  ['rgba(80,180,120,0.15)',    '#74c99a'],
    'flag.update':  ['rgba(100,130,220,0.15)',   '#8fa8e8'],
    'flag.delete':  ['rgba(220,70,70,0.15)',     '#e06060'],
    'flag.rollout': ['rgba(100,130,220,0.15)',   '#8fa8e8'],
    'flag.rules':   ['rgba(100,130,220,0.15)',   '#8fa8e8'],
    'flag.eval':    ['var(--bg-3)',              'var(--ink-3)'],
    'segment.edit': ['rgba(180,140,80,0.15)',    '#c8a855'],
    'segment.eval': ['var(--bg-3)',              'var(--ink-3)'],
    'project.create':    ['rgba(50,190,130,0.15)',  '#40c890'],
    'project.rename':    ['rgba(60,160,230,0.15)',  '#50a8f0'],
    'project.archive':   ['rgba(230,120,50,0.15)',  '#e07830'],
    'project.unarchive': ['rgba(140,210,70,0.15)',  '#8ed040'],
    'org.create': ['rgba(50,180,170,0.15)',  '#40b0a8'],
    'org.rename': ['rgba(150,80,220,0.15)',  '#a060e0'],
    'org.delete': ['rgba(220,70,70,0.15)',   '#e06060'],
    'org.plan':   ['rgba(180,140,80,0.15)',  '#c8a855'],
    'org.invite': ['rgba(190,80,210,0.15)',  '#c060d8'],
    'org.join':   ['rgba(220,80,150,0.15)',  '#e05090'],
    'role.create':      ['rgba(80,180,120,0.15)',  '#74c99a'],
    'role.delete':      ['rgba(220,70,70,0.15)',   '#e06060'],
    'role.update_perms':['rgba(100,130,220,0.15)', '#8fa8e8'],
    'member.role':      ['rgba(180,140,80,0.15)',  '#c8a855'],
    'env.create': ['rgba(80,180,120,0.15)',    '#74c99a'],
    'env.rename': ['rgba(100,130,220,0.15)',   '#8fa8e8'],
    'env.delete': ['rgba(220,70,70,0.15)',     '#e06060'],
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
