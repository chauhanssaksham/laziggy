export const SUPPORTED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
    "application/pdf",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

const MIME_TO_EXTENSION: Record<SupportedMimeType, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
    "application/pdf": "pdf",
};

const EXTENSION_TO_MIME: Record<string, SupportedMimeType> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
    pdf: "application/pdf",
};

export function isSupportedMimeType(type: string): type is SupportedMimeType {
    return SUPPORTED_MIME_TYPES.includes(type.toLowerCase() as SupportedMimeType);
}

export function getExtensionFromMimeType(mimeType: string): string {
    const normalized = mimeType.toLowerCase() as SupportedMimeType;
    return MIME_TO_EXTENSION[normalized] || "png";
}

export function getMimeTypeFromExtension(extension: string): SupportedMimeType | null {
    return EXTENSION_TO_MIME[extension.toLowerCase()] || null;
}

export function getMimeTypeFromPath(filePath: string): SupportedMimeType | null {
    const ext = filePath.split(".").pop()?.toLowerCase();
    return ext ? getMimeTypeFromExtension(ext) : null;
}
