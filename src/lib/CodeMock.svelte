<script lang="ts">
  let copied = $state(false);

  const code = [
    '// 1. initialise once, anywhere',
    'import { flagpole } from "flagpole"',
    '',
    'const fp = flagpole.init({',
    '  key: process.env.FLAGPOLE_KEY!,',
    '  user: { id: user.id, plan: user.plan },',
    '})',
    '',
    '// 2. check a flag — 0.3ms from the edge cache',
    'if ( fp.on("new-checkout-v2") ) {',
    '   renderCheckoutV2()',
    '} else {',
    '   renderCheckoutV1()',
    '}',
    '',
    '// 3. targeted rollouts & variants',
    'const variant = fp.variant("pricing-copy", { default: "control" })',
  ].join('\n');

  async function copy() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<div class="panel">
  <div class="panel-bar">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span class="filename">app.ts</span>
    <button class="copy-btn" onclick={copy}>{copied ? 'copied!' : 'copy'}</button>
  </div>
  <pre class="code-body"><code class="mono"
><span class="ln"><span class="tok-c">// 1. initialise once, anywhere</span></span>
<span class="ln"><span class="tok-k">import</span> &#123; flagpole &#125; <span class="tok-k">from</span> <span class="tok-s">"flagpole"</span></span>
<span class="ln"> </span>
<span class="ln"><span class="tok-k">const</span> fp = flagpole.init(&#123;</span>
<span class="ln">  key: <span class="tok-s">process.env.FLAGPOLE_KEY</span>!,</span>
<span class="ln">  user: &#123; id: user.id, plan: user.plan &#125;,</span>
<span class="ln">&#125;)</span>
<span class="ln"> </span>
<span class="ln"><span class="tok-c">// 2. check a flag — 0.3ms from the edge cache</span></span>
<span class="ln"><span class="tok-k">if</span> ( fp.on(<span class="tok-s">"new-checkout-v2"</span>) ) &#123;</span>
<span class="ln">   renderCheckoutV2()</span>
<span class="ln">&#125; <span class="tok-k">else</span> &#123;</span>
<span class="ln">   renderCheckoutV1()</span>
<span class="ln">&#125;</span>
<span class="ln"> </span>
<span class="ln"><span class="tok-c">// 3. targeted rollouts &amp; variants</span></span>
<span class="ln"><span class="tok-k">const</span> variant = fp.variant(<span class="tok-s">"pricing-copy"</span>, &#123; default: <span class="tok-s">"control"</span> &#125;)</span></code></pre>
</div>

<style>
  .filename { margin-left: 10px; }

  .copy-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--ink-3);
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }

  .copy-btn:hover { color: var(--ink); }

  .code-body {
    margin: 0;
    padding: 20px 24px;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre;
    overflow-x: auto;
    color: var(--ink-2);
  }

  .ln { display: block; }

  :global(.tok-k) { color: var(--ink); }
  :global(.tok-s) { color: var(--accent); }
  :global(.tok-c) { color: var(--ink-3); font-style: italic; }
</style>
