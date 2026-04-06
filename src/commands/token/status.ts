import type { ProfileStore } from "../../config";

export interface TokenStatus {
  name: string;
  token: string;
  isDefault: boolean;
}

function maskToken(token: string): string {
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}...${suffix}`;
}

export async function executeTokenStatus(
  store: ProfileStore,
  profileName: string,
): Promise<TokenStatus> {
  const config = await store.loadConfig();
  const token = await store.getToken(profileName);
  return {
    name: profileName,
    token: maskToken(token),
    isDefault: config.default === profileName,
  };
}
