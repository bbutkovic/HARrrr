import PuppeteerHar from "puppeteer-har";
import getBrowserInstance, { BrowserOptions } from "./browser";
import setupGuard, { GuardOpts, isBlockedAccessError } from "./guard";
import { ResourceUnreachableException } from "./guard/exception";

export interface CaptureOptions {
    // Timeout in ms
    timeout?: number;
    browser?: BrowserOptions;
    request?: RequestOptions;
}

type Headers = {
    [key: string]: string | string[];
};
export interface RequestOptions {
    headers?: string[];
}

export default async function gotoAndCapture(url: string,
    captureOptions?: CaptureOptions,
    guard?: boolean | GuardOpts
): Promise<object> {
    const browser = await getBrowserInstance(captureOptions?.browser || {});
    const page = await browser.newPage();

    if (captureOptions?.timeout) {
        page.setDefaultTimeout(captureOptions?.timeout);
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
            throw new ResourceUnreachableException(url);
        }

        return result;
    } catch (e) {
        if (isBlockedAccessError(e)) {
            console.info(`Invalid request to ${url}`);
            throw new ResourceUnreachableException(url);
        }

        throw e;
    } finally {
        har.cleanUp();
        await page.close();
        await browser.close();
    }
}