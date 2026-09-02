export interface SessionManager {
  getToken(): string;
  refreshToken(): Promise<string>;
}

export class InMemorySessionManager implements SessionManager {
  private token: string;
  private readonly refresh: () => Promise<string>;

  constructor(token: string, refresh: () => Promise<string>) {
    this.token = token;
    this.refresh = refresh;
  }

  getToken(): string {
    return this.token;
  }

  async refreshToken(): Promise<string> {
    this.token = await this.refresh();
    return this.token;
  }
}
