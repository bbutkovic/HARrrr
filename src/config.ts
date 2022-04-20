import "dotenv/config";
import { HARServiceOptions } from "./har";

export interface Config {
    port: number;
    harServiceSettings: HARServiceOptions;
}

export default function getConfig(): Config {
    return {
        port: parseInt(process.env.PORT || "8080", 10),
        harServiceSettings: getHARServiceSettings(),
    };
}

function parseListFromEnv(envVar: string, defaultList: string[] = []): string[] {
    return process.env[envVar] !== undefined ?
        process.env[envVar]?.split(',').map((el) => el.trim()) as string[] :
        defaultList;
}

function getHARServiceSettings(): HARServiceOptions {
    const config: HARServiceOptions = {};

    if (process.env.ENABLE_GUARD !== "false") {
        config.guard = {
            blockDomains: parseListFromEnv('BLOCK_DOMAINS', ['localhost']),
            blockIps: parseListFromEnv('BLOCK_IPS'),
            blockPrivate: process.env.BLOCK_PRIVATE !== "false",
        };
    }

    if (process.env.TIMEOUT) {
        config.timeout = parseInt(process.env.TIMEOUT, 10);
    }

    return config;
}