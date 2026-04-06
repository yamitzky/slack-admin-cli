import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

describe("ProfileStore", () => {
  test("addProfile saves profile and sets as default if first", async () => {
    await store.addProfile("my-org", "xoxb-test-token");
    const config = await store.loadConfig();
    expect(config.profiles).toContain("my-org");
    expect(config.default).toBe("my-org");
  });

  test("addProfile does not change default if already set", async () => {
    await store.addProfile("first", "xoxb-1");
    await store.addProfile("second", "xoxb-2");
    const config = await store.loadConfig();
    expect(config.default).toBe("first");
  });

  test("removeProfile removes from list", async () => {
    await store.addProfile("my-org", "xoxb-test");
    await store.removeProfile("my-org");
    const config = await store.loadConfig();
    expect(config.profiles).not.toContain("my-org");
  });

  test("removeProfile clears default if removed", async () => {
    await store.addProfile("my-org", "xoxb-test");
    await store.removeProfile("my-org");
    const config = await store.loadConfig();
    expect(config.default).toBeUndefined();
  });

  test("listProfiles returns all profiles", async () => {
    await store.addProfile("org-a", "xoxb-a");
    await store.addProfile("org-b", "xoxb-b");
    const profiles = await store.listProfiles();
    expect(profiles).toEqual(["org-a", "org-b"]);
  });

  test("resolveProfile returns explicit profile", async () => {
    await store.addProfile("org-a", "xoxb-a");
    const name = await store.resolveProfileName("org-a");
    expect(name).toBe("org-a");
  });

  test("resolveProfile returns default when not specified", async () => {
    await store.addProfile("org-a", "xoxb-a");
    const name = await store.resolveProfileName(undefined);
    expect(name).toBe("org-a");
  });

  test("resolveProfile returns sole profile when no default", async () => {
    await store.addProfile("only-one", "xoxb-1");
    const name = await store.resolveProfileName(undefined);
    expect(name).toBe("only-one");
  });

  test("resolveProfile throws when ambiguous", async () => {
    await store.addProfile("org-a", "xoxb-a");
    await store.addProfile("org-b", "xoxb-b");
    await store.setDefault(undefined);
    expect(store.resolveProfileName(undefined)).rejects.toThrow();
  });

  test("getToken retrieves stored token", async () => {
    await store.addProfile("my-org", "xoxb-secret");
    const token = await store.getToken("my-org");
    expect(token).toBe("xoxb-secret");
  });
});
