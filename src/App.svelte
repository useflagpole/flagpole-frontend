<script lang="ts">
  import Nav from './lib/Nav.svelte';
  import CodeMock from './lib/CodeMock.svelte';
  import Milestone from './lib/Milestone.svelte';
  import Summit from './lib/Summit.svelte';
  import Footer from './lib/Footer.svelte';
  import HeroScene from './lib/HeroScene.svelte';
</script>

<Nav />

<main>
  <!-- HERO -->
  <section class="section hero-section">
    <HeroScene />
    <div class="page">
      <span class="eyebrow">plant your first flag</span>
      <h1>Flag it. Ramp it.<br>Roll it back instantly.</h1>
      <p class="hero-sub">flagpole is the feature flag service we wished existed when we were three engineers and a staging server. Open source, free forever for small teams, and fast enough to call on the hot path.</p>
      <div class="hero-ctas">
        <a class="btn btn-accent" href="#/signup">Plant your first flag</a>
        <a class="btn btn-ghost" href="#"><span class="mono">★ 12.4k</span></a>
        <a class="btn btn-ghost" href="#">docs →</a>
      </div>
    </div>
  </section>

  <!-- STEP 01 -->
  <section class="section">
    <div class="page">
      <Milestone num="STEP 01">
        <h2>Install the SDK.</h2>
        <p>One package, every runtime. Typed keys generated from your schema so renaming a flag is safe.</p>
        <CodeMock />
        <div class="sdk-row mono">
          <span>typescript</span><span>go</span><span>python</span><span>ruby</span>
          <span>rust</span><span>swift</span><span>kotlin</span><span>java</span>
          <span>elixir</span><span>php</span>
        </div>
      </Milestone>
    </div>
  </section>

  <!-- STEP 02 -->
  <section class="section">
    <div class="page">
      <Milestone num="STEP 02">
        <h2>Define the rollout.</h2>
        <p>Target by plan, region, cohort, or any custom trait. Reusable segments. Percentages with sticky bucketing.</p>
        <div class="ph tall">TARGETING RULES BUILDER · IF plan = pro AND region ∈ (us, eu) · ramp 10%</div>
      </Milestone>
    </div>
  </section>

  <!-- STEP 03 -->
  <section class="section">
    <div class="page">
      <Milestone num="STEP 03">
        <h2>Watch it land.</h2>
        <p>Every exposure, every flip, every actor recorded. Export to S3 or your warehouse. Built-in anomaly alerts for error rate spikes on a variant.</p>
        <div class="ph med">METRICS + AUDIT TIMELINE PLACEHOLDER</div>
      </Milestone>
    </div>
  </section>

  <!-- STEP 04 -->
  <section class="section">
    <div class="page">
      <Milestone num="STEP 04" isLast>
        <h2>Roll it back, or roll it out.</h2>
        <p>One click kill switch. One click to 100%. Diff view between any two states. Undo works.</p>
        <div class="ph med">FLAG HISTORY + DIFF VIEW PLACEHOLDER</div>
      </Milestone>
    </div>
  </section>

  <!-- SUMMIT -->
  <section class="section">
    <div class="page">
      <Summit />
    </div>
  </section>
</main>

<Footer />

<style>
  .hero-section {
    overflow: hidden;
    position: relative;
  }

  .hero-section .page {
    position: relative;
    z-index: 1;
  }


  h1 {
    font-size: clamp(44px, 6.4vw, 88px);
    font-weight: 500;
    letter-spacing: -0.035em;
    line-height: 0.98;
    margin: 0 0 24px;
    max-width: 18ch;
    text-wrap: balance;
  }

  .hero-sub {
    color: var(--ink-2);
    font-size: clamp(16px, 1.3vw, 19px);
    max-width: 54ch;
    margin: 0 0 32px;
    text-wrap: pretty;
  }

  .hero-ctas {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .sdk-row {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    color: var(--ink-3);
    font-size: 13px;
    margin-top: 32px;
  }
</style>
