<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    num: string;
    isLast?: boolean;
    children: Snippet;
  }

  let { num, isLast = false, children }: Props = $props();
</script>

<div class="milestone">
  <div class="milestone-num" class:last={isLast}>{num}</div>
  <div class="milestone-content">
    {@render children()}
  </div>
</div>

<style>
  .milestone {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 40px;
  }

  .milestone-num {
    font: 500 13px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    letter-spacing: 0.08em;
    position: relative;
    padding-top: 6px;
  }

  .milestone-num::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 14px;
    width: 12px;
    height: 12px;
    background: var(--accent);
    clip-path: polygon(0 0, 100% 0, 70% 50%, 100% 100%, 0 100%);
  }

  .milestone-num::after {
    content: '';
    position: absolute;
    left: -1px;
    top: 24px;
    bottom: -80px;
    width: 2px;
    background: var(--ink-4);
  }

  .milestone-num.last::after { display: none; }

  .milestone-content :global(h2) {
    font-size: clamp(30px, 3.4vw, 44px);
    margin: 0 0 10px;
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.05;
  }

  .milestone-content :global(p) {
    color: var(--ink-2);
    margin: 0 0 28px;
    max-width: 56ch;
    text-wrap: pretty;
  }

  @media (max-width: 780px) {
    .milestone {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .milestone-num::before,
    .milestone-num::after {
      display: none;
    }
  }
</style>
