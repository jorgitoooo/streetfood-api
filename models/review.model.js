const { Schema, model } = require("mongoose");
const Stand = require("./stand.model");

const reviewSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: "User",
  },
  stand: {
    type: Schema.ObjectId,
    ref: "Stand",
  },
  text: String,
  rating: {
    type: Number,
    min: [0, "Review must have a rating greater than or equal to 0"],
    max: [5, "Review must have a rating less than or equal to 5"],
    required: [true, "Review must have a rating"],
  },
});

// Enforces one-to-one relationship between user and stand
reviewSchema.index({ author: 1, stand: 1 }, { unique: true });

// Query middleware:
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "handle avatar",
  }).populate({
    path: "stand",
    select: "name avatar",
  });
  next();
});

// The following functions calculate average ratings and
// update the stand with the given id
reviewSchema.statics.calcAvgerageRatings = async function (standId) {
  const stats = await this.aggregate([
    {
      $match: { stand: standId },
    },
    {
      $group: {
        _id: "$stand",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Stand.findByIdAndUpdate(standId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Stand.findByIdAndUpdate(standId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAvgerageRatings(this.stand);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // query is executed to retrieve the review and passed to the post query handler
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() doesn't work here since query has already executed
  await this.r.constructor.calcAvgerageRatings(this.r.stand);
});

const Review = model("Review", reviewSchema);

module.exports = Review;
