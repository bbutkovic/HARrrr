import { isPrivate, isV4Format, isV6Format } from "ip";

export function isIp(host: string): boolean {
    return isV4Format(host) || isV6Format(host);
}

export default function isIpAllowed(ip: string, blockIps: string[], blockPrivate: boolean): boolean {
    return (!blockPrivate && isPrivate(ip)) && !blockIps.includes(ip);
}