export interface SwiggyAuthClient {
  logout(token: string): Promise<void>;
}

type FetchFn = typeof fetch;

export class HttpSwiggyAuthClient implements SwiggyAuthClient {
  private baseUrl: string;
  private fetchFn: FetchFn;

  constructor(baseUrl: string, fetchFn: FetchFn = fetch) {
    this.baseUrl = baseUrl;
    this.fetchFn = fetchFn;
  }

  async logout(token: string): Promise<void> {
    const res = await this.fetchFn(`${this.baseUrl}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Swiggy logout failed with status ${res.status}`);
    }
  }
}
