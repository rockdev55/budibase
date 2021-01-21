import { cloneDeep } from "lodash/fp"
import { processString, processObject } from "@budibase/string-templates"

// Regex to test inputs with to see if they are likely candidates for template strings
const looksLikeTemplate = /{{.*}}/

/**
 * Enriches a given input with a row from the database.
 */
export const enrichDataBinding = async (input, context) => {
  // Only accept string inputs
  if (!input || typeof input !== "string") {
    return input
  }
  // Do a fast regex check if this looks like a template string
  if (!looksLikeTemplate.test(input)) {
    return input
  }
  return processString(input, context)
}

/**
 * Recursively enriches all props in a props object and returns the new props.
 * Props are deeply cloned so that no mutation is done to the source object.
 */
export const enrichDataBindings = async (props, context) => {
  return await processObject(cloneDeep(props), context)
}

/**
 * Recurses through an object and enriches all string props found.
 */
const recursiveEnrich = (props, context) => {
  if (typeof props !== "object") {
    return
  }
  let keys = []
  if (Array.isArray(props)) {
    keys = Array.from(props.keys())
  } else if (typeof props === "object") {
    keys = Object.keys(props || {})
  }
  keys.forEach(key => {
    if (typeof props[key] === "string") {
      props[key] = enrichDataBinding(props[key], context)
    } else {
      recursiveEnrich(props[key], context)
    }
  })
}
