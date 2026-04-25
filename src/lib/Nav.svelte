<script lang="ts"></script>

<nav class="chrome">
  <div class="chrome-inner">
    <a href="/" class="brand">
      <span class="brand-mark" aria-hidden="true"></span>
      flagpole
    </a>
    <div class="nav-links">
      <a href="#">Docs</a>
      <a href="#">SDKs</a>
      <a href="#">Pricing</a>
      <a href="#">GitHub</a>
    </div>
    <div class="chrome-cta">
      <a class="btn btn-ghost" href="#/login">Sign in</a>
      <a class="btn btn-primary" href="#/signup">Start free</a>
    </div>
  </div>
</nav>

<style>
  .chrome {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(10, 10, 11, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }

  .chrome-inner {
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ink);
    text-decoration: none;
  }

  .brand-mark {
    width: 18px;
    height: 18px;
    position: relative;
    flex-shrink: 0;
  }

  .brand-mark::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--ink);
  }

  .brand-mark::after {
    content: '';
    position: absolute;
    left: 10px;
    top: 2px;
    width: 7px;
    height: 5px;
    background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%);
  }

  .nav-links {
    display: flex;
    gap: 20px;
    color: var(--ink-2);
    font-size: 13.5px;
    margin-left: 12px;
  }

  .nav-links a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s;
  }

  .nav-links a:hover { color: var(--ink); }

  .chrome-cta {
    margin-left: auto;
    display: flex;
    gap: 8px;
  }
</style>
