<script lang="ts">
  let {
    name,
    desc,
    trimmed,
    isDuplicate,
    submitAttempted,
    onNameChange,
    onDescChange,
  }: {
    name: string
    desc: string
    trimmed: string
    isDuplicate: boolean
    submitAttempted: boolean
    onNameChange: (v: string) => void
    onDescChange: (v: string) => void
  } = $props()

  const MAX_NAME = 64
  const MAX_DESC = 256

  function sanitizeSegName(v: string): string {
    return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_.]/g, '').slice(0, MAX_NAME)
  }
</script>

<div class="panel">
  <div class="panel-bar">
    <span>01 — Identity</span>
    <span class="panel-bar-right">required</span>
  </div>
  <div class="panel-body">
    <div class="field">
      <div class="field-header">
        <label class="field-label">Segment name</label>
        <span class="field-counter">{name.length}/{MAX_NAME}</span>
      </div>
      <input
        value={name}
        oninput={(e) => onNameChange(sanitizeSegName((e.target as HTMLInputElement).value))}
        placeholder="e.g. eu-pro-customers"
        class="field-input"
        class:field-error={(trimmed && isDuplicate) || (submitAttempted && !trimmed)}
      />
      {#if trimmed && isDuplicate}
        <div class="field-error-msg">"{trimmed}" already exists in this project.</div>
      {:else if submitAttempted && !trimmed}
        <div class="field-error-msg">Segment name is required.</div>
      {:else}
        <div class="field-hint">lowercase · hyphens · dots — auto-formatted · unique in project</div>
      {/if}
    </div>

    <div class="field">
      <div class="field-header">
        <label class="field-label">Description <span class="field-label-opt">(optional)</span></label>
        <span class="field-counter">{desc.length}/{MAX_DESC}</span>
      </div>
      <textarea
        value={desc}
        oninput={(e) => onDescChange((e.target as HTMLTextAreaElement).value.slice(0, MAX_DESC))}
        rows={2}
        placeholder="What population does this segment describe?"
        class="field-input field-textarea"
      />
    </div>
  </div>
</div>

<style>
  .panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: visible;
  }

  .panel-bar {
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font: 500 11.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .panel-bar-right {
    color: var(--ink-2);
  }

  .panel-body {
    padding: 18px;
  }

  .field {
    margin-bottom: 18px;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .field-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .field-label {
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-2);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .field-label-opt {
    color: var(--ink-3);
    font-weight: 400;
  }

  .field-counter {
    font: 400 10.5px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
  }

  .field-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 9px 12px;
    color: var(--ink);
    font: 400 13px 'Geist Mono', ui-monospace, monospace;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .field-input:focus {
    border-color: var(--line-2);
  }

  .field-input.field-error {
    border-color: #7a3333;
  }

  .field-textarea {
    resize: vertical;
    min-height: 56px;
    font-family: 'Geist', ui-sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }

  .field-hint {
    font: 400 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    margin-top: 6px;
  }

  .field-error-msg {
    font: 400 11.5px 'Geist Mono', ui-monospace, monospace;
    color: #c07070;
    margin-top: 6px;
  }
</style>