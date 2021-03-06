import { Page } from "puppeteer";
import filterRequests from "./request";
import filterResponses from "./response";

export interface GuardOpts {
    blockDomains?: string[];
    blockIps?: string[];
    blockPrivate?: boolean;
}

type StatusUpdateCallback = (isValid: boolean) => void;

export default function setupGuard(page: Page, {
    blockDomains = ['localhost'],
    blockIps = ['127.0.0.1'],
    blockPrivate = true,
}: GuardOpts,
    statusUpdateCallback?: StatusUpdateCallback
): void {
    page.setRequestInterception(true);

    filterRequests(page, blockDomains, blockIps, blockPrivate, statusUpdateCallback);

    if (statusUpdateCallback) {
        filterResponses(page, blockIps, blockPrivate, statusUpdateCallback);
    }
}

export function isBlockedAccessError(e: Error): boolean {
    return typeof e.message === 'string' && e.message.includes('net::ERR_BLOCKED_BY_CLIENT');
}