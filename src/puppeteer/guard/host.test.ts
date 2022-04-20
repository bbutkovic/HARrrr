import { getHost } from "./host";

describe('returns the proper hostname of URL', () => {
    test('getHost returns proper hostname', () => {
        expect(getHost('https://google.com')).toBe('google.com');
        expect(getHost('ws://github.com')).toBe('github.com');
    });
});