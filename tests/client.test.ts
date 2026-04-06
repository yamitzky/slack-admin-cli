import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSlackClient } from "../src/client";
import { ProfileStore } from "../src/config";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("createSlackClient", () => {
  test("creates WebClient with resolved token", async () => {
    await store.addProfile("test-org", "xoxb-test-token-123");
    const client = await createSlackClient(store, "test-org");
    expect(client).toBeDefined();
    expect(client.token).toBe("xoxb-test-token-123");
  });

  test("throws when profile has no token", async () => {
    expect(createSlackClient(store, "nonexistent")).rejects.toThrow();
  });
});
