import { captureNetwork } from "@kaytwo/puppeteer-har";
import { PuppeteerLifeCycleEvent } from "puppeteer";
import getBrowserInstance, { BrowserOptions } from "./browser";
import setupGuard, { GuardOpts, isBlockedAccessError } from "./guard";
import { ResourceUnreachableException } from "./guard/exception";

export interface CaptureOptions {
    // Timeout in ms
    timeout?: number;
    waitUntil?: PuppeteerLifeCycleEvent;
    browser?: BrowserOptions;
    request?: RequestOptions;
}

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

    if (captureOptions?.request?.headers) {
        const headers = captureOptions?.request.headers.reduce((headers, header) => {
            const pos = header.indexOf(':');
            return pos > 1 ?
                [...headers, [header.substring(0, pos), header.substring(pos)]] :
                headers;
        }, []);

        await page.setExtraHTTPHeaders(Object.fromEntries(headers));
    }

    let requestIsValid = true;
    if (guard) {
        if (typeof guard !== 'object') {
            guard = {};
        }

        setupGuard(page, guard, (status) => requestIsValid = status);
    }

    const getHar = await captureNetwork(page, {
        saveResponses: true
    });

    try {
        await page.goto(url, {
            waitUntil: captureOptions?.waitUntil || "networkidle2"
        });

        const result = await getHar() as object;
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
        await page.close();
        await browser.close();
    }
}