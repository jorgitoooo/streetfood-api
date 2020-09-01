const express = require("express");
const controller = require("../controllers");
const { ROLE } = require("../constants");

const router = express.Router();

// Authentication routes
router.post("/signup", controller.auth.signup);
router.post("/login", controller.auth.login);

// TODO: Implement forgot/reset password functionality
// router.post("/update-password", controller.user.updatePassword);
// router.post("/forgot-password", controller.user.forgotPassword);
// router.post("/reset-password", controller.user.resetPassword);

// All routes below this line require authentication
router.use(controller.auth.protect);

// User root route
router.route("/").get(controller.user.getAllUsers);

// Current logged in user route
router
  .route("/me")
  .get(controller.user.getMe, controller.user.getUser)
  .patch(controller.user.updateMe)
  .delete(controller.user.deleteMe);

// Specific user route
router.route("/:id").get(controller.user.getUser);

// Review routes
router
  .route("/:id/review")
  .get(controller.review.getAllReviews)
  .post(
    controller.auth.restrictTo(ROLE.ADMIN, ROLE.USER),
    controller.auth.idBelongsToUser,
    controller.review.createReview
  );
router
  .route("/:id/review/:reviewId")
  .patch(
    controller.auth.restrictTo(ROLE.ADMIN, ROLE.USER),
    controller.auth.idBelongsToUser,
    controller.review.updateReview
  )
  .delete(
    controller.auth.restrictTo(ROLE.ADMIN, ROLE.USER),
    controller.auth.idBelongsToUser,
    controller.review.deleteReview
  );

// Favorite routes
router
  .route("/:id/favorite")
  .get(controller.favorite.getAllFavorites)
  .post(controller.auth.idBelongsToUser, controller.favorite.createFavorite);
router
  .route("/:id/favorite/:standId")
  .delete(controller.auth.idBelongsToUser, controller.favorite.deleteFavorite);

module.exports = router;
