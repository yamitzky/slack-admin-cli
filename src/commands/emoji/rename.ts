import type { WebClient } from "@slack/web-api";

interface EmojiRenameOptions {
  name: string;
  newName: string;
}

export async function executeEmojiRename(
  client: WebClient,
  opts: EmojiRenameOptions,
): Promise<void> {
  await client.admin.emoji.rename({ name: opts.name, new_name: opts.newName });
}
