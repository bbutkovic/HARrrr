import { Browser, default as puppeteer } from "puppeteer";

type Args = { [key: string]: string };
export interface BrowserOptions {
    browserWSEndpoint?: string;
    timeout?: number;
    args?: Args;
};

export default async function getBrowserInstance(options: BrowserOptions): Promise<Browser> {
    if (options?.browserWSEndpoint) {
        return getConnectedBrowser(options);
    }

    return getLaunchedBrowser(options);
}

async function getConnectedBrowser(options: BrowserOptions): Promise<Browser> {
    const wsUrl = new URL(options.browserWSEndpoint || '');
    for (const arg in options.args) {
        wsUrl.searchParams.set(`--${arg}`, options.args[arg]);
    }

    return puppeteer.connect({
        browserWSEndpoint: wsUrl.toString(),
    });
}

async function getLaunchedBrowser(options: BrowserOptions): Promise<Browser> {
    const args = Object.entries(options.args || {})
        .map(([key, value]) => `--${key}=${value}`);

    return puppeteer.launch({
        args,
        timeout: options.timeout
    });
}