/* eslint-disable no-prototype-builtins */
const { User } = require("../models");
const { CODE, STATUS } = require("../constants");
const { AppError, catchAsync } = require("../utils");

function filterObj(obj, ...fields) {
  const res = {};
  fields.forEach((field) => {
    if (field in obj) {
      res[field] = obj[field];
    }
  });
  return res;
}

exports.getMe = function (req, res, next) {
  req.params.id = req.user._id;
  next();
};

exports.deleteMe = catchAsync(async function (req, res, next) {
  const user = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  if (!user) {
    return next(new AppError("User does not exist.", CODE.NOT_FOUND));
  }

  res.status(CODE.NO_CONTENT).json({
    status: STATUS.SUCCESS,
    data: null,
  });
});

exports.updateMe = catchAsync(async function (req, res, next) {
  if (
    req.body.hasOwnProperty("password") ||
    req.body.hasOwnProperty("passwordConfirm")
  ) {
    return next(
      new AppError(
        "Password should not be modified using this route",
        CODE.BAD_REQUEST
      )
    );
  }

  // TODO: Allow for updating avatar
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "handle",
    "email"
  );

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody);
  if (!user) {
    return next(new AppError("User does not exist.", CODE.NOT_FOUND));
  }

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.params.id)
    .populate({ path: "reviews", select: "-__v" })
    .populate({ path: "favorites", select: "-__v" });

  if (!user) {
    return next(
      new AppError(
        `User with id ${req.params.id} does not exist`,
        CODE.NOT_FOUND
      )
    );
  }

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async function (req, res, next) {
  const users = await User.find();

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    results: users.length,
    data: {
      users,
    },
  });
});
