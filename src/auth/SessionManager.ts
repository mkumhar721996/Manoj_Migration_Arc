import type { SwiggyAuthClient } from "./SwiggyAuthClient.ts";
import type { SecureTokenStore } from "./SecureTokenStore.ts";
import { AuthenticationError } from "./AuthenticationError.ts";

export interface SignOutResult {
  serverRevoked: boolean;
}

export class SessionManager {
  private authClient: SwiggyAuthClient;
  private store: SecureTokenStore;

  constructor(authClient: SwiggyAuthClient, store: SecureTokenStore) {
    this.authClient = authClient;
    this.store = store;
  }

  async signIn(token: string): Promise<void> {
    await this.store.setToken(token);
  }

  async signOut(): Promise<SignOutResult> {
    const token = await this.store.getToken();
    let serverRevoked = true;
    try {
      if (token) {
        await this.authClient.logout(token);
      }
    } catch {
      serverRevoked = false;
    } finally {
      await this.store.deleteToken();
    }
    return { serverRevoked };
  }

  async getAuthorizedToken(): Promise<string> {
    const token = await this.store.getToken();
    if (!token) {
      throw new AuthenticationError();
    }
    return token;
  }
}
