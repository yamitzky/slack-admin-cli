import type { WebClient } from "@slack/web-api";

interface EmojiAddAliasOptions {
  name: string;
  aliasFor: string;
}

export async function executeEmojiAddAlias(
  client: WebClient,
  opts: EmojiAddAliasOptions,
): Promise<void> {
  await client.admin.emoji.addAlias({ name: opts.name, alias_for: opts.aliasFor });
}
