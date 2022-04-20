import PuppeteerHar from "puppeteer-har";
import getBrowserInstance, { BrowserOptions } from "./browser";
import setupGuard, { GuardOpts, isBlockedAccessError } from "./guard";

export interface CaptureOptions {
    // Timeout in ms
    timeout?: number;
    browser?: BrowserOptions;
}

export default async function gotoAndCapture(url: string,
    options?: CaptureOptions,
    guard?: boolean | GuardOpts
): Promise<object | null> {
    const browser = await getBrowserInstance(options?.browser || {});
    const page = await browser.newPage();

    if (options?.timeout) {
        page.setDefaultTimeout(options?.timeout);
    }

    let requestIsValid = true;
    if (guard) {
        if (typeof guard !== 'object') {
            guard = {};
        }

        setupGuard(page, guard, (status) => requestIsValid = status);
    }

    const har = new PuppeteerHar(page);
    await har.start({
        saveResponse: true,
    });

    try {
        await page.goto(url, {
            waitUntil: "domcontentloaded"
        });

        const result = await har.stop() as object;
        if (!requestIsValid) {
            console.info(`Invalid request to ${url}`);
            return null;
        }

        return result;
    } catch (e) {
        if (isBlockedAccessError(e)) {
            console.info(`Invalid request to ${url}`);
            return null;
        }

        throw e;
    } finally {
        har.cleanUp();
        await page.close();
        await browser.close();
    }
}