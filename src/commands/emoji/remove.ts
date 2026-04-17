import type { WebClient } from "@slack/web-api";

interface EmojiRemoveOptions {
  name: string;
}

export async function executeEmojiRemove(
  client: WebClient,
  opts: EmojiRemoveOptions,
): Promise<void> {
  await client.admin.emoji.remove({ name: opts.name });
}
