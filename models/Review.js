const mongoose = require("mongoose");

const reviewScheam = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "plese add a title for the review "],
    maxlength: 100,
  },
  text: { type: String, required: [true, "plese add some text"] },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Plese add a rating between 1 and 10"],
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "Auth",
    required: true,
  },
});

reviewScheam.statics.calculateAvgRating = async function (bootcampId) {
  console.log("calculating average rating".green);
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: "$bootcamp", averageRating: { $avg: "$rating" } } },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId,{
      averageRating:Math.ceil(obj[0].averageRating),
    });

  } catch (error) {
    console.log(error)
  }
};

//calculating average rating for each bootcamp after saving document
reviewScheam.post("save", function () {
  this.constructor.calculateAvgRating(this.bootcamp);
});
reviewScheam.pre("remove", function () {
  this.constructor.calculateAvgRating(this.bootcamp);
});
//Prevent User from submitting more than one review
reviewScheam.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewScheam);
