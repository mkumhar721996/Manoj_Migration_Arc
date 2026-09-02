import { test } from "node:test";
import assert from "node:assert/strict";
import { callWithTokenRefresh } from "../../src/http/withTokenRefresh.ts";
import { InMemorySessionManager } from "../../src/auth/session.ts";
import { AuthenticationError } from "../../src/http/errors.ts";

interface ApiResult {
  status: number;
  body: string;
}

function countingMock<Args extends unknown[], R>(
  impl: (...args: Args) => R
): { fn: (...args: Args) => R; calls: Args[] } {
  const calls: Args[] = [];
  const fn = (...args: Args): R => {
    calls.push(args);
    return impl(...args);
  };
  return { fn, calls };
}

test("AC1: refreshes the token exactly once and retries the original call after a 401", async () => {
  const responses: ApiResult[] = [
    { status: 401, body: "expired" },
    { status: 200, body: "ok" },
  ];
  const apiCall = countingMock(async (_token: string) => responses.shift()!);
  const refreshToken = countingMock(async () => "new-token");
  const sessionManager = new InMemorySessionManager("old-token", refreshToken.fn);

  const isAuthError = (r: ApiResult) => r.status === 401;

  await callWithTokenRefresh(sessionManager, apiCall.fn, isAuthError);

  assert.equal(refreshToken.calls.length, 1);
  assert.equal(apiCall.calls.length, 2);
  assert.equal(apiCall.calls[0][0], "old-token");
  assert.equal(apiCall.calls[1][0], "new-token");
});

test("AC2: returns the retried call's successful result to the caller, untouched", async () => {
  const secondResponse: ApiResult = { status: 200, body: "ok" };
  const responses: ApiResult[] = [{ status: 401, body: "expired" }, secondResponse];
  const apiCall = countingMock(async (_token: string) => responses.shift()!);
  const refreshToken = countingMock(async () => "new-token");
  const sessionManager = new InMemorySessionManager("old-token", refreshToken.fn);

  const isAuthError = (r: ApiResult) => r.status === 401;

  const result = await callWithTokenRefresh(sessionManager, apiCall.fn, isAuthError);

  assert.deepEqual(result, secondResponse);
});

test("AC3: throws AuthenticationError and does not retry when refresh fails", async () => {
  const apiCall = countingMock(async (_token: string) => ({ status: 401, body: "expired" }));
  const refreshToken = countingMock(async () => {
    throw new Error("refresh failed");
  });
  const sessionManager = new InMemorySessionManager("old-token", refreshToken.fn);

  const isAuthError = (r: ApiResult) => r.status === 401;

  await assert.rejects(
    () => callWithTokenRefresh(sessionManager, apiCall.fn, isAuthError),
    AuthenticationError
  );
  assert.equal(apiCall.calls.length, 1);
});

test("AC4: does not attempt a second refresh if the retried call also fails auth", async () => {
  const secondResponse: ApiResult = { status: 401, body: "still expired" };
  const apiCall = countingMock(async (_token: string) => {
    if (apiCall.calls.length === 0) {
      return { status: 401, body: "expired" };
    }
    return secondResponse;
  });
  const refreshToken = countingMock(async () => "new-token");
  const sessionManager = new InMemorySessionManager("old-token", refreshToken.fn);

  const isAuthError = (r: ApiResult) => r.status === 401;

  const result = await callWithTokenRefresh(sessionManager, apiCall.fn, isAuthError);

  assert.equal(refreshToken.calls.length, 1);
  assert.equal(apiCall.calls.length, 2);
  assert.deepEqual(result, secondResponse);
});
