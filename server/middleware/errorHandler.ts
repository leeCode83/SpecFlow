import { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/ApiError";

/**
 * Global error handler middleware.
 * Formats errors consistently for the client.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  }

  res.locals.errorMessage = err.message;

  const response = {
    error: true,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).send(response);
};
