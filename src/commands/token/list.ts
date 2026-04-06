import type { ProfileStore } from "../../config";

export interface ProfileEntry {
  name: string;
  default: boolean;
}

export async function executeTokenList(
  store: ProfileStore,
): Promise<ProfileEntry[]> {
  const config = await store.loadConfig();
  return config.profiles.map((name) => ({
    name,
    default: name === config.default,
  }));
}
