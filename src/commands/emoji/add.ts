import type { WebClient } from "@slack/web-api";

interface EmojiAddOptions {
  name: string;
  url: string;
}

export async function executeEmojiAdd(
  client: WebClient,
  opts: EmojiAddOptions,
): Promise<void> {
  await client.admin.emoji.add({ name: opts.name, url: opts.url });
}
