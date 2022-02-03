const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");
const Review = require("../models/Review");
const { createError } = require("../util/createError");

//@desc   Get all review
//@route  GET /api/v1/reviews
//@route  GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public

exports.getReviews = asyncHandler(async (req, res, next) => {
  console.log(req.params.bootcampId);
  if (req.params.bootcampId) {
    query = await Review.find({ bootcamp: req.params.bootcampId });
  } else {
    return res.status(200).json(res.advanceResult);
  }
  res.status(200).json({ success: true, data: query });
});
//@desc   Get Single review
//@route  GET /api/v1/reviewId
//@access Public

exports.getReview = asyncHandler(async (req, res, next) => {
  const id = req.params.reviewId;
  console.log(id);
  const review = await Review.findById(id);
  if (!review) {
    throw createError("no review found matching with this id", 404);
  }
  res.status(200).json({ success: true, data: review });
});

//@desc   Post a review
//@route  GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.postReview = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.bootcampId;
  req.body.bootcamp = bootcampId;
  req.body.user = req.user._id;

  console.log(bootcampId);
  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) {
    throw createError("no bootcamp found with this id", 404);
  }
  const review = await Review.create(req.body);
  if (!review) {
    throw createError("review cant be posted at this moment", 401);
  }
  res.status(200).json({ success: true, data: review });
});

//@desc   update a review
//@route  PUT /api/v1/reviews/:reviewId
//@access Public
exports.updateReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  let oldReview = await Review.findById(reviewId);
  if (!oldReview) {
    throw createError("no review found with this id", 404);
  }
  if (
    oldReview.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw createError("you are not authorized to update post", 401);
  }
  updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updatedReview });
});
//@desc   delete a review
//@route  DELETE /api/v1/reviews/:reviewId
//@access Public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  let oldReview = await Review.findByIdAndRemove(reviewId);
  if (!oldReview){
    throw createError('Review to be  deleted is not exist in database',404)
  }
  res.status(200).json({ success: true, data: oldReview });
});
