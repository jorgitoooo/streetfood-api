const { Favorite } = require("../models");
const { AppError, catchAsync } = require("../utils");
const { CODE, STATUS } = require("../constants");

exports.getAllFavorites = catchAsync(async function (req, res, next) {
  const favorites = await Favorite.find({ user: req.params.id });

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    results: favorites.length,
    data: {
      favorites,
    },
  });
});

exports.getFavorite = catchAsync(async function (req, res, next) {
  const favorite = await Favorite.find({
    _id: req.params.favoriteId,
    user: req.params.id,
  });

  if (!favorite) {
    return next(new AppError("Favorite not found", CODE.NOT_FOUND));
  }

  res.status(CODE.OK).json({
    status: STATUS.SUCCESS,
    data: {
      favorite,
    },
  });
});

exports.createFavorite = catchAsync(async function (req, res, next) {
  const newFavorite = await Favorite.create({
    user: req.params.id,
    stand: req.body.stand,
  });

  res.status(CODE.CREATED).json({
    status: STATUS.SUCCESS,
    data: {
      favorite: newFavorite,
    },
  });
});

exports.deleteFavorite = catchAsync(async function (req, res, next) {
  const favorite = await Favorite.findOne({
    user: req.params.id,
    stand: req.params.standId,
  });

  if (!favorite) {
    return next(
      new AppError(
        `Favorite for stand(${req.params.standId}) belonging to user(${req.params.id}) not found`,
        CODE.NOT_FOUND
      )
    );
  }

  await favorite.remove();

  res.status(CODE.NO_CONTENT).json({
    status: STATUS.SUCCESS,
    data: null,
  });
});
