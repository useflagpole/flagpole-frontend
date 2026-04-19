<script lang="ts">
  const flags = [
    { on: true,  key: 'new-checkout-v2',   tag: 'checkout', pct: 100 },
    { on: true,  key: 'dark-mode',          tag: 'ui',       pct: 74  },
    { on: false, key: 'ai-summaries',       tag: 'ai',       pct: 0   },
    { on: true,  key: 'rate-limit-v3',      tag: 'infra',    pct: 30  },
    { on: true,  key: 'billing-weekly',     tag: 'billing',  pct: 12  },
    { on: false, key: 'referral-program',   tag: 'growth',   pct: 0   },
    { on: true,  key: 'onboarding-split-a', tag: 'growth',   pct: 50  },
    { on: true,  key: 'sentry-replay',      tag: 'obs',      pct: 100 },
  ];
</script>

<div class="panel">
  <div class="panel-bar">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span class="path">app.flagpole.dev / flags</span>
    <span class="env">production ▾</span>
  </div>
  <div class="dash-body">
    <aside class="dash-side">
      <div class="side-item active">All flags <span class="mono">24</span></div>
      <div class="side-item">Targeting</div>
      <div class="side-item">Segments</div>
      <div class="side-item">Audit log</div>
      <div class="side-item">SDK keys</div>
      <div class="side-head">Environments</div>
      <div class="side-item">production</div>
      <div class="side-item">staging</div>
      <div class="side-item">dev</div>
    </aside>
    <div class="dash-main">
      <div class="dash-toolbar">
        <div class="ph-input">search flags…</div>
        <div class="tag">status: any</div>
        <div class="tag">owner: any</div>
        <div class="btn-mini">New flag</div>
      </div>
      <div class="dash-list">
        {#each flags as flag}
          <div class="row">
            <span class="pill" class:on={flag.on}>{flag.on ? 'on' : 'off'}</span>
            <span class="mono flag-key">{flag.key}</span>
            <span class="tag sm">{flag.tag}</span>
            <span class="bar"><span class="bar-fill" style="width:{flag.pct}%"></span></span>
            <span class="mono pct">{flag.pct}%</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .path { margin-left: 10px; }
  .env  { margin-left: auto; }

  .dash-body {
    display: grid;
    grid-template-columns: 180px 1fr;
    min-height: 420px;
  }

  .dash-side {
    border-right: 1px solid var(--line);
    padding: 14px 10px;
    font-size: 12.5px;
  }

  .side-head {
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 18px 8px 6px;
  }

  .side-item {
    padding: 6px 8px;
    color: var(--ink-2);
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
  }

  .side-item.active { background: var(--bg-3); color: var(--ink); }

  .dash-main { padding: 14px 16px; }

  .dash-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    align-items: center;
  }

  .ph-input {
    flex: 1;
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 7px 10px;
    color: var(--ink-3);
    font-size: 12.5px;
  }

  .btn-mini {
    background: var(--ink);
    color: var(--bg);
    padding: 6px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  .dash-list { border-top: 1px solid var(--line); }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
    color: var(--ink-2);
  }

  .row:last-child { border-bottom: 0; }

  .flag-key { color: var(--ink); flex-shrink: 0; }

  .bar {
    flex: 1;
    height: 3px;
    background: var(--bg-3);
    border-radius: 99px;
    overflow: hidden;
    max-width: 220px;
    margin-left: auto;
  }

  .bar-fill {
    display: block;
    height: 100%;
    background: var(--accent);
  }

  .pct {
    color: var(--ink-3);
    width: 42px;
    text-align: right;
    font-size: 11.5px;
  }

  @media (max-width: 780px) {
    .dash-body { grid-template-columns: 1fr; }
    .dash-side {
      border-right: 0;
      border-bottom: 1px solid var(--line);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .side-head { display: none; }
  }
</style>
