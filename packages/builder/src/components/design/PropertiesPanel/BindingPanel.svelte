<script>
  import groupBy from "lodash/fp/groupBy"
  import { Button, TextArea, Drawer, Heading, Spacer } from "@budibase/bbui"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()
  export let bindableProperties
  export let value = ""
  export let bindingDrawer

  function addToText(readableBinding) {
    value = `${value || ""}{{ ${readableBinding} }}`
  }
  let originalValue = value

  $: dispatch("update", value)

  export function cancel() {
    dispatch("update", originalValue)
    bindingDrawer.close()
  }

  $: ({ instance, context } = groupBy("type", bindableProperties))
</script>

<div class="drawer-contents">
  <div class="container" data-cy="binding-dropdown-modal">
    <div class="list">
      <Heading extraSmall>Objects</Heading>
      <Spacer medium />
      {#if context}
        <Heading extraSmall>Tables</Heading>
        <ul>
          {#each context as { readableBinding }}
            <li on:click={() => addToText(readableBinding)}>
              {readableBinding}
            </li>
          {/each}
        </ul>
      {/if}
      {#if instance}
        <Heading extraSmall>Components</Heading>
        <ul>
          {#each instance as { readableBinding }}
            <li on:click={() => addToText(readableBinding)}>
              {readableBinding}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="text">
      <TextArea
        thin
        bind:value
        placeholder="Add text, or click the objects on the left to add them to the
        textbox." />
    </div>
  </div>
</div>

<style>
  .container {
    height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
  }
  .list {
    width: 150px;
    border-right: 1.5px solid var(--grey-4);
    padding: var(--spacing-s);
  }
  .text {
    padding: var(--spacing-s);
    font-family: var(--font-sans);
  }
  .text :global(p) {
    margin: 0;
  }
  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    font-family: var(--font-sans);
    font-size: var(--font-size-xs);
    color: var(--grey-7);
    padding: var(--spacing-s) 0;
    margin: auto 0px;
    align-items: center;
    cursor: pointer;
  }

  li:hover {
    color: var(--ink);
    font-weight: 500;
  }

  li:active {
    color: var(--blue);
  }

  .drawer-contents {
    height: 40vh;
    overflow-y: auto;
  }
</style>
