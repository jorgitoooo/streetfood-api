const { Stand } = require("../models");
const { CODE, STATUS } = require("../constants");
const { catchAsync, AppError } = require("../utils");
// const { getAllReviews } = require("./review.controller");

exports.createStand = catchAsync(async function (req, res, next) {
  const stand = await Stand.create(req.body);

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    data: {
      stand,
    },
  });
});

exports.deleteStand = catchAsync(async function (req, res, next) {
  const stand = await Stand.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user.id,
    },
    { active: false }
  );

  if (!stand) {
    return next(
      new AppError("Stand for user does not exists.", CODE.NOT_FOUND)
    );
  }

  res.status(CODE.NO_CONTENT).json({
    status: STATUS.SUCCESS,
    data: null,
  });
});

exports.getStand = catchAsync(async function (req, res, next) {
  const stand = await Stand.findById(req.params.id).populate({
    path: "reviews",
    select: "-__v",
  });

  if (!stand) {
    return next(
      new AppError(
        `Stand with id(${req.params.id}) does not exist`,
        CODE.NOT_FOUND
      )
    );
  }

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    data: {
      stand,
    },
  });
});

exports.getAllStands = catchAsync(async function getAllStands(req, res, next) {
  const query = Stand.find();
  if (req.query.info && req.query.info === "short") {
    query.select("_id name ratingsAverage ratingsQuantity avatar");
  } else {
    query.select("-__v");
  }

  const stands = await query;

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    results: stands.length,
    data: {
      stands,
    },
  });
});
