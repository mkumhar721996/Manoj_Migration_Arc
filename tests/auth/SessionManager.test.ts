import { test } from "node:test";
import assert from "node:assert/strict";
import { SessionManager } from "../../src/auth/SessionManager.ts";
import { InMemorySecureTokenStore } from "../../src/auth/SecureTokenStore.ts";
import type { SwiggyAuthClient } from "../../src/auth/SwiggyAuthClient.ts";
import { AuthenticationError } from "../../src/auth/AuthenticationError.ts";

function fakeAuthClient(logout: SwiggyAuthClient["logout"]): SwiggyAuthClient {
  return { logout };
}

// AC1
test("signOut calls the auth client's logout with the current session token", async () => {
  const calls: string[] = [];
  const authClient = fakeAuthClient(async (token) => {
    calls.push(token);
  });
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");

  await sessionManager.signOut();

  assert.deepEqual(calls, ["token-a"]);
});

// AC2
test("when logout succeeds, the local token is deleted and serverRevoked is true", async () => {
  const authClient = fakeAuthClient(async () => {});
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");

  const result = await sessionManager.signOut();

  assert.equal(await store.getToken(), null);
  assert.deepEqual(result, { serverRevoked: true });
});

// AC3
test("when logout fails, the local token is still deleted", async () => {
  const authClient = fakeAuthClient(async () => {
    throw new Error("network error");
  });
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");

  await sessionManager.signOut();

  assert.equal(await store.getToken(), null);
});

// AC4
test("when logout fails, the result reports server-side revocation as unconfirmed", async () => {
  const authClient = fakeAuthClient(async () => {
    throw new Error("network error");
  });
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");

  const result = await sessionManager.signOut();

  assert.deepEqual(result, { serverRevoked: false });
});

// AC5
test("getAuthorizedToken returns the stored token when one is present", async () => {
  const authClient = fakeAuthClient(async () => {});
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");

  assert.equal(await sessionManager.getAuthorizedToken(), "token-a");
});

test("after sign-out, getAuthorizedToken throws AuthenticationError", async () => {
  const authClient = fakeAuthClient(async () => {});
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");
  await sessionManager.signOut();

  await assert.rejects(
    sessionManager.getAuthorizedToken(),
    AuthenticationError
  );
});

// AC6
test("after sign-out, a new signIn is required before getAuthorizedToken succeeds again", async () => {
  const authClient = fakeAuthClient(async () => {});
  const store = new InMemorySecureTokenStore();
  const sessionManager = new SessionManager(authClient, store);
  await sessionManager.signIn("token-a");
  await sessionManager.signOut();

  await assert.rejects(
    sessionManager.getAuthorizedToken(),
    AuthenticationError
  );

  await sessionManager.signIn("token-b");

  assert.equal(await sessionManager.getAuthorizedToken(), "token-b");
});
