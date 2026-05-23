<script lang="ts">
  import RangeSlider from './RangeSlider.svelte'
  import FlowNode from './FlowNode.svelte'
  import FlowArrow from './FlowArrow.svelte'
  import SplitArrow from './SplitArrow.svelte'
  import UndefinedNode from './UndefinedNode.svelte'
  import ValueEditor from './ValueEditor.svelte'
  import { notify } from '../toasts.svelte'
  import { updateFlagConfig } from '../api/flags'

  const TYPE_META: Record<string, { label: string; glyph: string; color: string }> = {
    bool:   { label: 'Boolean', glyph: '⊙', color: '#8fa8e8' },
    string: { label: 'String',  glyph: '❝', color: '#74c99a' },
    number: { label: 'Number',  glyph: '#',  color: '#c8a855' },
  }

  let {
    flag,
    envId,
    segments = [],
    orgId,
    projectId,
    flagId,
    onSave,
  }: {
    flag: {
      key: string
      type: 'bool' | 'string' | 'number'
      desc: string
      status: 'on' | 'off' | ''
      rollout: number
      rolloutEnabled: boolean
      defaultValue: string
      servedValue: string
      segmentOverrides: {
        id: string
        name: string
        value: string
        enabled: boolean
        priority: number
      }[]
    }
    envId: number
    segments?: { id: string; name: string }[]
    orgId: number
    projectId: number
    flagId: number
    onSave?: () => void
  } = $props()

  let status = $state(flag.status)
  let rolloutEnabled = $state(flag.rolloutEnabled)
  let rollout = $state(flag.rollout)
  let servedValue = $state(flag.servedValue)
  let defaultValue = $state(flag.defaultValue)
  let segOverrides = $state(flag.segmentOverrides.map(s => ({ ...s })))
  let dirty = $state(false)
  let addDropOpen = $state(false)
  let saving = $state(false)

  const ftype = $derived(flag.type)
  const typeMeta = $derived(TYPE_META[ftype])
  const isOn = $derived(status === 'on')
  const activeSegs = $derived(segOverrides.filter(s => s.enabled))

  function markDirty() {
    dirty = true
  }

  function resetState() {
    status = flag.status
    rolloutEnabled = flag.rolloutEnabled
    rollout = flag.rollout
    servedValue = flag.servedValue
    defaultValue = flag.defaultValue
    segOverrides = flag.segmentOverrides.map(s => ({ ...s }))
    dirty = false
  }

  async function handleSave() {
    if (!orgId || !projectId) return
    saving = true

    const typedDefault = parseValue(ftype, defaultValue)
    const typedServed = parseValue(ftype, servedValue)
    const overrides = segOverrides.map((s, i) => ({
      segmentId: Number(s.id),
      value: parseValue(ftype, s.value),
      enabled: s.enabled,
      priority: s.priority || i + 1,
    }))

    try {
      const r = await updateFlagConfig(orgId, projectId, flagId, envId, {
        enabled: isOn,
        rolloutEnabled,
        rolloutPercentage: rollout,
        defaultValue: typedDefault,
        servedValue: typedServed,
        overrides,
      })
      if (!r.ok) {
        notify.error('Failed', r.message)
        saving = false
        return
      }

      dirty = false
      notify.success('Saved', 'Flag configuration updated')
      onSave?.()
    } catch {
      notify.error('Failed', 'Network error while saving')
    }

    saving = false
  }

  function parseValue(type: string, raw: string): boolean | string | number {
    if (type === 'bool') return raw === 'true'
    if (type === 'number') return Number(raw)
    return raw
  }

  function addSegment(seg: { id: string; name: string }) {
    const existing = segOverrides.find(s => s.id === seg.id)
    if (existing) {
      segOverrides = segOverrides.map(s => s.id === seg.id ? { ...s, enabled: true } : s)
    } else {
      segOverrides = [...segOverrides, { ...seg, value: ftype === 'bool' ? 'true' : ftype === 'number' ? '0' : '', enabled: true, priority: segOverrides.length + 1 }]
    }
    addDropOpen = false
    markDirty()
  }

  function removeSegment(id: string) {
    segOverrides = segOverrides.filter(s => s.id !== id)
    markDirty()
  }

  function updateSegmentValue(id: string, value: string) {
    segOverrides = segOverrides.map(s => s.id === id ? { ...s, value } : s)
    markDirty()
  }

  const availableSegments = $derived(
    segments.filter(s => !segOverrides.find(x => x.id === s.id && x.enabled))
  )
</script>

<div class="config-panel">
  <div class="panel-bar">
    <span>Configuration</span>
    <span class="type-badge" style="color: {typeMeta.color}">
      <span class="type-glyph">{typeMeta.glyph}</span>
      {typeMeta.label}
    </span>
  </div>

  <div class="panel-body">
    {#if flag.desc}
      <div class="description-row">
        <span class="desc-label mono">Description</span>
        <span class="desc-text">{flag.desc}</span>
      </div>
    {/if}

    <div class="flow-pipeline">
      <!-- ① Flag node -->
      <FlowNode title="Flag" icon="⚑" accent={isOn} style="min-width: 130px; align-self: flex-start;">
        <div class="flag-row">
          <div>
            <div class="flag-status" class:active={isOn}>{isOn ? 'Enabled' : 'Disabled'}</div>
            <div class="flag-sub mono">killswitch</div>
          </div>
          <button class="toggle" class:on={isOn} onclick={() => { status = isOn ? 'off' : 'on'; markDirty() }} role="switch" aria-checked={isOn}>
            <span class="toggle-knob"></span>
          </button>
        </div>
      </FlowNode>

      {#if isOn}
        <FlowArrow active label="on" />

        <!-- ② Middle column — Rollout + Overrides -->
        <div class="middle-col">
          <!-- Rollout node -->
          <FlowNode title="Rollout" icon="◎" accent={rolloutEnabled} style="min-width: 172px;">
            <div class="rollout-header">
              <div>
                <div class="rollout-pct" class:active={rolloutEnabled}>{rolloutEnabled ? `${rollout}%` : 'All users'}</div>
                <div class="rollout-sub mono">gradual rollout</div>
              </div>
              <button class="toggle sm" class:on={rolloutEnabled} onclick={() => { rolloutEnabled = !rolloutEnabled; markDirty() }} role="switch" aria-checked={rolloutEnabled}>
                <span class="toggle-knob"></span>
              </button>
            </div>
            {#if rolloutEnabled}
              <div class="slider-section">
                <RangeSlider min={0} max={100} bind:value={rollout} oninput={markDirty} />
                <div class="range-ticks mono">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            {/if}
          </FlowNode>

          <!-- Overrides divider -->
          <div class="overrides-divider">
            <div class="divider-line" />
            <span class="divider-label mono">Overrides</span>
            <div class="divider-line" />
          </div>

          <!-- Segment override nodes -->
          {#each activeSegs as s}
            <div class="seg-node-wrapper">
              <FlowNode title={s.name} icon="◎" seg style="min-width: 172px;">
                <div class="seg-info mono">
                  <span class="seg-priority mono">#{s.priority}</span>
                  <span class="seg-dot">·</span>
                  <span>bypasses rollout</span>
                </div>
                <ValueEditor flagType={ftype} value={s.value} onchange={v => updateSegmentValue(s.id, v)} />
              </FlowNode>
              <button class="seg-remove-btn" onclick={() => removeSegment(s.id)} title="Remove override">×</button>
            </div>
          {/each}

          <!-- Add override button -->
          <div class="add-seg-wrapper">
            {#if availableSegments.length > 0}
              <button class="add-seg-btn" onclick={() => addDropOpen = !addDropOpen}>
                <span class="add-icon">+</span> Add segment override
              </button>
              {#if addDropOpen}
                <div class="seg-dropdown">
                  {#each availableSegments as s}
                    <div class="seg-dropdown-item" onclick={() => addSegment(s)}>
                      <div class="seg-dot-small" />
                      <span class="seg-dropdown-name mono">{s.name}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            {:else if segments.length === 0}
              <button class="add-seg-btn add-seg-btn-disabled" disabled>
                No available segments
              </button>
            {:else}
              <button class="add-seg-btn add-seg-btn-disabled" disabled>
                All segments added
              </button>
            {/if}
          </div>
        </div>

        <!-- ③ Arrows column -->
        <div class="arrows-col">
          {#if rolloutEnabled}
            <SplitArrow topLabel={`${rollout}% in`} bottomLabel={`${100 - rollout}% out`} />
          {:else}
            <FlowArrow active label="all users" />
          {/if}
          <div class="arrow-spacer" />
          <div class="arrow-spacer-add" />
        </div>

        <!-- ④ Outcome nodes -->
        <div class="outcomes-col">
          <FlowNode title="Served value" icon="→" accent style="min-width: 152px;">
            <ValueEditor flagType={ftype} value={servedValue} onchange={v => { servedValue = v; markDirty() }} />
            <div class="outcome-sub mono" style="color: var(--accent-line)">
              {rolloutEnabled ? `${rollout}% of users` : 'all users'}
            </div>
          </FlowNode>

          {#if rolloutEnabled}
            <FlowNode title="Default value" icon="⊘" style="min-width: 152px;">
              <ValueEditor flagType={ftype} value={defaultValue} onchange={v => { defaultValue = v; markDirty() }} />
              <div class="outcome-sub mono">{100 - rollout}% of users</div>
            </FlowNode>
          {/if}

          <div class="outcome-spacer" />

          {#each activeSegs as s}
            <FlowNode title={`→ ${s.name}`} seg style="min-width: 152px;">
              <div class="seg-outcome-row">
                <span class="seg-outcome-value mono" class:true={s.value === 'true'}>{s.value || 'true'}</span>
                <span class="seg-outcome-label mono">override</span>
              </div>
            </FlowNode>
          {/each}
        </div>
      {:else}
        <FlowArrow active={false} dashed />
        <UndefinedNode />
      {/if}
    </div>

    <!-- Save bar -->
    {#if dirty}
      <div class="save-bar">
        <button class="btn btn-primary btn-sm" onclick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button class="btn btn-ghost btn-sm" onclick={resetState}>Discard</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .config-panel {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: visible;
    margin-bottom: 16px;
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

  .type-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
  }

  .type-glyph {
    font-size: 13px;
  }

  .panel-body {
    padding: 18px 22px;
  }

  .description-row {
    margin-bottom: 18px;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .desc-label {
    font: 600 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--ink-3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    flex-shrink: 0;
  }

  .desc-text {
    font-size: 13px;
    color: var(--ink-2);
    line-height: 1.5;
  }

  .flow-pipeline {
    display: flex;
    align-items: flex-start;
    gap: 0;
    overflow: visible;
    padding-bottom: 4px;
  }

  .flag-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .flag-status {
    font-weight: 500;
    font-size: 12.5px;
    color: var(--ink-3);
  }

  .flag-status.active {
    color: var(--ink);
  }

  .flag-sub {
    font-size: 9.5px;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .middle-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-self: flex-start;
  }

  .rollout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 0;
  }

  .rollout-pct {
    font-weight: 500;
    font-size: 12.5px;
    color: var(--ink-3);
  }

  .rollout-pct.active {
    color: var(--ink);
  }

  .rollout-sub {
    font-size: 9.5px;
    color: var(--ink-3);
    margin-top: 2px;
  }

  .slider-section {
    margin-top: 8px;
  }

  .range-ticks {
    display: flex;
    justify-content: space-between;
    font-size: 8.5px;
    color: var(--ink-3);
    margin-top: 1px;
  }

  .overrides-divider {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--seg-line);
    opacity: 0.4;
  }

  .divider-label {
    font: 600 9px 'Geist Mono', ui-monospace, monospace;
    color: var(--seg-color);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    flex-shrink: 0;
  }

  .seg-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    color: var(--ink-3);
    margin-bottom: 7px;
  }

  .seg-priority {
    font-weight: 600;
    color: var(--seg-color);
  }

  .seg-dot {
    color: var(--seg-line);
  }

  .seg-node-wrapper {
    position: relative;
  }

  .seg-remove-btn {
    position: absolute;
    top: 11px;
    right: 6px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 3px;
    color: var(--ink-3);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s, background 0.15s;
    z-index: 2;
  }

  .seg-node-wrapper:hover .seg-remove-btn {
    opacity: 1;
  }

  .seg-remove-btn:hover {
    color: var(--ink);
    background: var(--bg-2);
  }

  .add-seg-wrapper {
    position: relative;
  }

  .add-seg-btn {
    width: 100%;
    background: transparent;
    border: 1px dashed var(--seg-line);
    border-radius: 6px;
    padding: 5px 10px;
    cursor: pointer;
    font: 400 10px 'Geist Mono', ui-monospace, monospace;
    color: var(--seg-color);
    display: flex;
    align-items: center;
    gap: 5px;
    transition: border-color 0.15s;
  }

  .add-seg-btn:hover {
    border-color: var(--seg-color);
  }

  .add-seg-btn-disabled {
    border-style: solid;
    border-color: var(--line);
    color: var(--ink-3);
    cursor: default;
  }

  .add-seg-btn-disabled:hover {
    border-color: var(--line);
  }

  .add-icon {
    font-size: 13px;
    line-height: 1;
  }

  .seg-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 20;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: 7px;
    padding: 6px;
    margin-top: 4px;
    min-width: 200px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  }

  .seg-dropdown-item {
    padding: 6px 8px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: background 0.12s;
  }

  .seg-dropdown-item:hover {
    background: var(--bg-3);
  }

  .seg-dot-small {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--seg-color);
    flex-shrink: 0;
  }

  .seg-dropdown-name {
    font: 500 11px 'Geist Mono', ui-monospace, monospace;
    color: var(--seg-color);
    flex: 1;
  }

  .arrows-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-self: flex-start;
  }

  .arrow-spacer {
    height: 17px;
  }

  .arrow-spacer-add {
    height: 28px;
  }

  .outcomes-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-self: flex-start;
  }

  .outcome-sub {
    font-size: 9px;
    color: var(--ink-3);
    margin-top: 5px;
  }

  .outcome-spacer {
    height: 17px;
  }

  .seg-outcome-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .seg-outcome-value {
    font: 600 11px 'Geist Mono', ui-monospace, monospace;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    color: var(--ink-3);
  }

  .seg-outcome-value.true {
    color: var(--accent);
  }

  .seg-outcome-label {
    font-size: 9px;
    color: var(--ink-3);
  }

  .save-bar {
    display: flex;
    gap: 8px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }

  /* Toggle button */
  .toggle {
    width: 36px;
    height: 20px;
    border-radius: 99px;
    cursor: pointer;
    background: var(--bg-3);
    border: 1px solid var(--line-2);
    position: relative;
    transition: background 0.2s, border-color 0.2s;
    flex-shrink: 0;
  }

  .toggle.on {
    background: var(--accent);
    border-color: var(--accent);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--ink-3);
    transition: left 0.2s, background 0.2s;
  }

  .toggle.on .toggle-knob {
    left: 17px;
    background: var(--bg);
  }

  .toggle.sm {
    width: 36px;
    height: 20px;
  }

  .toggle.sm .toggle-knob {
    width: 14px;
    height: 14px;
  }

  .toggle.sm.on .toggle-knob {
    left: 17px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    border-radius: 6px;
    font: 500 13.5px 'Geist', ui-sans-serif;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-sm {
    font-size: 12px;
    padding: 5px 10px;
  }

  .btn-primary {
    background: var(--ink);
    color: var(--bg);
  }

  .btn-primary:hover {
    opacity: 0.85;
  }

  .btn-primary:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border-color: var(--line-2);
  }

  .btn-ghost:hover {
    border-color: var(--ink);
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
  }
</style>
