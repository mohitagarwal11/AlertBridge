export class ApiError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred";

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Malformed JSON payload";
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
