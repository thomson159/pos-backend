export class AppError extends Error {
  status: number;
  errors?: unknown[];

  constructor(status: number, message: string, errors?: unknown[]) {
    super(message);
    this.status = status;
    if (errors) this.errors = errors;
  }
}

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
