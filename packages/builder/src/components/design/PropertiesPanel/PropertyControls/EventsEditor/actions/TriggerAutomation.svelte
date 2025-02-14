<script>
  import { Select, Label, Input } from "@budibase/bbui"
  import { automationStore } from "builderStore"
  import SaveFields from "./SaveFields.svelte"

  const AUTOMATION_STATUS = {
    NEW: "new",
    EXISTING: "existing",
  }

  export let parameters = {}

  let automationStatus = parameters.automationId
    ? AUTOMATION_STATUS.EXISTING
    : AUTOMATION_STATUS.NEW

  $: automations = $automationStore.automations
    .filter(a => a.definition.trigger?.stepId === "APP")
    .map(automation => {
      const schema = Object.entries(
        automation.definition.trigger.inputs.fields
      ).map(([name, type]) => ({ name, type }))

      return {
        name: automation.name,
        _id: automation._id,
        schema,
      }
    })

  $: hasAutomations = automations && automations.length > 0

  $: selectedAutomation =
    parameters &&
    parameters.automationId &&
    automations.find(a => a._id === parameters.automationId)

  const onFieldsChanged = e => {
    parameters.fields = e.detail
  }

  const setNew = () => {
    automationStatus = AUTOMATION_STATUS.NEW
    parameters.automationId = undefined
  }

  const setExisting = () => {
    automationStatus = AUTOMATION_STATUS.EXISTING
    parameters.newAutomationName = ""
  }
</script>

<div class="root">
  <div class="radio-container" on:click={setNew}>
    <input
      type="radio"
      value={AUTOMATION_STATUS.NEW}
      bind:group={automationStatus}
      disabled={!hasAutomations} />

    <Label disabled={!hasAutomations}>Create a new automation</Label>
  </div>

  <div class="radio-container" on:click={setExisting}>
    <input
      type="radio"
      value={AUTOMATION_STATUS.EXISTING}
      bind:group={automationStatus}
      disabled={!hasAutomations} />

    <Label disabled={!hasAutomations}>Use an existing automation</Label>
  </div>

  <Label size="m" color="dark">Automation</Label>

  {#if automationStatus === AUTOMATION_STATUS.EXISTING}
    <Select
      secondary
      bind:value={parameters.automationId}
      placeholder="Choose automation">
      <option value="" />
      {#each automations as automation}
        <option value={automation._id}>{automation.name}</option>
      {/each}
    </Select>
  {:else}
    <Input
      secondary
      bind:value={parameters.newAutomationName}
      placeholder="Enter automation name" />
  {/if}

  <SaveFields
    schemaFields={automationStatus === AUTOMATION_STATUS.EXISTING && selectedAutomation && selectedAutomation.schema}
    fieldLabel="Field"
    on:fieldschanged={onFieldsChanged} />
</div>

<style>
  .root {
    display: grid;
    column-gap: var(--spacing-s);
    row-gap: var(--spacing-s);
    grid-template-columns: auto 1fr auto 1fr auto;
    align-items: baseline;
  }

  .root :global(> div:nth-child(4)) {
    grid-column: 2 / span 4;
  }

  .radio-container {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .radio-container:nth-child(1) {
    grid-column: 1 / span 2;
  }

  .radio-container:nth-child(2) {
    grid-column: 3 / span 3;
  }

  .radio-container :global(> label) {
    margin-left: var(--spacing-m);
  }

  .radio-container > input {
    margin-bottom: var(--spacing-s);
  }

  .radio-container > input:focus {
    outline: none;
  }
</style>
