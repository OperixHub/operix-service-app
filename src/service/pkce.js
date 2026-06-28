function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function randomString(length = 64) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => ('0' + byte.toString(16)).slice(-2)).join('');
}

export async function createPkcePair() {
    const verifier = randomString(48);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));

    return {
        verifier,
        challenge: base64UrlEncode(digest),
    };
}
