/**
 * Copy to clipboard button with visual feedback.
 */

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/client/components/ui/shadcn/button";
import { cn } from "@/client/lib/utils";
import { logger } from "@/client/lib/telemetry/logger.client";

interface CopyButtonProps {
    text: string;
    className?: string;
    variant?: "ghost" | "outline" | "default";
    size?: "sm" | "default" | "lg" | "icon";
}

export function CopyButton({ text, className, variant = "ghost", size = "sm" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            logger.error("clipboard copy failed", error);
        }
    }, [text]);

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={cn("shrink-0", className)}
        >
            {copied ? (
                <Check className="w-4 h-4 text-brand-accent" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </Button>
    );
}

export default CopyButton;
