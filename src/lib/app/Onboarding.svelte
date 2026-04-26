<script lang="ts">
  import type { OrgDTO } from '../api/organizations'
  import { session } from '../session.svelte'
  import { userStore } from '../user.svelte'
  import { orgStore } from '../org.svelte'
  import { createOrganization, setOrganizationPlan } from '../api/organizations'
  import { createProject } from '../api/projects'

  let { onDone }: { onDone: () => void } = $props()

  // local form state — no API calls until finish()
  let step     = $state(0)
  let orgName  = $state('')
  let projName = $state('')

  // submission state
  let submitting        = $state(false)
  let error             = $state<string | null>(null)
  let done              = $state(false)
  let submittedOrgDto   = $state<OrgDTO | null>(null)   // set after org created
  let submittedProjDone = $state(false)                  // set after project created

  const step0Valid     = $derived(orgName.trim().length >= 2)
  const displayOrgName = $derived(submittedOrgDto?.name ?? orgName.trim())

  function next() {
    error = null
    step += 1
  }

  function back() {
    error = null
    step -= 1
    // if returning to step 0, reset all submission progress so org name can be changed freely
    if (step === 0) {
      submittedOrgDto   = null
      submittedProjDone = false
    }
  }

  // All API calls happen here, resumable across retries:
  //   phase 1 — create org   (skipped if submittedOrgDto already set)
  //   phase 2 — create proj  (skipped if submittedProjDone already true)
  //   phase 3 — set plan     (idempotent, always runs)
  async function finish() {
    submitting = true
    error = null

    if (!submittedOrgDto) {
      const r = await createOrganization(orgName.trim())
      if (!r.ok) { error = r.message; submitting = false; return }
      submittedOrgDto = r.data
    }

    if (!submittedProjDone) {
      const name = projName.trim() || 'my-project'
      const r = await createProject(submittedOrgDto.id, name, [])
      if (!r.ok) { error = r.message; submitting = false; return }
      submittedProjDone = true
    }

    const r = await setOrganizationPlan(submittedOrgDto.id, 'free')
    if (!r.ok) { error = r.message; submitting = false; return }

    submitting = false
    done = true
  }

  function logout() {
    session.clear()
    userStore.clear()
    window.location.hash = '#/login'
  }

  function goToDashboard() {
    if (submittedOrgDto) orgStore.push({ id: submittedOrgDto.id, name: submittedOrgDto.name, role: 'admin' })
    onDone()
  }
</script>

<div class="shell">
  <!-- subtle grid bg -->
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="top-fade" aria-hidden="true"></div>

  <header class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">
        <div class="brand-pole"></div>
        <div class="brand-flag"></div>
      </div>
      flagpole
    </div>
    <div class="topbar-right">
      <span class="mono">signed in as {userStore.username}</span>
      <button class="btn-logout" onclick={logout}>
        Log out
      </button>
    </div>
  </header>

  <main class="stage">
    <div class="card">
      {#if done}
        <div class="completion">
          <div class="completion-mark" aria-hidden="true">
            <div class="completion-pole"></div>
            <div class="completion-flag"></div>
          </div>
          <p class="welcome accent">Organization created</p>
          <h1 class="title">{displayOrgName}</h1>
          <p class="subtitle">Your workspace is ready. Raise your first flag.</p>
          <button class="btn-primary" onclick={goToDashboard}>
            Go to dashboard <span class="arrow">→</span>
          </button>
        </div>
      {:else}
        <!-- step dots -->
        <div class="steps">
          {#each [0, 1, 2] as i}
            <div
              class="step-dot"
              class:active={step === i}
              class:done={step > i}
            ></div>
          {/each}
          <span class="step-label mono">step {step + 1} of 3</span>
        </div>

        {#if step === 0}
          <p class="welcome">Welcome, {userStore.firstName} 👋</p>
          <h1 class="title">Let's create your<br>organization.</h1>
          <p class="subtitle">Your organization is the top-level workspace. Projects, flags, and teams live inside it.</p>

          <div class="field">
            <label class="label" for="orgName">
              Organization name
              <span class="label-hint">required</span>
            </label>
            <input
              id="orgName"
              type="text"
              bind:value={orgName}
              placeholder="e.g. Acme Corp"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="cta-row">
            <button
              class="btn-primary"
              disabled={!step0Valid}
              onclick={next}
            >
              Continue <span class="arrow">→</span>
            </button>
          </div>

        {:else if step === 1}
          <p class="welcome muted">{orgName.trim()}</p>
          <h1 class="title">Create your first<br>project.</h1>
          <p class="subtitle">Projects group your flags by app or service. You can add more later.</p>

          <div class="field">
            <label class="label" for="projName">Project name</label>
            <input
              id="projName"
              type="text"
              bind:value={projName}
              placeholder="e.g. web-app"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="field">
            <span class="label">Environments <span class="label-hint">auto-created</span></span>
            <div class="env-pills">
              <span class="env-pill mono">production</span>
              <span class="env-pill mono">staging</span>
              <span class="env-pill mono">dev</span>
            </div>
          </div>

          <div class="cta-row">
            <button class="btn-back" onclick={back}>← Back</button>
            <button class="btn-primary" onclick={next}>
              Continue <span class="arrow">→</span>
            </button>
          </div>

        {:else}
          <p class="welcome muted">Almost done</p>
          <h1 class="title">Choose your plan.</h1>
          <p class="subtitle">Free forever for most teams. Upgrade when you need more.</p>

          <div class="plan-grid">
            <button class="plan-card selected">
              <span class="plan-check">✓</span>
              <div class="plan-name">Free</div>
              <div class="plan-desc mono">10 envs · 1M evals/mo · unlimited flags</div>
            </button>
            <div class="plan-card plan-card-locked">
              <span class="plan-soon mono">soon</span>
              <div class="plan-name">Pro</div>
              <div class="plan-desc mono">$0.10/1k above free · SSO · audit export</div>
            </div>
          </div>

          {#if error}
            <p class="field-error mono">{error}</p>
          {/if}

          <div class="cta-row">
            <button class="btn-back" disabled={submitting} onclick={back}>← Back</button>
            <button class="btn-primary" disabled={submitting} onclick={finish}>
              {submitting ? 'Setting up…' : 'Create organization'} <span class="arrow">→</span>
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </main>

  <footer>
    <span>flagpole · open source · MIT</span>
    <span class="footer-links">
      <a href="#">docs</a> · <a href="#">github</a> · <a href="#">support</a>
    </span>
  </footer>
</div>

<style>
  .shell {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #0a0a0b;
    color: #ededef;
    font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.005em;
  }

  .grid-bg {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .top-fade {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: radial-gradient(ellipse 60% 100% at 50% 0%, rgba(229, 90, 0, 0.07), transparent);
    pointer-events: none;
    z-index: 0;
  }

  .topbar {
    position: relative;
    z-index: 1;
    padding: 18px 32px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #26262a;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: -0.01em;
  }

  .brand-mark {
    width: 18px;
    height: 18px;
    position: relative;
    flex-shrink: 0;
  }

  .brand-pole {
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #ededef;
  }

  .brand-flag {
    position: absolute;
    left: 10px;
    top: 2px;
    width: 7px;
    height: 5px;
    background: #E55A00;
    clip-path: polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%);
  }

  .topbar-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: #66666d;
  }

  .btn-logout {
    background: transparent;
    border: 1px solid #26262a;
    border-radius: 6px;
    color: #66666d;
    font: 500 12px 'Geist', ui-sans-serif;
    padding: 6px 12px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .btn-logout:hover {
    border-color: #3f3f45;
    color: #ededef;
  }

  .stage {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  .card {
    width: 100%;
    max-width: 480px;
  }

  .steps {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 40px;
  }

  .step-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #26262a;
    transition: background 0.2s, width 0.2s;
  }

  .step-dot.active {
    background: #E55A00;
    width: 20px;
    border-radius: 99px;
  }

  .step-dot.done {
    background: #3f3f45;
  }

  .step-label {
    font-size: 12px;
    color: #66666d;
    margin-left: 8px;
  }

  .welcome {
    font-size: 13px;
    color: #E55A00;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 14px;
  }

  .welcome.muted {
    color: #a4a4ac;
  }

  .welcome.accent {
    color: #E55A00;
  }

  .title {
    font-size: clamp(26px, 4vw, 36px);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin: 0 0 10px;
  }

  .subtitle {
    color: #a4a4ac;
    font-size: 15px;
    margin: 0 0 36px;
  }

  .field {
    margin-bottom: 20px;
  }

  .label {
    display: block;
    font: 500 13px 'Geist', ui-sans-serif;
    color: #ededef;
    margin-bottom: 7px;
  }

  .label-hint {
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: #66666d;
    margin-left: 8px;
    font-weight: 400;
  }

  input[type="text"] {
    width: 100%;
    background: #121214;
    border: 1px solid #26262a;
    border-radius: 7px;
    color: #ededef;
    font: 400 14px 'Geist Mono', ui-monospace, monospace;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    letter-spacing: -0.01em;
  }

  input[type="text"]:focus {
    border-color: rgba(229, 90, 0, 0.6);
    box-shadow: 0 0 0 3px rgba(229, 90, 0, 0.08);
  }

  input[type="text"]::placeholder {
    color: #3f3f45;
  }

  .field-error {
    font-size: 12px;
    color: #e07070;
    margin: -12px 0 16px;
  }

  .env-pills {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }

  .env-pill {
    font-size: 12px;
    color: #a4a4ac;
    background: #1a1a1d;
    border: 1px solid #26262a;
    border-radius: 4px;
    padding: 4px 10px;
  }

  .plan-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  }

  .plan-card {
    position: relative;
    border: 1px solid #26262a;
    border-radius: 8px;
    padding: 14px 16px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: transparent;
    color: #ededef;
    text-align: left;
  }

  .plan-card:hover {
    background: #121214;
  }

  .plan-card.selected {
    border-color: rgba(229, 90, 0, 0.5);
    background: rgba(229, 90, 0, 0.06);
  }

  .plan-card-locked {
    opacity: 0.45;
    cursor: default;
  }

  .plan-check {
    position: absolute;
    top: 10px;
    right: 12px;
    font: 500 12px 'Geist Mono', ui-monospace, monospace;
    color: #E55A00;
  }

  .plan-soon {
    position: absolute;
    top: 10px;
    right: 12px;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: #66666d;
  }

  .plan-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 3px;
  }

  .plan-desc {
    font-size: 12px;
    color: #66666d;
    line-height: 1.4;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }

  .btn-back {
    background: transparent;
    border: 1px solid #26262a;
    border-radius: 7px;
    color: #a4a4ac;
    font: 500 14px 'Geist', ui-sans-serif;
    padding: 12px 16px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .btn-back:hover:not(:disabled) {
    border-color: #3f3f45;
    color: #ededef;
  }

  .btn-back:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .btn-primary {
    flex: 1;
    background: #ededef;
    color: #0a0a0b;
    border: none;
    border-radius: 7px;
    font: 600 14px 'Geist', ui-sans-serif;
    padding: 12px 20px;
    cursor: pointer;
    transition: opacity 0.15s;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.85;
  }

  .btn-primary:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .arrow {
    transition: transform 0.2s;
  }

  .btn-primary:not(:disabled):hover .arrow {
    transform: translateX(3px);
  }

  .completion {
    text-align: center;
    padding: 20px 0;
  }

  .completion-mark {
    width: 56px;
    height: 56px;
    position: relative;
    margin: 0 auto 28px;
  }

  .completion-pole {
    position: absolute;
    left: 26px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #ededef;
  }

  .completion-flag {
    position: absolute;
    left: 29px;
    top: 5px;
    width: 22px;
    height: 14px;
    background: #E55A00;
    clip-path: polygon(0 0, 100% 0, 72% 50%, 100% 100%, 0 100%);
  }

  .completion .btn-primary {
    display: inline-flex;
    flex: none;
    max-width: 260px;
  }

  footer {
    position: relative;
    z-index: 1;
    padding: 20px 32px;
    border-top: 1px solid #26262a;
    display: flex;
    justify-content: space-between;
    font: 400 12px 'Geist Mono', ui-monospace, monospace;
    color: #3f3f45;
  }

  .footer-links a {
    color: #66666d;
    text-decoration: none;
  }

  .footer-links a:hover {
    color: #a4a4ac;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
