const router = require("express").Router({ mergeParams: true });
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controller/course");
const Course = require("../models/Course");
const advanceResult = require("../middleware/advanceresult");
const { isAuth, isAuthorized } = require("../middleware/is-auth");
//
router
  .route("/")
  .get(
    advanceResult(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(isAuth, isAuthorized("publisher","admin"), createCourse);
router
  .route("/:courseId")
  .get(getCourse)
  .put(isAuth, isAuthorized("publisher","admin"), updateCourse)
  .delete(isAuth, isAuthorized("publisher","admin"), deleteCourse);

module.exports = router;
