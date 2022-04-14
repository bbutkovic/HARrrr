export function isValidUrl(url: string): boolean {
    try {
        const urlParsed = new URL(url);
        return urlParsed.protocol === "http:" || urlParsed.protocol === "https:";
    } catch (_) {
        return false;
    }
}