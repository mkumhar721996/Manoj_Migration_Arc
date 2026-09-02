export class AuthenticationError extends Error {
  constructor(message = "Session has been signed out. Please log in again.") {
    super(message);
    this.name = "AuthenticationError";
  }
}
