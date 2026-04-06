import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenAdd } from "../../../src/commands/token/add";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token add", () => {
  test("adds a new profile", async () => {
    await executeTokenAdd(store, "my-org", "xoxb-123");
    const profiles = await store.listProfiles();
    expect(profiles).toContain("my-org");
  });

  test("sets first profile as default", async () => {
    await executeTokenAdd(store, "my-org", "xoxb-123");
    const config = await store.loadConfig();
    expect(config.default).toBe("my-org");
  });
});
