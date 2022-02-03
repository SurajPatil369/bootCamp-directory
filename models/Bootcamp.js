const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const geocoder = require("../util/geocoder");
const BootcampSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [50, "name can not be more than 50 characters"],
    },
    slug: String, //slug is nothing but the url freindly name
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "name can not be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/,
        "Plese use a valid url with http or https",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can no tbe longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Plese add the valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Plese add an address"],
    },

    //Geojson point
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAdress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating mus be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    JobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user:{
      type:mongoose.Schema.ObjectId,
      ref:'Auth',
      required:'true'
    }
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAdress: loc[0].formattedAdress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
  this.address = undefined;
  next();
});

//reverse population
BootcampSchema.virtual("courses", {
  ref: "Course", //The model to use
  localField: "_id", // Your local field, like a `FOREIGN KEY` in RDS
  foreignField: "bootcamp", //// Your foreign field which `localField` linked to
  justOne: false,
});

//cascade delete
BootcampSchema.pre("remove", async function (next) {
  console.log("Courses being removed from bootcamp", this._id);
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
