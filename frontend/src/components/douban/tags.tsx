import { useEffect, useState } from "react";

import { DoubanMovieItem, DoubanTVItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ProxyImage } from "../../../wailsjs/go/main/App";

// Global cache for images
const imageCache = new Map<string, string>();

const ImageTooltip = ({ imageUrl, alt }: { imageUrl: string; alt: string }) => {
  const [imageSrc, setImageSrc] = useState<string>(() => imageCache.get(imageUrl) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadImage = async () => {
    // Check cache first - before any state checks
    const cachedUrl = imageCache.get(imageUrl);
    if (cachedUrl) {
      setImageSrc(cachedUrl);
      return;
    }

    if (loading || error) return;

    setLoading(true);
    setError(false);
    try {
      const response = await ProxyImage(imageUrl);

      if (!response || !response.data || response.data.length === 0) {
        throw new Error('No image data received');
      }

      // Decode base64 string to binary data
      // Note: Wails incorrectly types this as number[] but it's actually a base64 string
      const binaryString = atob(response.data as unknown as string);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const mimeType = response.contentType || 'image/jpeg';

      const blob = new Blob([uint8Array], { type: mimeType });
      const url = URL.createObjectURL(blob);

      // Test if the blob is valid by trying to create an Image object
      const testImg = new Image();
      testImg.onload = () => {
        // Cache the blob URL
        imageCache.set(imageUrl, url);
        setImageSrc(url);
      };
      testImg.onerror = () => {
        setError(true);
        URL.revokeObjectURL(url);
      };
      testImg.src = url;
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Load image when component mounts (tooltip opens)
  useEffect(() => {
    loadImage();

    // Don't cleanup cached URLs - they might be used by other components
    return () => {
      // Only cleanup if it's not in cache (temporary URLs)
      if (imageSrc && !imageCache.has(imageUrl)) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);

  // No cleanup on imageSrc changes since we're using cache

  return (
    <div className="w-64 h-96">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-64 h-96 object-cover rounded"
          onLoad={() => {}}
          onError={() => {
            setError(true);
          }}
        />
      ) : loading ? (
        <div className="w-64 h-96 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      ) : error ? (
        <div className="w-64 h-96 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
          <div className="text-xs text-red-500">Failed</div>
        </div>
      ) : (
        <div className="w-64 h-96 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
          <div className="text-xs text-gray-400">Loading...</div>
        </div>
      )}
    </div>
  );
};

export const DoubanTags = () => {
  const [movies, setMovies] = useState<DoubanMovieItem[]>([]);
  const [tvs, setTvs] = useState<DoubanTVItem[]>([]);

  useEffect(() => {
    fetch("https://s1.m3u8.io/v1/douban")
      .then((res) => res.json())
      .then((json) => {
        const movies = json.data?.movies || [];
        const tvs = json.data?.tv || [];

        setMovies(movies);
        setTvs(tvs);
      })
      .catch(() => {
        // Handle error silently
      });
  }, []);

  return (
    <div className="px-2 sm:px-10 py-4 sm:py-8 overflow-visible flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          豆瓣热门电影
        </h2>
        <div className="flex flex-wrap gap-2">
          {movies.map((movie) => (
            <Tooltip key={movie.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-900 hover:text-white px-2 py-1 border-2 border-blue-300 dark:border-gray-700"
                  onClick={() => {
                    window.open(
                      `/search?keyword=${encodeURIComponent(movie.title)}`,
                      "_blank"
                    );
                  }}
                >
                  {`${movie.title} (${movie.rate})`}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-2">
                <ImageTooltip imageUrl={movie.cover} alt={movie.title} />
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          豆瓣热门电视剧
        </h2>
        <div className="flex flex-wrap gap-2">
          {tvs.map((tv) => (
            <Tooltip key={tv.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-900 hover:text-white px-2 py-1 border-2 border-blue-300 dark:border-gray-700"
                  onClick={() => {
                    window.open(
                      `/search?keyword=${encodeURIComponent(tv.title)}`,
                      "_blank"
                    );
                  }}
                >
                  {`${tv.title} (${tv.rating.value})`}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-2">
                <ImageTooltip imageUrl={tv.pic.normal} alt={tv.title} />
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};
