import * as Sentry from "@sentry/browser"
import posthog from "posthog-js"

function activate() {
  Sentry.init({ dsn: process.env.SENTRY_DSN })
  posthog.init(process.env.POSTHOG_TOKEN, {
    api_host: process.env.POSTHOG_URL,
  })
}

function captureException(err) {
  Sentry.captureException(err)
}

function captureEvent(event) {
  if (process.env.NODE_ENV !== "production") return;
  posthog.capture(event)
}

export default {
  activate,
  captureException,
  captureEvent
}
