import { getDbClient } from "@/server/infra/db/supabase.server";
import { getExtensionFromMimeType, isSupportedMimeType } from "@/shared/lib/mime-types";
import { nanoid } from "nanoid";
import { InternalError, ValidationError } from "@/shared/lib/errors";

const BUCKET_NAME = "uploads";

interface SignedUploadUrlResult {
    uploadId: string;
    signedUrl: string;
    path: string;
}

/**
 * Creates a signed URL for uploading a file to Supabase Storage.
 */
export async function createSignedUploadUrl(
    mimeType: string
): Promise<SignedUploadUrlResult> {
    if (!isSupportedMimeType(mimeType)) {
        throw new ValidationError(`Unsupported file type: ${mimeType}. Supported types: image/png, image/jpeg, image/webp`);
    }

    const uploadId = nanoid(12);
    const extension = getExtensionFromMimeType(mimeType);
    const path = `menus/${uploadId}.${extension}`;

    const supabase = getDbClient();

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(path);

    if (error) {
        throw new InternalError("Failed to create signed upload URL", { cause: error });
    }

    return {
        uploadId,
        signedUrl: data.signedUrl,
        path,
    };
}

/**
 * Upload a Buffer directly from the server to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadBuffer(
    path: string,
    buffer: Buffer,
    contentType: string
): Promise<string> {
    const supabase = getDbClient();
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, { contentType, upsert: true });
    if (error) throw new InternalError("Failed to upload", { cause: error });
    return getPublicUrlFromPath(path);
}

/**
 * Get public URL from storage path.
 */
export function getPublicUrlFromPath(path: string): string {
    const supabase = getDbClient();
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);
    return data.publicUrl;
}

export { BUCKET_NAME };
