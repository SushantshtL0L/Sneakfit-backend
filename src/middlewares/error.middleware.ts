import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isTest = process.env.NODE_ENV === "test";
  let statusCode = err instanceof HttpError ? err.statusCode : 500;

  // Handle Mongoose validation and cast errors as 400
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 400;
  }

  // Handle duplicate key errors (code 11000)
  if ((err as any).code === 11000) {
    statusCode = 409;
  }

  // Don't log expected 4xx errors during testing
  if (!isTest || statusCode >= 500) {
    console.error(`[Error] ${err.message}`);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Mongoose error responses
  if (statusCode === 400 || statusCode === 409) {
    return res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Handle generic errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
