const ErrorHandler = require('../utils/errorHandler')

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || "Internal Server Error"

  // castError - for example, invalid _id format
  if (err.name=== 'CastError') {
    const message = `Resource not Found. Invalid: ${err.path}`
    err = new ErrorHandler(message, 400)
  }

  // Mongoose Duplicate value error
  if(err.code === 11000) {
    const message = `Dupliacte ${Object.keys(err.keyValue)} entered`
    err = new ErrorHandler(message, 400)
  }

  // Wrong JWT Token error
  if(err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid. Please try again."
    err = new ErrorHandler(message, 400)
  }

  // Wrong JWT Token expire error
  if(err.name === "TokenExpiredError") {
    const message = "JSON Web Token is expired. Please try again."
    err = new ErrorHandler(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // stackTrace: err.stack
  })
}