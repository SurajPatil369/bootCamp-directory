const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const colors = require("colors");
const CourseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "plese add a course title"],
  },
  description: {
    type: String,
    required: [true, "Plese add a description"],
  },
  weeks: {
    type: Number,
    required: [true, "Plese add a number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Plese add a tuituion cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Plese add minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholershipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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

//average calculation using mongosoe aggregation
CourseSchema.statics.calculateAvg = async function (bootcampId) {
  console.log(`calculating average`.red);
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: { _id: "$bootcamp", averageCost: { $avg: "$tuition" } },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

//before saving the course calculate the average cost of its parent bootcamp
CourseSchema.post("save", function () {
  this.constructor.calculateAvg(this.bootcamp);
});
CourseSchema.pre("remove", function () {
  this.constructor.calculateAvg(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
