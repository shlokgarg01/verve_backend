const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [40, "Name cannot exceed 40 characters"],
    },
    email: {
      type: String,
      required: false,
      default: "dummyemail@parchunking.com",
      unique: true
    },
    contactNumber: {
      type: String,
      required: [true, "Please enter your Contact Number."],
      unique: true,
      validate: {
        validator: function (number) {
          var regex = /^[1-9][0-9]{9}$/g;
          return !number || !number.trim().length || regex.test(number);
        },
        message: "Provided Contact Number is invalid.",
      },
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    password: {
      type: String,
      minLength: [6, "Password should be greater than 6 characters"],
      select: false,
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // we don't want to re-encrypt password while updating user.
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// JWT Token creation
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password while Logging in
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
