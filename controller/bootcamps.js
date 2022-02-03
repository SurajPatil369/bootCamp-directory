const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const geocoder = require("../util/geocoder");
const colors = require("colors");

const {createError}=require('../util/createError');

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResult);
});

//@desc   Get single bootcamps
//@route  GET /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    throw createError("no bootcamp matching to this id is found",404);
  }
  res
    .status(200)
    .json({ success: "true", msg: "show single bootcamps", data: bootcamp });
});


//@desc   Create bootcamps
//@route  POST /api/v1/bootcamps
//@access Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user._id.toString();

  // if the user is not admin he cant add more than one bootcamp
  const publishedBootCamp = await Bootcamp.findOne({
    user: req.user._id.toString(),
  });
  if (publishedBootCamp && req.user.role !== "admin") {
    throw createError( `user with ${req.user._id.toString()} id has already published the bootcamp`,409);
  }
  const result = await Bootcamp.create(req.body);

  if (!result) {
    throw createError("Enable to create the bootcamp", 404);
  }
  res
    .status(201)
    .json({ success: "true", msg: "create bootcamps", result: result });
});

//@desc   Update bootcamps
//@route  PUT /api/v1/bootcamps/:id
//@access Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (bootcamp.user.toString() !== req.user._id.toString()) {
    throw createError(`cant update the bootcamp created by others`, 404);
  }

  if (!bootcamp) {
    throw createError("no bootcamp found to update with this id", 404);
  }
  res.status(200).json({ message: "updated the bootcamp", result: bootcamp });
});

//@desc   Delete bootcamps
//@route  DELETE /api/v1/bootcamps/:id
//@access Public
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const result = await Bootcamp.findById(id);
  //if no bootcamp found with this id
  if (!result) {
    throw createError("no bootcamps found with this id", 404);
  }
  //other than owner cant delete this bootcamp
  if (
    result.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw createError(
      `${req.user.role} has no permission to delete bootcamp`,
      404
    );
  }

  result.remove(); //we have called remove separately beacause to work with cascaded delete findbyidandremove dosen't work with cascade delete
  res.status(200).json({
    success: "true",
    length: result.length,
    msg: "bootcamp deleted",
    data: {},
  });
});

//@desc   Get bootcamps within radius
//@route  GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  console.log(zipcode, distance);
  const loc = await geocoder.geocode(zipcode);
  //get lng and lat from geocoder
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  //calc radius using radians
  //Divide dist by radius of Earth
  //Earth Radius =3,963 miles or /6,378km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc   Update bootcamp image
//@route  PUT /api/v1/bootcamps/:id/image
//@access Public
exports.updateBootcampImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw createError("plese upload a image ", 400);
  }
  const imageUrl = req.file.path.replace("\\", "/");

  const bootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    {
      photo: imageUrl,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  //other than owner cant update this bootcamp
  if (
    bootcamp.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw createError(`cant update the bootcamp created by others`, 404);
  }
  if (!bootcamp) {
    throw createError("no bootcamp found to update with this id", 404);
  }
  res.status(200).json({ message: "updated the bootcamp", result: bootcamp });
});

