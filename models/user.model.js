const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const Stand = require("./stand.model");
const validator = require("../validators");
const { ROLE } = require("../constants");

const { ADMIN, USER, STAND_OWNER } = ROLE;

const userSchema = new Schema(
  {
    role: {
      type: String,
      default: USER,
      enum: [ADMIN, USER, STAND_OWNER],
    },
    firstName: {
      type: String,
      required: [true, "A user must have a first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "A user must have a last name"],
      trim: true,
    },
    handle: {
      type: String,
      required: [true, "A user must have a username"],
      trim: true,
      unique: true,
      maxlength: [15, "A username must not be larger than 15 characters"],
    },
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.user.isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      min: [8, "Password must contain at least 8 characters"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "A user must confirm password"],
      validate: [validator.user.validPasswordConfirm, "Passwords do not match"],
    },
    avatar: {
      type: String,
      default: "user-avatar-default.jpeg",
    },
    passwordChangedDate: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("favorites", {
  ref: "Favorite",
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "author",
});

// Model middleware:

// Tests if password has been modified and clears passwordConfirmed
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, /** salt=*/ 12);
    this.passwordConfirm = undefined; // Only used to confirm equal pwd
    if (!this.isNew) {
      // Ensures that the JWT is created after the password has been changed
      this.passwordChangedDate = Date.now() - 1000;
    }
  }
  next();
});

// Prevents deleted/inactive users from being returned
userSchema.pre(/^find/, function (next) {
  this.where({ active: { $ne: false } });
  next();
});

// Methods:

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedDate) {
    const changedTimestamp = parseInt(
      this.passwordChangedDate.getTime() / 1000,
      10
    ); // JWT timestamp comes in seconds
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.passwordMatch = async function (pwd) {
  return await bcrypt.compare(pwd, this.password);
};

const User = model("User", userSchema);

module.exports = User;
