import { isValidUrl } from "./util";

describe('allows and disallows URLs properly', () => {
    test('http and https are valid', () => {
        expect(isValidUrl('abcd')).toBeFalsy();
        expect(isValidUrl('ws://github.com')).toBeFalsy();
        expect(isValidUrl('http://localhost')).toBeTruthy();
        expect(isValidUrl('https://127.0.0.1')).toBeTruthy();
        expect(isValidUrl('file:///etc/passwd')).toBeFalsy();
    });
});