import { isIp, default as isIpAllowed, isPrivate } from "./ip";

describe('is IP', () => {
    test('properly distinguish domains from IP addresses', () => {
        expect(isIp('google.com')).not.toBeTruthy();
        expect(isIp('localhost')).not.toBeTruthy();
        expect(isIp('127.0.ip.com')).not.toBeTruthy();

        expect(isIp('127.0.0.1')).toBeTruthy();
        expect(isIp('192.168.0.1')).toBeTruthy();
        expect(isIp('0.0.0.0')).toBeTruthy();
        expect(isIp('0000:0000:0000:0000:0000:0000:0000:0001')).toBeTruthy();
        expect(isIp('::1')).toBeTruthy();
    });
});

describe('is IP allowed', () => {
    test('allow and disallow IP addresses based on them being private or public', () => {
        expect(isIpAllowed('127.0.0.1', [], false)).toBeTruthy();

        expect(isIpAllowed('127.0.0.1', [], true)).toBeFalsy();
        expect(isIpAllowed('169.254.169.254', [], true)).toBeFalsy();
        expect(isIpAllowed('::1', [], true)).toBeFalsy();

        expect(isIpAllowed('0000:0000:0000:0000:0000:0000:0000:0001', [], true)).toBeFalsy();
        expect(isIpAllowed('::0:1', [], true)).toBeFalsy();
    });

    test('allow or disallow IPs from a list', () => {
        expect(isIpAllowed('127.0.0.5', ['127.0.0.1'], false)).toBeTruthy();
        expect(isIpAllowed('127.0.0.1', ['127.0.0.1'], false)).toBeFalsy();
        expect(isIpAllowed('192.168.1.1', ['127.0.0.1'], false)).toBeTruthy();
        expect(isIpAllowed('::1', ['::1'], false)).toBeFalsy();
    });

    test('block a range of IP addresses', () => {
        expect(isIpAllowed('192.168.1.5', [], false)).toBeTruthy();
        expect(isIpAllowed('192.168.1.5', ['192.168.0.0/16'], false)).toBeFalsy();
    });
});

describe('is IP private', () => {
    test('ipv4 ranges are properly distinguished', () => {
        expect(isPrivate('127.0.0.1')).toBeTruthy();
        expect(isPrivate('127.127.127.127')).toBeTruthy();
        expect(isPrivate('169.254.169.254')).toBeTruthy();
        expect(isPrivate('8.8.8.8')).toBeFalsy();
    });

    test('ipv6 ranges are properly distinguished', () => {
        expect(isPrivate('::1')).toBeTruthy();
        expect(isPrivate('2001:4860:4860::8888')).toBeFalsy();
        expect(isPrivate('::0:1')).toBeTruthy();
        expect(isPrivate('0000:0000:0000:0000:0000:0000:0000:0001')).toBeTruthy();
        expect(isPrivate('0:0:0:0:0:0:0:0001')).toBeTruthy();
        expect(isPrivate('0:0:0:0:0:0:0:1')).toBeTruthy();
        expect(isPrivate('0::0:0:0:1')).toBeTruthy();
        expect(isPrivate('::0:0:0:1')).toBeTruthy();
        expect(isPrivate('fd00:ec2::254')).toBeTruthy();
    });
});