const errorHandler = (err, req, res, next) => {

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Email already registered",
      errors: [
          "An account with this email already exists"
      ]
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack
    })
  });
};

export default errorHandler;