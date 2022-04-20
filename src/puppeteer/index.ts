import { HTTPResponse, Page } from "puppeteer";
import PuppeteerHar from "puppeteer-har";
import puppeteer from "puppeteer";
import getBrowserInstance, { BrowserOptions } from "./browser";
import setupGuard, { GuardOpts } from "./guard";

type GotoURLFunc = (url: string) => Promise<HTTPResponse>;
type FinishFunc = () => Promise<object>;
type CleanupFunc = () => Promise<void>;

type GotoAndCaptureFunc = (url: string) => Promise<object>;

export interface CaptureOptions {
    // Timeout in ms
    timeout?: number;
    browser?: BrowserOptions;
}

export default async function gotoAndCapture(url: string,
    options?: CaptureOptions,
    guard?: boolean | GuardOpts
): Promise<object> {
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
        await page.goto(url);

        const result = await har.stop() as object;
        if (!requestIsValid) {
            throw 'Invalid request.';
        }

        return result;
    } finally {
        har.cleanUp();
        await page.close();
        await browser.close();
    }
}