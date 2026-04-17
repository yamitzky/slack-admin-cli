import type { WebClient } from "@slack/web-api";

interface EmojiListOptions {
  cursor?: string;
  limit?: number;
}

export async function executeEmojiList(
  client: WebClient,
  opts: EmojiListOptions,
): Promise<{ name: string; url: string }[]> {
  const response = await client.admin.emoji.list({
    cursor: opts.cursor,
    limit: opts.limit,
  });
  const emoji = response.emoji ?? {};
  return Object.entries(emoji).map(([name, value]) => ({
    name,
    url: value.url ?? "",
  }));
}
