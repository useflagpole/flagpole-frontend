<script lang="ts">
  let { data, width = 120, height = 32 }: { data: number[]; width?: number; height?: number } = $props()
  const max = $derived(Math.max(...data, 1))
  const pts = $derived(data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (v / max) * height
    return `${x},${y}`
  }).join(' '))
</script>

<svg {width} {height} style="display: block; overflow: visible">
  <polyline
    points={pts}
    fill="none"
    stroke="var(--accent)"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</svg>
