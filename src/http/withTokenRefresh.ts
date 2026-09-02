import type { SessionManager } from "../auth/session.ts";
import { AuthenticationError } from "./errors.ts";

export async function callWithTokenRefresh<T>(
  sessionManager: SessionManager,
  apiCall: (token: string) => Promise<T>,
  isAuthError: (result: T) => boolean
): Promise<T> {
  const result = await apiCall(sessionManager.getToken());

  if (!isAuthError(result)) {
    return result;
  }

  let newToken: string;
  try {
    newToken = await sessionManager.refreshToken();
  } catch (cause) {
    throw new AuthenticationError("Session token refresh failed", cause);
  }

  return apiCall(newToken);
}
