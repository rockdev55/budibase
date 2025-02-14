<script>
  import { goto } from "@sveltech/routify"
  import { backendUiStore, store } from "builderStore"
  import { notifier } from "builderStore/store/notifications"
  import {
    Input,
    Label,
    ModalContent,
    Button,
    Spacer,
    Toggle,
  } from "@budibase/bbui"
  import TableDataImport from "../TableDataImport.svelte"
  import analytics from "analytics"
  import screenTemplates from "builderStore/store/screenTemplates"
  import { NEW_ROW_TEMPLATE } from "builderStore/store/screenTemplates/newRowScreen"
  import { ROW_DETAIL_TEMPLATE } from "builderStore/store/screenTemplates/rowDetailScreen"
  import { ROW_LIST_TEMPLATE } from "builderStore/store/screenTemplates/rowListScreen"

  const defaultScreens = [
    NEW_ROW_TEMPLATE,
    ROW_DETAIL_TEMPLATE,
    ROW_LIST_TEMPLATE,
  ]

  let modal
  let name
  let dataImport
  let error = ""
  let createAutoscreens = true

  function checkValid(evt) {
    const tableName = evt.target.value
    if ($backendUiStore.models?.some(model => model.name === tableName)) {
      error = `Table with name ${tableName} already exists. Please choose another name.`
      return
    }
    error = ""
  }

  async function saveTable() {
    let newTable = {
      name,
      schema: dataImport.schema || {},
      dataImport,
    }

    // Only set primary display if defined
    if (dataImport.primaryDisplay && dataImport.primaryDisplay.length) {
      newTable.primaryDisplay = dataImport.primaryDisplay
    }

    // Create table
    const table = await backendUiStore.actions.tables.save(newTable)
    notifier.success(`Table ${name} created successfully.`)
    analytics.captureEvent("Table Created", { name })

    // Create auto screens
    if (createAutoscreens) {
      const screens = screenTemplates($store, [table])
        .filter(template => defaultScreens.includes(template.id))
        .map(template => template.create())
      for (let screen of screens) {
        // Record the table that created this screen so we can link it later
        screen.autoTableId = table._id
        await store.actions.screens.create(screen)
      }

      // Create autolink to newly created list screen
      const listScreen = screens.find(screen =>
        screen.props._instanceName.endsWith("List")
      )
      await store.actions.components.links.save(
        listScreen.routing.route,
        table.name
      )
    }

    // Navigate to new table
    $goto(`./table/${table._id}`)
  }
</script>

<ModalContent
  title="Create Table"
  confirmText="Create"
  onConfirm={saveTable}
  disabled={error || !name || (dataImport && !dataImport.valid)}>
  <Input
    data-cy="table-name-input"
    thin
    label="Table Name"
    on:input={checkValid}
    bind:value={name}
    {error} />
  <Toggle
    text="Generate screens in the design section"
    bind:checked={createAutoscreens} />
  <div>
    <Label grey extraSmall>Create Table from CSV (Optional)</Label>
    <TableDataImport bind:dataImport />
  </div>
</ModalContent>
