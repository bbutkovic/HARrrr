import PuppeteerHar from "puppeteer-har";

import puppeteer from "puppeteer";

export default async function obtainHAR(url: string, timeoutInMs: number = 10 * 1000): Promise<object> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    if (timeoutInMs) {
        page.setDefaultTimeout(timeoutInMs);
    }

    const har = new PuppeteerHar(page);
    await har.start({
        saveResponse: true,
    });

    await page.goto(url);

    const harContent = await har.stop() as object;
    await browser.close();

    return harContent;
}