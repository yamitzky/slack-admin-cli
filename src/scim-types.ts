export interface ScimUser {
  id: string;
  userName: string;
  name: {
    givenName: string;
    familyName: string;
  };
  displayName?: string;
  emails: Array<{
    value: string;
    primary: boolean;
    type?: string;
  }>;
  active: boolean;
  title?: string;
  nickName?: string;
  timezone?: string;
  photos?: Array<{
    value: string;
    type?: string;
    primary?: boolean;
  }>;
  groups?: Array<{
    value: string;
    display?: string;
  }>;
}

export interface ScimGroup {
  id: string;
  displayName: string;
  members: Array<{
    value: string;
    display?: string;
  }>;
}

export interface ScimListResponse<T> {
  totalResults: number;
  itemsPerPage: number;
  startIndex: number;
  Resources: T[];
}

export interface ScimPatchOperation {
  op: "add" | "remove" | "replace";
  path?: string;
  value?: unknown;
}

export interface CreateScimUserParams {
  userName: string;
  email: string;
  givenName?: string;
  familyName?: string;
  displayName?: string;
}

export interface CreateScimGroupParams {
  displayName: string;
  memberIds?: string[];
}
