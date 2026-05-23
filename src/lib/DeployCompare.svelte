<section class="section">
  <div class="page">
    <div class="sec-head">
      <h2>Run it yourself, or let us. Same software either way.</h2>
      <p>flagpole is open source. <span class="mono" style="color:var(--accent)">flagpole edge</span> is the same service, hosted globally and managed by us. Our offering is reliability and hassle-free.</p>
    </div>
    <div class="deploy">
      <div class="deploy-card">
        <div class="deploy-head">
          <span class="deploy-flag dim" aria-hidden="true"></span>
          <div class="deploy-name mono">SELF-HOSTED</div>
          <span class="deploy-badge">open source</span>
        </div>
        <h3>Run it on your hardware.</h3>
        <p>We provide an ecosystem, pick and choose the components you need. You own your data.</p>
        <ul class="deploy-list">
          <li><span class="deploy-tick">✓</span> Start with one docker image and scale as you grow</li>
          <li><span class="deploy-tick">✓</span> Your servers, your data, your region</li>
          <li><span class="deploy-tick dim">○</span> Edge cache is bring-your-own</li>
        </ul>
        <div class="deploy-price mono">$0 · forever</div>
        <a class="btn btn-ghost" href="#">Self-host guide →</a>
      </div>

      <div class="deploy-card featured">
        <div class="deploy-head">
          <span class="deploy-flag" aria-hidden="true"></span>
          <div class="deploy-name mono">FLAGPOLE EDGE</div>
          <span class="deploy-badge on">fully managed</span>
        </div>
        <h3>Let us run it. Globally.</h3>
        <p>Same software, hosted across 200+ POPs. Flags resolve in less than 10ms from the user's nearest edge. Zero ops, SOC2, generous free tier.</p>
        <ul class="deploy-list">
          <li><span class="deploy-tick on">✓</span> ~15ms p99 evaluation at the edge</li>
          <li><span class="deploy-tick on">✓</span> 99.99% SLA · SOC2 · GDPR</li>
          <li><span class="deploy-tick on">✓</span> Auto-scaling · backups · audit export</li>
          <li><span class="deploy-tick on">✓</span> Free for 10 envs &amp; 1M evals/mo</li>
          <li><span class="deploy-tick on">✓</span> Migrate to self-host any time</li>
        </ul>
        <div class="deploy-price mono">free tier · then <span style="color:var(--ink)">$0.10 / 1k evals</span></div>
        <a class="btn btn-accent node" href="#">Start on Edge — free</a>
      </div>
    </div>
  </div>
</section>

<style>
  .sec-head {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 64px;
    margin-bottom: 48px;
  }

  .sec-head h2 {
    font-size: clamp(34px, 4vw, 52px);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.05;
    margin: 0;
    text-wrap: balance;
  }

  .sec-head p {
    color: var(--ink-2);
    max-width: 42ch;
    font-size: 15px;
    align-self: end;
    margin: 0;
    text-wrap: pretty;
  }

  .deploy {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .deploy-card {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
  }

  .deploy-card.featured {
    border-color: var(--accent-line);
    background:
      linear-gradient(180deg, var(--accent-dim) 0%, transparent 70%),
      var(--bg-2);
  }

  .deploy-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }

  .deploy-flag {
    width: 18px;
    height: 12px;
    background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 78% 50%, 100% 100%, 0 100%);
    flex-shrink: 0;
  }

  .deploy-flag.dim {
    background: var(--ink-4);
  }

  .deploy-name {
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    letter-spacing: 0.1em;
  }

  .deploy-badge {
    margin-left: auto;
    font: 500 10.5px 'Geist Mono', ui-monospace, monospace;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--ink-3);
  }

  .deploy-badge.on {
    color: var(--accent);
    background: var(--accent-dim);
    border-color: var(--accent-line);
  }

  .deploy-card h3 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: -0.018em;
  }

  .deploy-card > p {
    color: var(--ink-2);
    margin: 0 0 22px;
    font-size: 13.5px;
    max-width: 42ch;
    text-wrap: pretty;
  }

  .deploy-list {
    list-style: none;
    margin: 0 0 24px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid var(--line);
    padding-top: 18px;
  }

  .deploy-card.featured .deploy-list {
    border-top-color: var(--accent-line);
  }

  .deploy-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: var(--ink-2);
    font-size: 13px;
  }

  .deploy-tick {
    flex-shrink: 0;
    width: 14px;
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    line-height: 1.4;
  }

  .deploy-tick.on {
    color: var(--accent);
  }

  .deploy-tick.dim {
    color: var(--ink-4);
  }

  .deploy-price {
    font-size: 12.5px;
    color: var(--ink-3);
    margin: auto 0 14px;
    padding-top: 8px;
  }

  .deploy-card :global(.btn) {
    align-self: flex-start;
  }

  .deploy-card :global(.btn-accent.node) {
    background: var(--accent-dim);
    border-color: var(--accent);
    box-shadow: 0 0 20px 3px rgba(229, 90, 1, 0.18), 0 0 6px rgba(229, 90, 1, 0.12);
  }

  .deploy-card.featured {
    position: relative;
    overflow: hidden;
  }

  .deploy-card.featured::after {
    content: '';
    position: absolute;
    right: -60px;
    top: -60px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 50%, rgba(229,90,1,0.18), transparent 60%);
    pointer-events: none;
  }

  @media (max-width: 780px) {
    .deploy {
      grid-template-columns: 1fr;
    }

    .sec-head {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>