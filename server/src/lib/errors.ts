/** An error carrying the status code and machine-readable code sent to the client. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static notFound(message: string) {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static badRequest(message: string) {
    return new ApiError(400, "BAD_REQUEST", message);
  }

  static upstream(message: string) {
    return new ApiError(502, "UPSTREAM_ERROR", message);
  }
}
