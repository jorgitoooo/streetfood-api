const express = require("express");
const controller = require("../controllers");
const { ROLE } = require("../constants");

const router = express.Router();

router
  .route("/")
  .get(controller.stand.getAllStands)
  .post(
    controller.auth.protect,
    controller.auth.restrictTo(ROLE.ADMIN, ROLE.STAND_OWNER),
    controller.stand.createStand
  );

router
  .route("/:id")
  .get(controller.stand.getStand)
  .delete(
    controller.auth.protect,
    controller.auth.restrictTo(ROLE.ADMIN, ROLE.STAND_OWNER),
    controller.stand.deleteStand
  );

module.exports = router;
