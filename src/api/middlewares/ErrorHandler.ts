import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';

import { ErrorResponse } from '../../types';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: Error, request: express.Request, response: express.Response, next: (err?: any) => any): void {
    handleError(error, request, response, next);
  }
}

function handleError(error: Error,
  request: express.Request,
  response: express.Response,
  next: express.NextFunction) {
  const { message } = error;
  const httpCode = error instanceof HttpError ? error.httpCode : 500;
  const errorResponse: ErrorResponse = {
    error: message,
    httpCode: httpCode,
  };
  console.log(message);
  response.status(httpCode).json(errorResponse);
  next();
}