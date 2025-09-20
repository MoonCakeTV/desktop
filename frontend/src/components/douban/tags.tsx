import { useEffect, useState } from "react";

import { DoubanMovieItem, DoubanTVItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ProxyImage } from "../../../wailsjs/go/main/App";

// Global store for preloaded images
const preloadedImages = new Map<string, string>();

const ImageTooltip = ({ imageUrl, alt, imagesLoaded }: { imageUrl: string; alt: string; imagesLoaded: boolean }) => {
  const imageSrc = preloadedImages.get(imageUrl) || "";

  return (
    <div className="w-64 h-96">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-64 h-96 object-cover rounded"
        />
      ) : (
        <div className="w-64 h-96 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <div className="text-xs text-gray-500">
            {imagesLoaded ? "Failed" : "Loading..."}
          </div>
        </div>
      )}
    </div>
  );
};

const preloadImage = async (imageUrl: string): Promise<void> => {
  try {
    const response = await ProxyImage(imageUrl);

    if (!response || !response.data || response.data.length === 0) {
      return;
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

    // Test if the blob is valid
    return new Promise((resolve) => {
      const testImg = new Image();
      testImg.onload = () => {
        preloadedImages.set(imageUrl, url);
        resolve();
      };
      testImg.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      testImg.src = url;
    });
  } catch (error) {
    // Handle error silently
  }
};

export const DoubanTags = () => {
  const [movies, setMovies] = useState<DoubanMovieItem[]>([]);
  const [tvs, setTvs] = useState<DoubanTVItem[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    fetch("https://s1.m3u8.io/v1/douban")
      .then((res) => res.json())
      .then(async (json) => {
        const movies = json.data?.movies || [];
        const tvs = json.data?.tv || [];

        setMovies(movies);
        setTvs(tvs);

        // Preload all images
        const imageUrls = [
          ...movies.map((movie: DoubanMovieItem) => movie.cover),
          ...tvs.map((tv: DoubanTVItem) => tv.pic.normal)
        ];

        // Load images in parallel
        await Promise.allSettled(imageUrls.map(preloadImage));
        setImagesLoaded(true);
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
                <ImageTooltip imageUrl={movie.cover} alt={movie.title} imagesLoaded={imagesLoaded} />
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
                <ImageTooltip imageUrl={tv.pic.normal} alt={tv.title} imagesLoaded={imagesLoaded} />
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};
