<script lang="ts">
  let { series }: { series: number[] } = $props()
  const max  = $derived(Math.max(...series, 1))
  const w    = $derived(100 / (series.length - 1))
  const pts  = $derived(series.map((v, i) => `${i * w},${100 - (v / max) * 88}`).join(' '))
  const area = $derived(`${pts} ${(series.length - 1) * w},100 0,100`)
</script>

<svg
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  class="chart"
>
  <defs>
    <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.2" />
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
    </linearGradient>
  </defs>
  <polygon points={area} fill="url(#evalGrad)" />
  <polyline
    points={pts}
    fill="none"
    stroke="var(--accent)"
    stroke-width="1.5"
    stroke-linejoin="round"
    vector-effect="non-scaling-stroke"
  />
</svg>

<style>
  .chart {
    width: 100%;
    height: 120px;
    display: block;
    overflow: visible;
  }
</style>
