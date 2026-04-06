import type { ProfileStore } from "../../config";

export async function executeTokenAdd(
  store: ProfileStore,
  name: string,
  token: string,
): Promise<void> {
  await store.addProfile(name, token);
}
