"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/components/ui/utils';

interface AppImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

// Custom loader for Unsplash images (adjust if you use a different source)
const imageLoader = ({ src, width, quality = 75 }: { src: string; width: number; quality?: number }) => {
  if (src.startsWith('http')) return src;
  return `https://source.unsplash.com/${width}x${width}/?${encodeURIComponent(src)}&q=${quality}`;
};

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4K';

export function AppImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  sizes,
  priority = false,
  unoptimized = false,
}: AppImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn('inline-block bg-gray-100 text-center align-middle', className)}
        style={width && height ? { width, height } : undefined}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt={alt} />
        </div>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: cn('object-cover', className),
    onError: () => setError(true),
    loader: imageLoader,
    unoptimized,
    priority,
  };

  if (fill) {
    return <Image {...imageProps} fill sizes={sizes} />;
  }

  if (width && height) {
    return <Image {...imageProps} width={width} height={height} />;
  }

  // Fallback: use fill if no dimensions
  return <Image {...imageProps} fill sizes={sizes} />;
}