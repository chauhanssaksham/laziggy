export function getCountry(request: Request): string | undefined {
    return request.headers.get("x-test-country") ||
        request.headers.get("x-vercel-ip-country") || undefined;
}
