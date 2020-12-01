import mustache from "mustache"

// this is a much more liberal version of mustache's escape function
// ...just ignoring < and > to prevent tags from user input
// original version here https://github.com/janl/mustache.js/blob/4b7908f5c9fec469a11cfaed2f2bed23c84e1c5c/mustache.js#L78
const entityMap = {
  "<": "&lt;",
  ">": "&gt;",
}
mustache.escape = text => {
  if (text == null || typeof text !== "string") {
    return text
  }
  return text.replace(/[<>]/g, function fromEntityMap(s) {
    return entityMap[s] || s
  })
}

// Regex to test inputs with to see if they are likely candidates for mustache
const looksLikeMustache = /{{.*}}/

/**
 * Enriches a given input with a row from the database.
 */
export const enrichDataBinding = (input, context) => {
  // Only accept string inputs
  if (!input || typeof input !== "string") {
    return input
  }
  // Do a fast regex check if this looks like a mustache string
  if (!looksLikeMustache.test(input)) {
    return input
  }
  return mustache.render(input, context)
}

/**
 * Enriches each prop in a props object
 */
export const enrichDataBindings = (props, context) => {
  let enrichedProps = {}
  Object.entries(props).forEach(([key, value]) => {
    enrichedProps[key] = enrichDataBinding(value, context)
  })
  return enrichedProps
}
