<script lang="ts">
  import BoolEditor from './BoolEditor.svelte'
  import StringEditor from './StringEditor.svelte'
  import NumberEditor from './NumberEditor.svelte'

  let { flagType, value, onchange, stringMaxLength = 50 }: {
    flagType: 'bool' | 'string' | 'number'
    value: string
    onchange: (v: string) => void
    stringMaxLength?: number
  } = $props()
</script>

{#if flagType === 'bool'}
  <BoolEditor {value} {onchange} />
{:else if flagType === 'string'}
  <StringEditor {value} {onchange} maxLength={stringMaxLength} />
{:else if flagType === 'number'}
  <NumberEditor {value} {onchange} />
{/if}