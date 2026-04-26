<script lang="ts">
  let { onClose, onSubmit }: {
    onClose: () => void
    onSubmit: (draft: { key: string; type: string; defaultValue: string; desc: string }) => void
  } = $props()

  let key     = $state('')
  let type    = $state<'bool' | 'string' | 'number'>('bool')
  let defVal  = $state('')
  let desc    = $state('')
  let keyErr  = $state('')

  let keyInput: HTMLInputElement

  $effect(() => {
    key = ''; type = 'bool'; defVal = ''; desc = ''; keyErr = ''
    setTimeout(() => keyInput?.focus(), 60)
  })

  $effect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const sanitize = (v: string) =>
    v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_.]/g, '').slice(0, 50)

  const handleKeyInput = (e: Event) => {
    key = sanitize((e.target as HTMLInputElement).value)
    if (keyErr) keyErr = ''
  }

  const handleType = (t: 'bool' | 'string' | 'number') => {
    type = t
    defVal = ''
  }

  const handleSubmit = () => {
    if (!key.trim()) { keyErr = 'Flag key is required'; return }
    onSubmit({ key: key.trim(), type, defaultValue: defVal, desc })
    onClose()
  }

  const typeOptions = [
    { id: 'bool',   label: 'Boolean', glyph: '⊙', hint: 'true / false kill switch' },
    { id: 'string', label: 'String',  glyph: '❝', hint: 'up to 50 characters' },
    { id: 'number', label: 'Number',  glyph: '#', hint: 'integer or decimal' },
  ] as const
</script>

<!-- backdrop -->
<div class="backdrop" onclick={onClose} role="presentation"></div>

<!-- modal -->
<div class="modal" role="dialog" aria-modal="true">

  <div class="header">
    <div class="header-left">
      <span class="flag-icon">⚑</span>
      <span class="header-title">New flag</span>
    </div>
    <button class="close-btn" onclick={onClose}>×</button>
  </div>

  <div class="body">

    <!-- flag key -->
    <div class="field">
      <label class="field-label">Flag key</label>
      <input
        bind:this={keyInput}
        value={key}
        oninput={handleKeyInput}
        maxlength={64}
        placeholder="e.g. new-checkout-flow"
        class="text-input mono"
        class:input-error={keyErr}
      />
      {#if keyErr}
        <div class="helper helper-error mono">{keyErr}</div>
      {:else}
        <div class="helper mono">lowercase · hyphens · max 50 chars - auto-formatted</div>
      {/if}
    </div>

    <!-- type picker -->
    <div class="field">
      <label class="field-label">Type</label>
      <div class="type-grid">
        {#each typeOptions as opt}
          <button
            class="type-card"
            class:active={type === opt.id}
            onclick={() => handleType(opt.id)}
          >
            <div class="type-glyph mono" class:active={type === opt.id}>{opt.glyph}</div>
            <div class="type-label" class:active={type === opt.id}>{opt.label}</div>
            <div class="type-hint mono">{opt.hint}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- default value -->
    <div class="field">
      <label class="field-label">Default value</label>

      {#if type === 'bool'}
        <div class="bool-row">
          {#each ['false', 'true'] as v}
            <button
              class="bool-btn mono"
              class:bool-false={defVal === 'false' && v === 'false'}
              class:bool-true={defVal === 'true' && v === 'true'}
              onclick={() => defVal = v}
            >{v}</button>
          {/each}
        </div>

      {:else if type === 'string'}
        <div class="str-wrap">
          <input
            class="text-input mono"
            value={defVal}
            oninput={e => defVal = (e.target as HTMLInputElement).value.slice(0, 50)}
            placeholder="Default string value…"
          />
          <span class="char-count mono" class:warn={defVal.length > 40}>{defVal.length}/50</span>
        </div>

      {:else}
        <input
          class="text-input mono"
          value={defVal}
          oninput={e => defVal = (e.target as HTMLInputElement).value.replace(/[^0-9.\-]/g, '')}
          placeholder="0"
        />
      {/if}
    </div>

    <!-- description -->
    <div class="field">
      <label class="field-label">Description <span class="optional">(optional)</span></label>
      <textarea
        class="text-input textarea"
        bind:value={desc}
        rows={2}
        placeholder="What does this flag control?"
      ></textarea>
    </div>

  </div>

  <div class="footer">
    <button class="btn btn-ghost" onclick={onClose}>Cancel</button>
    <button class="btn btn-primary" onclick={handleSubmit}>Create flag</button>
  </div>

</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 100;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    max-width: calc(100vw - 32px);
    background: #121214;
    border: 1px solid #333338;
    border-radius: 12px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    z-index: 101;
    overflow: hidden;
  }

  .header {
    padding: 18px 20px;
    border-bottom: 1px solid #26262a;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .flag-icon {
    font-size: 20px;
    color: #E55A01;
  }

  .header-title {
    font-weight: 600;
    font-size: 14px;
    letter-spacing: -0.01em;
    color: #ededef;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #66666d;
    font-size: 18px;
    line-height: 1;
    padding: 0 2px;
    display: flex;
    align-items: center;
    transition: color .1s;
  }

  .close-btn:hover { color: #ededef; }

  .body {
    padding: 22px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .field { display: flex; flex-direction: column; }

  .field-label {
    display: block;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: #a4a4ac;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .optional {
    color: #66666d;
    font-weight: 400;
  }

  .text-input {
    width: 100%;
    background: #0a0a0b;
    border: 1px solid #26262a;
    border-radius: 6px;
    padding: 9px 12px;
    color: #ededef;
    outline: none;
    box-sizing: border-box;
    transition: border-color .15s;
    font-size: 13px;
  }

  .text-input:focus { border-color: #333338; }

  .text-input.input-error { border-color: #c05050; }
  .text-input.input-error:focus { border-color: #c05050; }

  .textarea {
    font-family: 'Geist', ui-sans-serif;
    resize: vertical;
    min-height: 62px;
  }

  .mono { font-family: 'Geist Mono', ui-monospace, monospace; }

  .helper {
    font-size: 11px;
    color: #66666d;
    margin-top: 5px;
  }

  .helper-error {
    color: #c07070;
    font-size: 11.5px;
  }

  /* type grid */
  .type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .type-card {
    background: #0a0a0b;
    border: 1px solid #26262a;
    border-radius: 8px;
    padding: 12px 10px;
    cursor: pointer;
    text-align: left;
    transition: border-color .15s, background .15s;
  }

  .type-card:hover:not(.active) { border-color: #333338; }

  .type-card.active {
    background: rgba(229, 90, 1, 0.18);
    border-color: rgba(229, 90, 1, 0.4);
  }

  .type-glyph {
    font-size: 15px;
    font-weight: 600;
    color: #a4a4ac;
    margin-bottom: 5px;
  }

  .type-glyph.active { color: #E55A01; }

  .type-label {
    font: 500 13px 'Geist', ui-sans-serif;
    color: #ededef;
    margin-bottom: 3px;
  }

  .type-label.active { color: #E55A01; }

  .type-hint {
    font-size: 10.5px;
    color: #66666d;
    line-height: 1.4;
  }

  /* bool row */
  .bool-row {
    display: flex;
    gap: 6px;
  }

  .bool-btn {
    flex: 1;
    padding: 8px 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 500;
    background: #0a0a0b;
    border: 1px solid #26262a;
    color: #66666d;
    transition: all .15s;
  }

  .bool-btn.bool-false {
    background: #1a1a1d;
    border-color: #333338;
    color: #ededef;
  }

  .bool-btn.bool-true {
    background: rgba(229, 90, 1, 0.18);
    border-color: rgba(229, 90, 1, 0.4);
    color: #E55A01;
  }

  /* string counter */
  .str-wrap { position: relative; }

  .char-count {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: #66666d;
    pointer-events: none;
  }

  .char-count.warn { color: #E55A01; }

  /* footer */
  .footer {
    padding: 14px 20px;
    border-top: 1px solid #26262a;
    background: #0a0a0b;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .btn {
    font: 500 12px 'Geist', ui-sans-serif;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: opacity .15s;
    border: 1px solid transparent;
  }

  .btn-ghost {
    background: transparent;
    border-color: #333338;
    color: #ededef;
  }

  .btn-primary {
    background: #ededef;
    color: #0a0a0b;
    border-color: #ededef;
  }

  .btn:hover { opacity: 0.75; }
</style>
