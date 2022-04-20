import { Page } from "puppeteer";
import { promises } from "dns";
import isIpAllowed, { isIp } from "./ip";
const resolve = promises.resolve;

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
        if (!isHostAllowed(hostname, blockDomains, blockIps, blockPrivate)) {
            if (signal) {
                signal(false);
            }

            request.abort();
            return;
        }

        request.continue();
    });
}

function getHost(url: string): string {
    return (new URL(url)).hostname;
}

async function isHostAllowed(
    host: string,
    blockDomains: string[],
    blockIps: string[],
    blockPrivate: boolean
): Promise<boolean> {
    if (isIp(host)) {
        return isIpAllowed(host, blockIps, blockPrivate);
    }

    if (!isDomainAllowed(host, blockDomains)) {
        return false;
    }

    try {
        const resolvedIps = await resolve(host);

        return resolvedIps.every((resolvedIp) => isIpAllowed(resolvedIp, blockIps, blockPrivate));
    } catch (e) {
        console.error(`Unexpected error when resolving IP: ${e}`);
        return false;
    }
}

function isDomainAllowed(domain: string, blockDomains: string[]): boolean {
    return !blockDomains.includes(domain.toLowerCase());
}
