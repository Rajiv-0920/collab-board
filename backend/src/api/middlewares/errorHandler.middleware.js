export const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log internally for developers

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};
