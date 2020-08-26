const { Review } = require("../models");
const { catchAsync, AppError } = require("../utils");
const { CODE, STATUS } = require("../constants");

exports.getAllReviews = catchAsync(async function (req, res, next) {
  const reviews = await Review.find({ author: req.params.id });

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// TODO: Implement everything below this comment
exports.createReview = catchAsync(async function (req, res, next) {
  const newReview = await Review.create({
    author: req.params.id,
    stand: req.body.stand,
    text: req.body.text,
    rating: req.body.rating,
  });

  res.status(CODE.CREATED).json({
    status: STATUS.SUCCESS,
    data: {
      review: newReview,
    },
  });
});

exports.updateReview = catchAsync(async function (req, res, next) {
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.reviewId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedReview) {
    return next(new AppError("Review not found", CODE.NOT_FOUND));
  }

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    data: {
      review: updatedReview,
    },
  });
});

exports.deleteReview = catchAsync(async function (req, res, next) {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    author: req.user.id,
  });

  if (!review) {
    return next(
      new AppError("Review for user does not exist", CODE.BAD_REQUEST)
    );
  }

  await review.remove();

  res.status(CODE.NO_CONTENT).json({
    status: STATUS.SUCCESS,
    data: null,
  });
});
