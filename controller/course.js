const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Course = require("../models/Course");
const {createError}=require('../util/createError');
//@desc   Get all course
//@route  GET /api/v1/courses
//@route  GET /api/v1/bootcamps/:bootcampId/courses
//@access Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    query = await Course.find({ bootcamp: req.params.bootcampId });
  } else {
    res.status(200).json(res.advanceResult);
  }
});

//@desc   Get single course
//@route  GET /api/v1/courses/:courseId
//@access Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.courseId;
  let query = Course.findById(id);
  if (!query) {
    throw createError("no course matching to this id is found",404);
  }
  const course = await query;
  res.status(200).json({
    success: true,
    count: course.length,
    data: course,
  });
});

//@desc   Create course
//@route  GET /api/v1/bootcamps/:bootcampId/courses
//@access Public

exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  let bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    throw createError("no bootcamp matching to this id is found",404)
  }
  req.body.user=req.user._id.toString();
  const course = await Course.create(req.body);
  res.status(200).json({
    success: true,
    message: "course created succesfully",
    data: course,
  });
});

//@desc   Update single course
//@route  GET /api/v1/courses/:courseId
//@access private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.courseId;
  const course = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    throw createError("no course matching to this id is found",404);
  }
  res.status(200).json({
    success: true,
    count: course.length,
    data: course,
  });
});
//@desc   Delete single course
//@route  GET /api/v1/courses/:courseId
//@access private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.courseId;
  console.log(req.userId)
  const course = Course.findById(id);
  if (!course) {
    throw createError("no course matching to this id is found",404)
  }
  await course.deleteOne();
  res.status(200).json({
    success: true,
    message: "course deleted succesfully",
    data: {},
  });
});
