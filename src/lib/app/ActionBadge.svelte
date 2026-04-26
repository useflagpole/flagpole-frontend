<script lang="ts">
  let { action }: { action: string } = $props()

  const colors: Record<string, [string, string]> = {
    // flags
    'flag.toggle':  ['var(--accent-dim)',        'var(--accent)'], // teal (accent)
    'flag.create':  ['rgba(70,180,100,0.15)',     '#58c878'],       // green
    'flag.update':  ['rgba(80,120,220,0.15)',     '#7090e0'],       // blue
    'flag.delete':  ['rgba(220,70,70,0.15)',      '#e06060'],       // red
    'flag.rollout': ['rgba(110,90,240,0.15)',     '#8878f0'],       // indigo
    'flag.rules':   ['rgba(50,190,210,0.15)',     '#40c0d8'],       // cyan
    'flag.eval':    ['rgba(100,130,160,0.12)',    '#7090a8'],       // cool gray
    // segments
    'segment.edit': ['rgba(200,160,50,0.15)',     '#c8a038'],       // amber
    'segment.eval': ['rgba(140,120,100,0.12)',    '#908070'],       // warm gray
    // projects
    'project.create':    ['rgba(50,190,130,0.15)',  '#40c890'],     // emerald
    'project.rename':    ['rgba(60,160,230,0.15)',  '#50a8f0'],     // sky
    'project.archive':   ['rgba(230,120,50,0.15)',  '#e07830'],     // orange
    'project.unarchive': ['rgba(140,210,70,0.15)',  '#8ed040'],     // lime
    // organizations
    'org.create': ['rgba(50,180,170,0.15)',  '#40b0a8'],            // teal-green
    'org.rename': ['rgba(150,80,220,0.15)',  '#a060e0'],            // violet
    'org.invite': ['rgba(190,80,210,0.15)',  '#c060d8'],            // purple
    'org.join':   ['rgba(220,80,150,0.15)',  '#e05090'],            // pink
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
