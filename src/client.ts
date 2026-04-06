import { WebClient } from "@slack/web-api";
import type { ProfileStore } from "./config";

export async function createSlackClient(
  store: ProfileStore,
  profileName?: string,
): Promise<WebClient> {
  const resolved = await store.resolveProfileName(profileName);
  const token = await store.getToken(resolved);
  return new WebClient(token);
}
