<script lang="ts">
  let {
    desc,
    editing,
    matchType,
    ruleCount,
    mockUserCount,
    reachPct,
    sparkline,
    flagsUsingCount,
    onDescChange,
  }: {
    desc: string
    editing: boolean
    matchType: string
    ruleCount: number
    mockUserCount: number
    reachPct: number
    sparkline: number[]
    flagsUsingCount: number
    onDescChange: (v: string) => void
  } = $props()

  const TOTAL_USERS = 30000
</script>

<div class="hero-strip">
  <div class="hero-desc">
    <span class="caption">description</span>
    {#if editing}
      <textarea
        value={desc}
        oninput={e => onDescChange((e.target as HTMLTextAreaElement).value.slice(0, 256))}
        rows={3}
        class="hero-textarea"
      />
    {:else}
      {#if desc}
        <p class="hero-text">{desc}</p>
      {:else}
        <p class="hero-text"><span class="hero-text-empty">No description.</span></p>
      {/if}
    {/if}
  </div>

  <div class="hero-divider"></div>

  <div class="metrics-grid">
    <div class="metric">
      <span class="caption">matched users</span>
      <div class="metric-value accent">{mockUserCount.toLocaleString()}</div>
      <div class="metric-sub">
        <svg class="sparkline" viewBox="0 0 130 26" preserveAspectRatio="none">
          {#each sparkline as pt, i}
            <circle cx={i * (130 / 23)} cy={26 - pt * 26} r="1.5" fill="var(--accent)" opacity="0.6" />
          {/each}
          <path
            d={sparkline.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${i * (130 / 23)} ${26 - pt * 26}`).join(' ')}
            fill="none"
            stroke="var(--accent)"
            stroke-width="1.5"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>

    <div class="metric">
      <span class="caption">reach</span>
      <div class="metric-value">{reachPct.toFixed(1)}<span class="metric-unit">%</span></div>
      <div class="reach-bar-wrap">
        <div class="reach-bar">
          <div class="reach-fill" style="width: {Math.max(1, reachPct)}%"></div>
        </div>
        <span class="reach-label mono">of {TOTAL_USERS.toLocaleString()} users</span>
      </div>
    </div>

    <div class="metric">
      <span class="caption">match type</span>
      <div class="metric-value mono">{matchType}<span class="metric-unit">{matchType === 'AND' ? 'all rules' : 'any rule'}</span></div>
      <div class="metric-sub mono">{ruleCount} rule{ruleCount !== 1 ? 's' : ''} configured</div>
    </div>

    <div class="metric">
      <span class="caption">used in</span>
      <div class="metric-value">{flagsUsingCount}<span class="metric-unit">{flagsUsingCount === 1 ? 'flag' : 'flags'}</span></div>
      <div class="flag-dots">
        {#each Array.from({ length: Math.min(8, flagsUsingCount) }) as _, i}
          <span class="flag-dot filled" style="opacity: {0.5 + i * 0.06}"></span>
        {/each}
        {#each Array.from({ length: Math.max(0, 8 - flagsUsingCount) }) as _}
          <span class="flag-dot empty"></span>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .hero-strip {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 10px 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .caption {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .hero-text {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--ink);
    line-height: 1.55;
    max-width: 720px;
  }

  .hero-text-empty {
    color: var(--ink-3);
    font-style: italic;
  }

  .hero-textarea {
    width: 100%;
    resize: vertical;
    min-height: 64px;
    margin-top: 8px;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 8px 10px;
    color: var(--ink);
    font-family: 'Geist', ui-sans-serif;
    font-size: 13.5px;
    line-height: 1.5;
    outline: none;
    box-sizing: border-box;
  }

  .hero-divider {
    height: 1px;
    background: var(--line);
    margin: 0 -22px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 22px;
    row-gap: 18px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .metric-value {
    margin-top: 6px;
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 26px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1.05;
  }

  .metric-value.accent {
    color: var(--accent);
  }

  .metric-value.mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }

  .metric-unit {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .metric-sub {
    margin-top: 8px;
    font: 400 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    line-height: 1.4;
  }

  .sparkline {
    width: 130px;
    height: 26px;
  }

  .reach-bar-wrap {
    margin-top: 8px;
  }

  .reach-bar {
    background: var(--bg-3);
    border-radius: 99px;
    height: 4px;
    overflow: hidden;
  }

  .reach-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.3s ease;
  }

  .reach-label {
    margin-top: 6px;
    font-size: 10.5px;
    color: var(--ink-3);
  }

  .flag-dots {
    margin-top: 8px;
    display: flex;
    gap: 3px;
  }

  .flag-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .flag-dot.filled {
    background: var(--accent);
  }

  .flag-dot.empty {
    background: var(--bg-3);
    border: 1px solid var(--line);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>