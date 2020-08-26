const { Schema, model } = require("mongoose");

const favoriteSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  stand: {
    type: Schema.ObjectId,
    ref: "Stand",
  },
});

// Enforces one-to-one relationship between user and stand
favoriteSchema.index({ user: 1, stand: 1 }, { unique: true });

favoriteSchema.pre(/^find/, function (next) {
  this.populate({
    path: "stand",
    select: "name avatar",
  });
  next();
});

const Favorite = model("Favorite", favoriteSchema);

module.exports = Favorite;
