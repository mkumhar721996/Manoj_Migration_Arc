import { test } from "node:test";
import assert from "node:assert/strict";
import { HttpSwiggyAuthClient } from "../../src/auth/SwiggyAuthClient.ts";

function fakeResponse(ok: boolean, status: number): Response {
  return { ok, status } as Response;
}

test("logout() POSTs to <baseUrl>/logout with a bearer token", async () => {
  const calls: [string, RequestInit | undefined][] = [];
  const fetchFn = (async (
    url: string,
    init?: RequestInit
  ): Promise<Response> => {
    calls.push([url, init]);
    return fakeResponse(true, 200);
  }) as typeof fetch;

  const client = new HttpSwiggyAuthClient(
    "https://api.swiggy.com/auth",
    fetchFn
  );

  await client.logout("token-a");

  assert.equal(calls.length, 1);
  const [url, init] = calls[0];
  assert.equal(url, "https://api.swiggy.com/auth/logout");
  assert.equal(init?.method, "POST");
  assert.equal(
    (init?.headers as Record<string, string>).Authorization,
    "Bearer token-a"
  );
});

test("logout() rejects when the response is not ok", async () => {
  const fetchFn = (async () => fakeResponse(false, 401)) as typeof fetch;
  const client = new HttpSwiggyAuthClient("https://api.swiggy.com/auth", fetchFn);

  await assert.rejects(client.logout("token-a"));
});

test("logout() propagates a network error from fetchFn", async () => {
  const fetchFn = (async () => {
    throw new Error("network error");
  }) as typeof fetch;
  const client = new HttpSwiggyAuthClient("https://api.swiggy.com/auth", fetchFn);

  await assert.rejects(client.logout("token-a"), /network error/);
});
