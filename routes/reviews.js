const router = require("express").Router({ mergeParams: true });
const {
  getReviews,
  getReview,
  postReview,
  updateReview,
  deleteReview
} = require("../controller/review");

const { isAuth, isAuthorized } = require("../middleware/is-auth");//to check the user has authenticated and give the authorization to access particular route

const Review = require("../models/Review");
const advanceResults = require("../middleware/advanceresult");

//resource router created inside bootcamps will also hit this route
router
  .route("/")
  .get(
    advanceResults(Review, { path: "bootcamp", select: "name description" }),
    getReviews
  )
  .post(isAuth, isAuthorized("user"), postReview);
router
  .route("/:reviewId")
  .get(getReview)
  .put(isAuth, isAuthorized("user", "admin"), updateReview)
  .delete(isAuth,isAuthorized("user","admin"),deleteReview)
module.exports = router;
