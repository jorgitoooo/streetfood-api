const jwt = require("jsonwebtoken");

const { promisify } = require("util");
const { User } = require("../models");
const { AppError, catchAsync } = require("../utils");
const { CODE, ROLE, STATUS } = require("../constants");

const EXPIRES_IN_MS = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function signTokenAndSend(user, status, res, req) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + EXPIRES_IN_MS),
    httpOnly: true,
    // Heroku specific header
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(status).json({
    status: STATUS.SUCCESS,
    token,
    data: {
      user: {
        _id: user._id,
        handle: user.handle,
        email: user.email,
      },
    },
  });
}

exports.signup = catchAsync(async function signup(req, res, next) {
  const {
    firstName,
    lastName,
    handle,
    email,
    password,
    passwordConfirm,
  } = req.body;
  const newUser = await User.create({
    // role, // Will change later so that users cannot specify role
    firstName,
    lastName,
    handle,
    email,
    password,
    passwordConfirm,
  });

  signTokenAndSend(newUser, CODE.CREATED, res, req);
});

exports.login = catchAsync(async function login(req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  let pwdMatch;
  if (user) {
    pwdMatch = await user.passwordMatch(req.body.password);
  }

  if (!user || !pwdMatch) {
    return next(
      new AppError("Email or password did not match", CODE.BAD_REQUEST)
    );
  }

  signTokenAndSend(user, CODE.OK, res, req);
});

exports.protect = catchAsync(async function protect(req, res, next) {
  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to gain access.",
        CODE.UNAUTHORIZED
      )
    );
  }

  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id);
  if (!user) {
    return next(
      new AppError(
        "User for token does not exist. Please login and try again",
        CODE.UNAUTHORIZED
      )
    );
  }

  if (user.changedPasswordAfter(payload.iat)) {
    return next(
      new AppError(
        "Password was changed after token was created. Please log in again.",
        CODE.UNAUTHORIZED
      )
    );
  }

  // Grant access to protected route
  req.user = user;
  next();
});

exports.restrictTo = function restrictTo(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden access to route", CODE.FORBIDDEN));
    }
    next();
  };
};

// TODO: Everything below this line needs to be implemented
// The authentication middleware should always run before this function
exports.idBelongsToUser = function (req, res, next) {
  if (
    !req.user ||
    (req.user.id !== req.params.id && req.user.role !== ROLE.ADMIN)
  ) {
    return next(new AppError("Forbidden access to route", CODE.FORBIDDEN));
  }
  next();
};

exports.getUser = catchAsync(async function (req, res, next) {
  console.log("getUser");
});

exports.getAllUsers = catchAsync(async function (req, res, next) {
  console.log("getUser");
});
