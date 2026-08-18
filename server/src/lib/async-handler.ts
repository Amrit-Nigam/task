import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 ignores rejected promises from handlers, which would hang the
 * request. This forwards them to the error middleware instead.
 */
export function asyncHandler(
  handler: (request: Request, response: Response) => Promise<unknown>,
): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).catch(next);
  };
}
