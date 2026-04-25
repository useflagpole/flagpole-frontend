<script lang="ts">
  let { size = 18 }: { size?: number } = $props()
</script>

<!-- mirrors the logo-pole + logo-flag geometry, viewBox 0 0 18 18 -->
<svg
  width={size}
  height={size}
  viewBox="0 0 18 18"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="display:inline-block;vertical-align:middle;flex-shrink:0"
>
  <rect x="8" y="0" width="2" height="18" fill="currentColor" />
  <polygon points="10,2 17,2 15.6,4.5 17,7 10,7" fill="currentColor" />
</svg>
