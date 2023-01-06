import { captureNetwork } from "@kaytwo/puppeteer-har";
import { Page, PuppeteerLifeCycleEvent, WaitForOptions } from "puppeteer";
import getBrowserInstance, { BrowserOptions } from "./browser";
import setupGuard, { GuardOpts, isBlockedAccessError } from "./guard";
import { ResourceUnreachableException } from "./guard/exception";

export interface CaptureOptions {
    // Timeout in ms
    timeout?: number;
    waitUntil?: LifeCycleEvent;
    waitForSelector?: Selector;
    waitForDuration?: Duration;
    browser?: BrowserOptions;
    request?: RequestOptions;
}

export type LifeCycleEvent = PuppeteerLifeCycleEvent;
export type Selector = string | {
    selector: string;
    visible?: boolean;
    hidden?: boolean;
};
export type Duration = number; // ms

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
        const headers = prepareHeaders(captureOptions.request.headers);

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
        await navigateAndWait(
            page,
            url,
            captureOptions?.waitUntil,
            captureOptions?.waitForSelector,
            captureOptions?.waitForDuration
        );

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

async function navigateAndWait(
    page: Page,
    url: string,
    event?: LifeCycleEvent,
    selector?: Selector,
    duration?: Duration
): Promise<void> {
    const navigationOptions: WaitForOptions = {};
    if (event) {
        navigationOptions.waitUntil = event;
    }

    await page.goto(url, navigationOptions);

    if (selector) {
        await waitForSelector(page, selector);
    }

    if (duration) {
        await waitForDuration(duration);
    }
}

async function waitForSelector(page: Page, selector: Selector): Promise<void> {
    typeof selector === 'string' ?
        await page.waitForSelector(selector) :
        await page.waitForSelector(selector.selector, {
            visible: selector.visible,
            hidden: selector.hidden,
        });
}

async function waitForDuration(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

function prepareHeaders(headers: string[]): [string, string][] {
    return headers.reduce((headers, header) => {
        const pos = header.indexOf(':');
        return pos > 1 ?
            [...headers, [
                header.substring(0, pos).trim(),
                header.substring(pos + 1).trim()
            ]] :
            headers;
    }, []);
}