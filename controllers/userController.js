const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, contactNumber } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    contactNumber,
  });
  sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { contactNumber, password } = req.body;
  if (!contactNumber || !password) {
    return next(
      new ErrorHandler("Please enter Contact Number & Password", 400)
    );
  }

  const user = await User.findOne({ contactNumber }).select("+password"); // select password is needed bcz we have specified select: false on password in the model
  if (!user) {
    return next(new ErrorHandler("No user with this Contact Number.", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Contact Number or Password", 401));
  }
  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

// Update User Score
exports.updateScore = catchAsyncErrors(async (req, res, next) => {
  const { score } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { score: score || 0 }
  );

  res.status(200).json({
    success: true,
    message: "Score updated!",
  });
});

// get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});
