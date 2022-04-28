import gotoAndCapture from "./puppeteer";
import type { CaptureOptions } from "./puppeteer";
import { GuardOpts } from "./puppeteer/guard";
import { ResourceUnreachableException } from "./puppeteer/guard/exception";

export { CaptureOptions, ResourceUnreachableException };

export interface HARServiceOptions {
    // Default timeout in ms
    timeout?: number;
    guard?: GuardOpts;
}
export default class HARService {
    private options: HARServiceOptions;

    constructor(options?: HARServiceOptions) {
        this.options = options || {};
    }

    async captureWebpage(url: string, captureOptions?: CaptureOptions): Promise<object> {
        return gotoAndCapture(url, captureOptions, this.options.guard);
    }
}