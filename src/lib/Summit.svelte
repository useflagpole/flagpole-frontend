<script lang="ts"></script>

<div class="summit-peak">
  <div class="flag-planted" aria-hidden="true"></div>
  <h2>Plant a flag. It's free.</h2>
  <p>Free forever for 10 envs and 1M evaluations / month. MIT-licensed. Self-host if you want to.</p>
  <div class="ctas">
    <a class="btn btn-primary" href="#/signup">Create workspace</a>
    <a class="btn btn-ghost" href="#">github.com/flagpole/flagpole</a>
  </div>
</div>

<style>
  .summit-peak {
    text-align: center;
    padding: 80px 0 48px;
  }

  .flag-planted {
    width: 120px;
    height: 120px;
    margin: 0 auto 24px;
    position: relative;
  }

  .flag-planted::before {
    content: '';
    position: absolute;
    left: 59px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--ink);
  }

  .flag-planted::after {
    content: '';
    position: absolute;
    left: 61px;
    top: 6px;
    width: 48px;
    height: 30px;
    background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 72% 50%, 100% 100%, 0 100%);
  }

  h2 {
    font-size: clamp(36px, 4.4vw, 60px);
    margin: 0 0 12px;
    font-weight: 500;
    letter-spacing: -0.03em;
  }

  p {
    color: var(--ink-2);
    max-width: 48ch;
    margin: 0 auto 28px;
    text-wrap: pretty;
  }

  .ctas {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }
</style>
