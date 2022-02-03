const express = require("express");
const app = express();
const dotenv = require("dotenv");
const logger = require('morgan');
const connectDB=require('./db/db');
const fs=require('fs');
const colors = require('colors');
const bodyParser = require('body-parser')
const errorHandler=require('./middleware/error')
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path=require('path')
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp');
const compression = require('compression')

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//load env vars
dotenv.config({ path: './config/config.env' });

const bootcampRoute=require('./routes/bootcamps');
const courseRoute=require('./routes/course')
const authRoute=require('./routes/auth');
const reviewRoute=require('./routes/reviews');
//connect to db
connectDB();

//set port
const PORT = process.env.PORT || 5000 ;

//to compress the each response
app.use(compression())
app.use(bodyParser.json()); //application/json parsers

app.use(
  multer({storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "images"))); //to serve the images statically
app.use(express.static(path.join(__dirname, "public"))); //to serve the files statically
app.use(cookieParser());

//sanitize input request the data
app.use(mongoSanitize());
//adding security headers
app.use(helmet());
//to avoid xss attack
app.use(xss());

//limiting the rate at which user hit the api
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

//remove http parameter pollution
app.use(hpp());
// / create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

//to log the req
app.use(logger('combined', { stream: accessLogStream }));
app.use(express.json());
app.use('/api/v1/bootcamps',bootcampRoute);
app.use('/api/v1/courses',courseRoute);
app.use('/api/v1/auth',authRoute);
app.use('/api/v1/reviews',reviewRoute);
app.use(errorHandler);
app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);
