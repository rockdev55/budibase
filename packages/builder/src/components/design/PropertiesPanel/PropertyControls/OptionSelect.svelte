<script>
  import { onMount } from "svelte"
  import Portal from "svelte-portal"
  import { buildStyle } from "../../../../helpers.js"

  export let options = []
  export let value = ""
  export let styleBindingProperty
  export let onChange = () => {}

  let open = null
  let rotate = ""
  let select
  let selectMenu
  let icon
  let width = 0

  let selectAnchor = null
  let dimensions = { top: 0, bottom: 0, left: 0 }

  let positionSide = "top"
  let maxHeight = 0
  let scrollTop = 0
  let containerEl = null

  const handleStyleBind = value =>
    !!styleBindingProperty ? { style: `${styleBindingProperty}: ${value}` } : {}

  onMount(() => {
    if (select) {
      select.addEventListener("keydown", handleEnter)
    }

    return () => {
      select.removeEventListener("keydown", handleEnter)
    }
  })

  function handleEscape(e) {
    if (open && e.key === "Escape") {
      toggleSelect(false)
    }
  }

  function getDimensions() {
    const {
      bottom,
      top: spaceAbove,
      left,
    } = selectAnchor.getBoundingClientRect()
    const spaceBelow = window.innerHeight - bottom

    let y

    if (spaceAbove > spaceBelow) {
      positionSide = "bottom"
      maxHeight = spaceAbove - 20
      y = window.innerHeight - spaceAbove
    } else {
      positionSide = "top"
      y = bottom
      maxHeight = spaceBelow - 20
    }

    dimensions = { [positionSide]: y, left }
  }

  function handleEnter(e) {
    if (!open && e.key === "Enter") {
      toggleSelect(true)
    }
  }

  function toggleSelect(isOpen) {
    getDimensions()
    if (isOpen) {
      icon.style.transform = "rotate(180deg)"
    } else {
      icon.style.transform = "rotate(0deg)"
    }
    open = isOpen
  }

  function handleClick(val) {
    value = val
    onChange(value)
    toggleSelect(false)
  }

  $: menuStyle = buildStyle({
    "max-height": `${maxHeight.toFixed(0)}px`,
    "transform-origin": `center ${positionSide}`,
    [positionSide]: `${dimensions[positionSide]}px`,
    left: `${dimensions.left.toFixed(0)}px`,
    width: `${width}px`,
  })

  $: isOptionsObject = options.every(o => typeof o === "object")

  $: selectedOption = isOptionsObject
    ? options.find(o => o.value === value || (o.value === "" && value == null))
    : {}

  $: if (open && selectMenu) {
    selectMenu.focus()
  }

  $: displayLabel =
    selectedOption && selectedOption.label ? selectedOption.label : value || ""
</script>

<div
  bind:clientWidth={width}
  tabindex="0"
  bind:this={select}
  class="bb-select-container"
  on:click={() => toggleSelect(!open)}>
  <div bind:this={selectAnchor} title={value} class="bb-select-anchor selected">
    <span>{displayLabel}</span>
    <i bind:this={icon} class="ri-arrow-down-s-fill" />
  </div>
  {#if open}
    <Portal>
      <div
        tabindex="0"
        class:open
        bind:this={selectMenu}
        style={menuStyle}
        on:keydown={handleEscape}
        class="bb-select-menu">
        <ul>
          {#if isOptionsObject}
            {#each options as { value: v, label }}
              <li
                {...handleStyleBind(v)}
                on:click|self={handleClick(v)}
                class:selected={value === v}>
                {label}
              </li>
            {/each}
          {:else}
            {#each options as v}
              <li
                {...handleStyleBind(v)}
                on:click|self={handleClick(v)}
                class:selected={value === v}>
                {v}
              </li>
            {/each}
          {/if}
        </ul>
      </div>
      <div on:click|self={() => toggleSelect(false)} class="overlay" />
    </Portal>
  {/if}
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 1;
  }

  .bb-select-container {
    outline: none;
    cursor: pointer;
    overflow: hidden;
    flex: 1 1 auto;
  }

  .bb-select-anchor {
    cursor: pointer;
    display: flex;
    padding: var(--spacing-s) var(--spacing-m);
    background-color: var(--grey-2);
    border-radius: var(--border-radius-m);
    align-items: center;
    white-space: nowrap;
  }

  .bb-select-anchor > span {
    color: var(--ink);
    font-weight: 400;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-xs);
    flex: 1 1 auto;
  }

  .bb-select-anchor > i {
    transition: transform 0.13s ease;
    transform-origin: center;
    width: 20px;
    height: 20px;
    text-align: center;
  }

  .selected {
    color: var(--ink);
    font-weight: 400;
  }

  .bb-select-menu {
    position: absolute;
    display: flex;
    outline: none;
    box-sizing: border-box;
    flex-direction: column;
    opacity: 0;
    z-index: 2;
    color: var(--ink);
    font-weight: 400;
    height: fit-content !important;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    background-color: var(--grey-2);
    transform: scale(0);
    transition: opacity 0.13s linear, transform 0.12s cubic-bezier(0, 0, 0.2, 1);
    overflow-y: auto;
  }

  .open {
    transform: scale(1);
    opacity: 1;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 5px 0px;
  }

  li {
    height: auto;
    padding: 5px 0px;
    cursor: pointer;
    padding-left: 10px;
    font-size: var(--font-size-xs);
  }

  li:hover {
    background-color: var(--grey-3);
  }
</style>
