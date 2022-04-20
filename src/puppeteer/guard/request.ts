import { Page } from "puppeteer";
import isHostAllowed, { getHost } from "./host";

type SignalFunc = (valid: boolean) => void;
export default function filterRequests(
    page: Page,
    blockDomains: string[],
    blockIps: string[],
    blockPrivate: boolean,
    signal?: SignalFunc
) {
    page.on('request', async (request) => {
        const hostname = getHost(request.url());
        const isAllowed = await isHostAllowed(hostname, blockDomains, blockIps, blockPrivate);
        if (!isAllowed) {
            console.info(`Tried to access blocked host: ${hostname}`);
            if (signal) {
                signal(false);
            }

            request.abort('blockedbyclient');
            return;
        }

        request.continue();
    });
}
