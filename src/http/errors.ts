export class AuthenticationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "AuthenticationError";
  }
}
