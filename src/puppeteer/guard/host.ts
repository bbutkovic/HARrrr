import isIpAllowed, { isIp } from "./ip";
import { promises } from "dns";
const resolve = promises.resolve;


export default async function isHostAllowed(
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

export function getHost(url: string): string {
    return (new URL(url)).hostname;
}

export function isDomainAllowed(domain: string, blockDomains: string[]): boolean {
    return !blockDomains.includes(domain.toLowerCase());
}
