export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string = "API_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}