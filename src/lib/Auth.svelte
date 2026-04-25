<script lang="ts">
  import { login, signup } from './api/auth'
  import { session } from './session.svelte'

  const { initialTab = 'login' }: { initialTab?: 'login' | 'signup' } = $props();
  let tab = $state<'login' | 'signup'>(initialTab);

  let loginEmail = $state('');
  let loginPassword = $state('');
  let loginError = $state('');
  let loginLoading = $state(false);

  let signupFirstName = $state('');
  let signupLastName = $state('');
  let signupEmail = $state('');
  let signupPassword = $state('');
  let signupTerms = $state(false);
  let signupError = $state('');
  let signupLoading = $state(false);

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    loginError = '';
    loginLoading = true;

    const result = await login(loginEmail, loginPassword);
    loginLoading = false;

    if (result.ok) {
      session.set(result.data.token);
      window.location.hash = '#/app';
      return;
    }

    if (result.status === 429) {
      loginError = 'Too many attempts. Please wait a minute.';
    } else if (result.status === 401) {
      loginError = 'Invalid email or password.';
    } else {
      loginError = result.message || 'Something went wrong.';
    }
  }

  async function handleSignup(e: SubmitEvent) {
    e.preventDefault();
    signupError = '';
    signupLoading = true;

    const result = await signup(signupEmail, signupPassword, signupFirstName, signupLastName);
    signupLoading = false;

    if (result.ok) {
      tab = 'login';
      loginEmail = signupEmail;
      return;
    }

    if (result.status === 409) {
      signupError = 'An account with this email already exists.';
    } else {
      signupError = result.message || 'Something went wrong.';
    }
  }
</script>

<div class="auth-page">
  <a href="#/" class="backbutton">← Back</a>
  <a href="/" class="brand">
    <span class="brand-mark" aria-hidden="true"></span>
    flagpole
  </a>

  <div class="card">
    <div class="tabs">
      <button class="tab" class:active={tab === 'login'} onclick={() => tab = 'login'}>Login</button>
      <button class="tab" class:active={tab === 'signup'} onclick={() => tab = 'signup'}>Sign up</button>
    </div>

    {#if tab === 'login'}
      <form class="form" onsubmit={handleLogin}>
        <div class="field">
          <label for="login-email">Email</label>
          <input id="login-email" type="email" placeholder="you@company.com" bind:value={loginEmail} required />
        </div>
        <div class="field">
          <label for="login-password">Password</label>
          <input id="login-password" type="password" placeholder="••••••••" bind:value={loginPassword} required />
        </div>
        {#if loginError}
          <p class="error">{loginError}</p>
        {/if}
        <button type="submit" class="btn btn-accent submit" disabled={loginLoading}>
          {loginLoading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    {:else}
      <form class="form" onsubmit={handleSignup}>
        <div class="name-row">
          <div class="field">
            <label for="signup-firstname">First name</label>
            <input id="signup-firstname" type="text" placeholder="Jane" bind:value={signupFirstName} required />
          </div>
          <div class="field">
            <label for="signup-lastname">Last name</label>
            <input id="signup-lastname" type="text" placeholder="Smith" bind:value={signupLastName} required />
          </div>
        </div>
        <div class="field">
          <label for="signup-email">Email</label>
          <input id="signup-email" type="email" placeholder="you@company.com" bind:value={signupEmail} required />
        </div>
        <div class="field">
          <label for="signup-password">Password</label>
          <input id="signup-password" type="password" placeholder="••••••••" bind:value={signupPassword} required />
        </div>
        <label class="checkbox-row">
          <input type="checkbox" bind:checked={signupTerms} required />
          <span>I accept the <a href="#">terms of use</a></span>
        </label>
        {#if signupError}
          <p class="error">{signupError}</p>
        {/if}
        <button type="submit" class="btn btn-accent submit" disabled={signupLoading}>
          {signupLoading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .auth-page {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 32px;
    position: relative;
  }

  .backbutton {
    position: absolute;
    top: 24px;
    left: 24px;
    padding: 8px;
    color: var(--ink-3);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .backbutton:hover { color: var(--accent); }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ink);
    text-decoration: none;
    font-size: 15px;
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

  .card {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 12px;
    width: 100%;
    max-width: 380px;
    overflow: hidden;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
  }

  .tab {
    flex: 1;
    padding: 14px;
    background: none;
    border: none;
    color: var(--ink-3);
    font: 500 13.5px 'Geist', ui-sans-serif;
    cursor: pointer;
    transition: color 0.15s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }

  .tab:hover { color: var(--ink-2); }

  .tab.active {
    color: var(--ink);
    border-bottom-color: var(--accent);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink-2);
  }

  input[type="text"],
  input[type="email"],
  input[type="password"] {
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    border-radius: 6px;
    color: var(--ink);
    font: 400 14px 'Geist', ui-sans-serif;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
  }

  input[type="text"]::placeholder,
  input[type="email"]::placeholder,
  input[type="password"]::placeholder {
    color: var(--ink-4);
  }

  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus {
    border-color: var(--accent);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--ink-2);
    cursor: pointer;
  }

  .checkbox-row input[type="checkbox"] {
    width: 15px;
    height: 15px;
    accent-color: var(--accent);
    cursor: pointer;
    flex-shrink: 0;
  }

  .checkbox-row a {
    color: var(--accent);
    text-decoration: none;
  }

  .checkbox-row a:hover {
    text-decoration: underline;
  }

  .error {
    font-size: 12.5px;
    color: #e05a5a;
    margin: 0;
  }

  .submit {
    width: 100%;
    justify-content: center;
    margin-top: 4px;
  }

  .submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
