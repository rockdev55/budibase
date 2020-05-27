const Router = require("@koa/router")
const controller = require("../controllers/component")

const router = Router()

router.get(
  "/:appId/components/definitions",
  controller.fetchAppComponentDefinitions
)

module.exports = router
