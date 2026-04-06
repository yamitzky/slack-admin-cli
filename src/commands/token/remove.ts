import type { ProfileStore } from "../../config";

export async function executeTokenRemove(
  store: ProfileStore,
  name: string,
): Promise<void> {
  const profiles = await store.listProfiles();
  if (!profiles.includes(name)) {
    throw new Error(`Profile not found: ${name}`);
  }
  await store.removeProfile(name);
}
