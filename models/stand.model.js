const { Schema, model } = require("mongoose");
const slugify = require("slugify");
const validator = require("../validators");

const menuItemSchema = new Schema({
  name: {
    type: String,
    required: [true, "A menu item must have a name"],
  },
  price: {
    type: Number,
    required: [true, "A menu item must have a price"],
    min: [0, "A menu item must have a price greater than or equal to $0.00"],
  },
  ratingsAverage: {
    type: Number,
    default: 5.0,
    min: [1.0, "A menu item must have a rating greater than or equal to 1.0"],
    max: [5.0, "A menu item must have a rating less than or equal to 5.0"],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: "taco-placeholder.png",
  },
});

const hoursOfOpSchema = new Schema(
  {
    openTime: {
      type: String,
      required: [true, "Must provide stand's opening time"],
      trim: true,
      validate: [
        validator.stand.validTime,
        "Open time must be formatted as (hh:mm am) or (hh:mm pm)",
      ],
    },
    closeTime: {
      type: String,
      required: [true, "Must provide stand's closing time"],
      trim: true,
      validate: [
        validator.stand.validTime,
        "Open time must be formatted as (hh:mm am) or (hh:mm pm)",
      ],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const standSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A stand must have a name"],
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "stand-avatar-default.png",
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
    },
    hoursOfOp: {
      monday: hoursOfOpSchema,
      tuesday: hoursOfOpSchema,
      wednesday: hoursOfOpSchema,
      thursday: hoursOfOpSchema,
      friday: hoursOfOpSchema,
      saturday: hoursOfOpSchema,
      sunday: hoursOfOpSchema,
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 5.0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "A stand must have an owner"],
    },
    menu: [menuItemSchema],
    description: {
      type: String,
    },
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

// Create an index for stand names
standSchema.index({ name: 1 }, { unique: true });

standSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "stand",
});

// Creates slug for stand name
standSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Prevents deleted/inactive stands from being returned
standSchema.pre(/^find/, function (next) {
  this.where({ active: { $ne: false } });
  next();
});

const Stand = model("Stand", standSchema);

module.exports = Stand;
