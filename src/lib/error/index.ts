import { ApiError } from "./ApiError";

// 400: Bad Request
export class BadRequestError extends ApiError {
  constructor(message: string = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
  }
}

// 401: Unauthorized (Generic - e.g., missing token, invalid signature)
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Authentication required", code: string = "UN_AUTHORIZED") {
    super(message, 401, code);
  }
}

// 401: Token Expired (Specific - triggers refresh flow on client)
export class TokenExpiredError extends ApiError {
  constructor(message: string = "Access token expired") {
    super(message, 401, "TOKEN_EXPIRED");
  }
}

// 403: Forbidden
export class ForbiddenError extends ApiError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

// 404: Not Found
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

// 409: Conflict
export class ConflictError extends ApiError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT");
  }
}

// 422: Unprocessable Entity
export class UnprocessableEntityError extends ApiError {
  constructor(message: string = "Validation failed") {
    super(message, 422, "UNPROCESSABLE_ENTITY");
  }
}

// 429: Too Many Requests
export class TooManyRequestsError extends ApiError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

// 500: Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}