import type { ProfileStore } from "./config";
import type {
  ScimUser,
  ScimGroup,
  ScimListResponse,
  ScimPatchOperation,
  CreateScimUserParams,
  CreateScimGroupParams,
} from "./scim-types";

const SCIM_BASE_URL = "https://api.slack.com/scim/v2";

export class ScimClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${SCIM_BASE_URL}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail =
        errorBody?.Errors?.description ?? errorBody?.detail ?? response.statusText;
      throw new Error(`SCIM API error (${response.status}): ${detail}`);
    }

    if (response.status === 204) {
      return undefined!;
    }

    return response.json();
  }

  users = {
    list: (params?: {
      startIndex?: number;
      count?: number;
      filter?: string;
    }): Promise<ScimListResponse<ScimUser>> => {
      const queryParams: Record<string, string> = {};
      if (params?.startIndex !== undefined) queryParams.startIndex = String(params.startIndex);
      if (params?.count !== undefined) queryParams.count = String(params.count);
      if (params?.filter !== undefined) queryParams.filter = params.filter;
      return this.request("GET", "/Users", undefined, queryParams);
    },

    get: (id: string): Promise<ScimUser> => {
      return this.request("GET", `/Users/${id}`);
    },

    create: (params: CreateScimUserParams): Promise<ScimUser> => {
      const body: Record<string, unknown> = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        userName: params.userName,
        emails: [{ value: params.email, primary: true }],
      };
      if (params.givenName !== undefined || params.familyName !== undefined) {
        body.name = {
          ...(params.givenName !== undefined ? { givenName: params.givenName } : {}),
          ...(params.familyName !== undefined ? { familyName: params.familyName } : {}),
        };
      }
      if (params.displayName !== undefined) body.displayName = params.displayName;
      return this.request("POST", "/Users", body);
    },

    update: (id: string, operations: ScimPatchOperation[]): Promise<ScimUser> => {
      return this.request("PATCH", `/Users/${id}`, {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        Operations: operations,
      });
    },

    deactivate: (id: string): Promise<void> => {
      return this.request("DELETE", `/Users/${id}`);
    },
  };

  groups = {
    list: (params?: {
      startIndex?: number;
      count?: number;
      filter?: string;
    }): Promise<ScimListResponse<ScimGroup>> => {
      const queryParams: Record<string, string> = {};
      if (params?.startIndex !== undefined) queryParams.startIndex = String(params.startIndex);
      if (params?.count !== undefined) queryParams.count = String(params.count);
      if (params?.filter !== undefined) queryParams.filter = params.filter;
      return this.request("GET", "/Groups", undefined, queryParams);
    },

    get: (id: string): Promise<ScimGroup> => {
      return this.request("GET", `/Groups/${id}`);
    },

    create: (params: CreateScimGroupParams): Promise<ScimGroup> => {
      const body: Record<string, unknown> = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
        displayName: params.displayName,
      };
      if (params.memberIds !== undefined) {
        body.members = params.memberIds.map((id) => ({ value: id }));
      }
      return this.request("POST", "/Groups", body);
    },

    update: (id: string, operations: ScimPatchOperation[]): Promise<ScimGroup> => {
      return this.request("PATCH", `/Groups/${id}`, {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        Operations: operations,
      });
    },

    delete: (id: string): Promise<void> => {
      return this.request("DELETE", `/Groups/${id}`);
    },
  };
}

export async function createScimClient(
  store: ProfileStore,
  profileName?: string,
): Promise<ScimClient> {
  const resolved = await store.resolveProfileName(profileName);
  const token = await store.getToken(resolved);
  return new ScimClient(token);
}
