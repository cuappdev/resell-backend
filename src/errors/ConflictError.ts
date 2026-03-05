import { HttpError } from "routing-controllers";

export class ConflictError extends HttpError {
  public operationName: string;

  constructor(message?: string) {
    super(409, message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
