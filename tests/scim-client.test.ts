import { describe, expect, test, mock, afterEach } from "bun:test";
import { ScimClient } from "../src/scim-client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchResponse(body: unknown, status = 200) {
  const mockFn = mock(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: "OK",
      json: () => Promise.resolve(body),
    }),
  );
  globalThis.fetch = mockFn as any;
  return mockFn;
}

function mockFetchNoContent() {
  const mockFn = mock(() =>
    Promise.resolve({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: () => Promise.reject(new Error("No content")),
    }),
  );
  globalThis.fetch = mockFn as any;
  return mockFn;
}

describe("ScimClient", () => {
  describe("users.list", () => {
    test("sends GET /Users with auth header", async () => {
      const mockFn = mockFetchResponse({ totalResults: 0, itemsPerPage: 100, startIndex: 1, Resources: [] });
      const client = new ScimClient("xoxp-test");

      await client.users.list();

      expect(mockFn).toHaveBeenCalledTimes(1);
      const [url, options] = mockFn.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
      expect(url).toBe("https://api.slack.com/scim/v2/Users");
      expect(options.method).toBe("GET");
      expect(options.headers.Authorization).toBe("Bearer xoxp-test");
    });

    test("includes query params when provided", async () => {
      mockFetchResponse({ totalResults: 0, itemsPerPage: 10, startIndex: 5, Resources: [] });
      const client = new ScimClient("xoxp-test");

      await client.users.list({ startIndex: 5, count: 10, filter: "userName eq \"alice\"" });

      const [url] = (globalThis.fetch as any).mock.calls[0] as [string];
      const parsed = new URL(url);
      expect(parsed.searchParams.get("startIndex")).toBe("5");
      expect(parsed.searchParams.get("count")).toBe("10");
      expect(parsed.searchParams.get("filter")).toBe("userName eq \"alice\"");
    });
  });

  describe("users.get", () => {
    test("sends GET /Users/{id}", async () => {
      const user = { id: "U001", userName: "alice", active: true, emails: [], name: { givenName: "Alice", familyName: "Smith" } };
      const mockFn = mockFetchResponse(user);
      const client = new ScimClient("xoxp-test");

      const result = await client.users.get("U001");

      expect(result.id).toBe("U001");
      const [url] = mockFn.mock.calls[0] as [string];
      expect(url).toBe("https://api.slack.com/scim/v2/Users/U001");
    });
  });

  describe("users.create", () => {
    test("sends POST /Users with user data", async () => {
      const created = { id: "U999", userName: "newuser", active: true, emails: [{ value: "new@ex.com", primary: true }], name: { givenName: "", familyName: "" } };
      const mockFn = mockFetchResponse(created);
      const client = new ScimClient("xoxp-test");

      const result = await client.users.create({ userName: "newuser", email: "new@ex.com", givenName: "New", familyName: "User" });

      expect(result.id).toBe("U999");
      const [url, options] = mockFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.slack.com/scim/v2/Users");
      expect(options.method).toBe("POST");
      const body = JSON.parse(options.body as string);
      expect(body.userName).toBe("newuser");
      expect(body.emails).toEqual([{ value: "new@ex.com", primary: true }]);
      expect(body.name).toEqual({ givenName: "New", familyName: "User" });
    });
  });

  describe("users.update", () => {
    test("sends PATCH /Users/{id} with operations", async () => {
      const updated = { id: "U001", userName: "alice", active: false, emails: [], name: { givenName: "Alice", familyName: "Smith" } };
      const mockFn = mockFetchResponse(updated);
      const client = new ScimClient("xoxp-test");

      await client.users.update("U001", [{ op: "replace", path: "active", value: false }]);

      const [url, options] = mockFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.slack.com/scim/v2/Users/U001");
      expect(options.method).toBe("PATCH");
      const body = JSON.parse(options.body as string);
      expect(body.schemas).toEqual(["urn:ietf:params:scim:api:messages:2.0:PatchOp"]);
      expect(body.Operations).toEqual([{ op: "replace", path: "active", value: false }]);
    });
  });

  describe("users.deactivate", () => {
    test("sends DELETE /Users/{id}", async () => {
      const mockFn = mockFetchNoContent();
      const client = new ScimClient("xoxp-test");

      await client.users.deactivate("U001");

      const [url, options] = mockFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.slack.com/scim/v2/Users/U001");
      expect(options.method).toBe("DELETE");
    });
  });

  describe("groups.list", () => {
    test("sends GET /Groups with auth header", async () => {
      const mockFn = mockFetchResponse({ totalResults: 0, itemsPerPage: 100, startIndex: 1, Resources: [] });
      const client = new ScimClient("xoxp-test");

      await client.groups.list();

      const [url, options] = mockFn.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
      expect(url).toBe("https://api.slack.com/scim/v2/Groups");
      expect(options.method).toBe("GET");
    });
  });

  describe("groups.create", () => {
    test("sends POST /Groups with group data", async () => {
      const created = { id: "G001", displayName: "Engineering", members: [{ value: "U001" }] };
      const mockFn = mockFetchResponse(created);
      const client = new ScimClient("xoxp-test");

      const result = await client.groups.create({ displayName: "Engineering", memberIds: ["U001"] });

      expect(result.id).toBe("G001");
      const [, options] = mockFn.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);
      expect(body.displayName).toBe("Engineering");
      expect(body.members).toEqual([{ value: "U001" }]);
    });
  });

  describe("groups.delete", () => {
    test("sends DELETE /Groups/{id}", async () => {
      const mockFn = mockFetchNoContent();
      const client = new ScimClient("xoxp-test");

      await client.groups.delete("G001");

      const [url, options] = mockFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://api.slack.com/scim/v2/Groups/G001");
      expect(options.method).toBe("DELETE");
    });
  });

  describe("error handling", () => {
    test("throws on non-ok response with SCIM error detail", async () => {
      mockFetchResponse({ Errors: { description: "User not found", code: 404 } }, 404);
      const client = new ScimClient("xoxp-test");

      await expect(client.users.get("U999")).rejects.toThrow("SCIM API error (404)");
    });
  });
});
