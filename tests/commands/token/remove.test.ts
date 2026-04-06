import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenRemove } from "../../../src/commands/token/remove";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token remove", () => {
  test("removes an existing profile", async () => {
    await store.addProfile("my-org", "xoxb-123");
    await executeTokenRemove(store, "my-org");
    const profiles = await store.listProfiles();
    expect(profiles).not.toContain("my-org");
  });

  test("throws when profile does not exist", async () => {
    expect(executeTokenRemove(store, "nonexistent")).rejects.toThrow();
  });
});
