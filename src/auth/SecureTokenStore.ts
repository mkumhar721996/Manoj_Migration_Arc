export interface SecureTokenStore {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  deleteToken(): Promise<void>;
}

export class InMemorySecureTokenStore implements SecureTokenStore {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async deleteToken(): Promise<void> {
    this.token = null;
  }
}
