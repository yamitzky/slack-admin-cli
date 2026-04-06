import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenStatus } from "../../../src/commands/token/status";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token status", () => {
  test("returns profile info with token masked", async () => {
    await store.addProfile("my-org", "xoxb-1234567890-abcdef");
    const result = await executeTokenStatus(store, "my-org");
    expect(result.name).toBe("my-org");
    expect(result.token).toMatch(/^xoxb\.\.\..+/);
    expect(result.token).not.toBe("xoxb-1234567890-abcdef");
  });
});
