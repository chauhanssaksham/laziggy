interface VercelOptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    className?: string;
    style?: React.CSSProperties;
    onError?: React.ImgHTMLAttributes<HTMLImageElement>["onError"];
}

/**
 * Image component using Vercel's Image Optimization API
 * Auto WebP/AVIF, resizing, CDN cached
 * Falls back to original image in development
 */
export default function VercelOptimizedImage({
    src,
    alt,
    width = 1024,
    className,
    style,
    onError,
}: VercelOptimizedImageProps) {
    if (import.meta.env.DEV) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={style}
                loading="lazy"
                onError={onError}
            />
        );
    }

    // In production, use full URL for Vercel image optimization
    const fullUrl = src.startsWith("http") ? src : `${src}`;
    const optimizedSrc = `/_vercel/image?url=${encodeURIComponent(fullUrl)}&w=${width}&q=80`;

    return (
        <img
            src={optimizedSrc}
            alt={alt}
            className={className}
            style={style}
            loading="lazy"
            onError={onError}
        />
    );
}
