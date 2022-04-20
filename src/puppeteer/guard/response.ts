import { Page } from "puppeteer";
import isIpAllowed from "./ip";

type SignalFunc = (valid: boolean) => void;
export default function filterResponses(
    page: Page,
    blockIps: string[],
    blockPrivate: boolean,
    signal: SignalFunc
): void {
    page.on('response', (response) => {
        const requestedIp = response.remoteAddress().ip;

        if (!isIpAllowed(requestedIp, blockIps, blockPrivate)) {
            signal(false);
        }
    });
}