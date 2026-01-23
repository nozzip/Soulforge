import React, { useState } from 'react';
import { Box, Skeleton, SxProps, Theme } from '@mui/material';

interface OptimizedImageProps {
    src: string;
    alt: string;
    sx?: SxProps<Theme>;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    loading?: 'lazy' | 'eager';
    onLoad?: () => void;
}

/**
 * OptimizedImage component with:
 * - Lazy loading by default
 * - Loading skeleton placeholder
 * - WebP format suggestion via srcset when available
 * - Responsive sizing
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    sx,
    aspectRatio,
    objectFit = 'cover',
    loading = 'lazy',
    onLoad
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Try to generate WebP version URL (works with services that support format conversion)
    const getWebPUrl = (url: string): string | null => {
        // For Google photos, we can append format parameter
        if (url.includes('googleusercontent.com')) {
            // Already supports WebP internally
            return null;
        }
        // For other URLs, check if they support WebP via URL params
        if (url.includes('cloudinary.com')) {
            return url.replace(/\.(jpg|jpeg|png)$/, '.webp');
        }
        return null;
    };

    const webpUrl = getWebPUrl(src);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true); // Stop showing skeleton
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: aspectRatio,
                overflow: 'hidden',
                bgcolor: 'grey.900',
                ...sx
            }}
        >
            {/* Loading skeleton */}
            {!isLoaded && (
                <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        height: '100%',
                        bgcolor: 'grey.800'
                    }}
                />
            )}

            {/* Error placeholder */}
            {hasError && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.900',
                        color: 'grey.600',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                    }}
                >
                    Imagen no disponible
                </Box>
            )}

            {/* Picture element for WebP support */}
            {!hasError && (
                <picture style={{ display: 'contents' }}>
                    {webpUrl && <source srcSet={webpUrl} type="image/webp" />}
                    <Box
                        component="img"
                        src={src}
                        alt={alt}
                        loading={loading}
                        onLoad={handleLoad}
                        onError={handleError}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit,
                            opacity: isLoaded ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out',
                        }}
                    />
                </picture>
            )}
        </Box>
    );
};

export default OptimizedImage;

// Also export a simpler background image version
export const OptimizedBackgroundImage: React.FC<{
    src: string;
    sx?: SxProps<Theme>;
    children?: React.ReactNode;
}> = ({ src, sx, children }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Preload the image
    React.useEffect(() => {
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.src = src;
    }, [src]);

    return (
        <Box
            sx={{
                position: 'relative',
                backgroundImage: isLoaded ? `url("${src}")` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.3s',
                '&::before': !isLoaded ? {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'grey.900',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.4 },
                        '50%': { opacity: 0.6 },
                    }
                } : undefined,
                ...sx
            }}
        >
            {children}
        </Box>
    );
};
