import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenList } from "../../../src/commands/token/list";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token list", () => {
  test("returns empty when no profiles", async () => {
    const result = await executeTokenList(store);
    expect(result).toEqual([]);
  });

  test("returns all profiles with default marker", async () => {
    await store.addProfile("org-a", "xoxb-a");
    await store.addProfile("org-b", "xoxb-b");
    const result = await executeTokenList(store);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "org-a", default: true });
    expect(result[1]).toEqual({ name: "org-b", default: false });
  });
});
