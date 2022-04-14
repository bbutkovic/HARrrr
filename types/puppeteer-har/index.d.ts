declare module 'puppeteer-har' {
    import { Page } from "puppeteer/lib/types";

    export default class PuppeteerHar {
        constructor(page: Page);

        cleanup(): void;

        start(startOptions?: StartOptions): Promise<void>;

        stop(): Promise<void|object>;
    }

    export interface StartOptions {
        path?: string;
        saveResponse?: boolean;
        captureMimeTypes?: boolean;
    }
}