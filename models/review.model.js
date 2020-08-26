const { Schema, model } = require("mongoose");

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
    select: "name avatar",
  }).populate({
    path: "stand",
    select: "name avatar",
  });
  next();
});

const Review = model("Review", reviewSchema);

module.exports = Review;
