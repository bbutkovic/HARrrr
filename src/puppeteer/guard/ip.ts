import { IPv4, IPv6, isValid, parse, parseCIDR } from "ipaddr.js";

export function isIp(host: string): boolean {
    return isValid(host);
}

export default function isIpAllowed(ip: string, blockIps: string[], blockPrivate: boolean): boolean {
    const parsedIp = parse(ip);
    return !(blockPrivate && isPrivate(parsedIp)) && !blockIps.some((blockedIp) => {
        return blockedIp.includes('/') ?
            parsedIp.match(parseCIDR(blockedIp)) :
            parse(blockedIp).toNormalizedString() === parsedIp.toNormalizedString();
    });
}

export function isPrivate(ip: string | IPv4 | IPv6): boolean {
    if (typeof ip === 'string') {
        ip = parse(ip);
    }

    if (ip.kind() === "ipv6" && (ip as IPv6).isIPv4MappedAddress()) {
        ip = (ip as IPv6).toIPv4Address();
    }

    const range = ip.range();
    return range === "private" || range === "linkLocal" || range === "loopback" || range === "uniqueLocal";
}