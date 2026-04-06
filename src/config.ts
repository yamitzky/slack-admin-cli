import { join } from "node:path";
import { mkdir } from "node:fs/promises";

interface Config {
  profiles: string[];
  default?: string;
}

export class ProfileStore {
  private configDir: string;
  private configPath: string;
  private useKeychain: boolean;

  constructor(configDir?: string, useKeychain = true) {
    this.configDir = configDir ?? join(
      process.env.XDG_CONFIG_HOME ?? join(process.env.HOME!, ".config"),
      "sladm",
    );
    this.configPath = join(this.configDir, "config.json");
    this.useKeychain = useKeychain;
  }

  async loadConfig(): Promise<Config> {
    try {
      const file = Bun.file(this.configPath);
      return await file.json() as Config;
    } catch {
      return { profiles: [] };
    }
  }

  private async saveConfig(config: Config): Promise<void> {
    await mkdir(this.configDir, { recursive: true });
    await Bun.write(this.configPath, JSON.stringify(config, null, 2));
  }

  async addProfile(name: string, token: string): Promise<void> {
    const config = await this.loadConfig();
    if (!config.profiles.includes(name)) {
      config.profiles.push(name);
    }
    if (config.profiles.length === 1) {
      config.default = name;
    }
    await this.saveConfig(config);

    if (this.useKeychain) {
      await Bun.secrets.set({ service: "sladm", name, value: token });
    } else {
      await Bun.write(join(this.configDir, `.token-${name}`), token);
    }
  }

  async removeProfile(name: string): Promise<void> {
    const config = await this.loadConfig();
    config.profiles = config.profiles.filter((p) => p !== name);
    if (config.default === name) {
      config.default = config.profiles[0];
    }
    await this.saveConfig(config);

    if (this.useKeychain) {
      await Bun.secrets.delete({ service: "sladm", name });
    } else {
      const { unlink } = await import("node:fs/promises");
      await unlink(join(this.configDir, `.token-${name}`)).catch(() => {});
    }
  }

  async listProfiles(): Promise<string[]> {
    const config = await this.loadConfig();
    return config.profiles;
  }

  async setDefault(name: string | undefined): Promise<void> {
    const config = await this.loadConfig();
    config.default = name;
    await this.saveConfig(config);
  }

  async resolveProfileName(explicit?: string): Promise<string> {
    if (explicit) return explicit;

    const envProfile = process.env.SLADM_PROFILE;
    if (envProfile) return envProfile;

    const config = await this.loadConfig();
    if (config.default) return config.default;
    if (config.profiles.length === 1) return config.profiles[0];

    throw new Error(
      "Multiple profiles configured. Specify --profile or set a default with: sladm token add --default <name>",
    );
  }

  async getToken(name: string): Promise<string> {
    if (this.useKeychain) {
      const token = await Bun.secrets.get({ service: "sladm", name });
      if (!token) throw new Error(`Token not found for profile: ${name}`);
      return token;
    }
    const file = Bun.file(join(this.configDir, `.token-${name}`));
    return await file.text();
  }
}
