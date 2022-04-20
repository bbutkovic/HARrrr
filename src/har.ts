import gotoAndCapture, { CaptureOptions } from "./puppeteer";
import { GuardOpts } from "./puppeteer/guard";

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
        try {
            const result = await gotoAndCapture(url, captureOptions, this.options.guard);

            return result;
        } catch (e) {
            console.log(`Unhandled exception: ${e}`);

            return {};
        }
    }
}