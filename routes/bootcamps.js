const router = require("express").Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootCamp,
  getBootcampsInRadius,
  updateBootcampImage
} = require("../controller/bootcamps");


const {isAuth,isAuthorized}=require("../middleware/is-auth")
//Include other resourse router

const courseRouter=require('../routes/course');
const reviewRouter=require('./reviews');

const Bootcamp=require('../models/Bootcamp');
const advanceResults = require("../middleware/advanceresult");

//Re-route into other resource routers
router.use('/:bootcampId/courses',courseRouter);
router.use('/:bootcampId/reviews',reviewRouter);

router.route("/radius/:zipcode/:distance") 
      .get(getBootcampsInRadius);
      
router.route("/")
       .get(advanceResults(Bootcamp,'courses'),getBootcamps) 
       .post(isAuth,isAuthorized('publisher','admin'),createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(isAuth,isAuthorized('publisher','admin'),updateBootcamp)
  .delete(isAuth,isAuthorized('publisher','admin'),deleteBootCamp);

router.route("/:id/image").put(isAuth,isAuthorized('publisher','admin'),updateBootcampImage)

module.exports = router;
