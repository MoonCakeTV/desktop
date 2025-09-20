import { useEffect, useState } from "react";

import { DoubanMovieItem, DoubanTVItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ProxyImage } from "../../../wailsjs/go/main/App";

const ImageTooltip = ({ imageUrl, alt }: { imageUrl: string; alt: string }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadImage = async () => {
    if (imageSrc || loading || error) return;

    setLoading(true);
    setError(false);
    try {
      console.log('Loading image:', imageUrl);
      const response = await ProxyImage(imageUrl);

      if (!response || !response.data || response.data.length === 0) {
        throw new Error('No image data received');
      }

      console.log('Received response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', response.data?.length);
      console.log('Content-Type from server:', response.contentType);

      // Check if response.data is actually an array
      if (Array.isArray(response.data)) {
        console.log('Data is array, first few elements:', response.data.slice(0, 10));
      } else {
        console.log('Data is not array, type:', typeof response.data);
        console.log('Data value:', response.data);
      }

      // Decode base64 string to binary data
      const binaryString = atob(response.data);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const mimeType = response.contentType || 'image/jpeg';

      console.log('Using MIME type:', mimeType);
      console.log('Uint8Array length:', uint8Array.length);
      console.log('First few bytes of uint8Array:', Array.from(uint8Array.slice(0, 10)));

      const blob = new Blob([uint8Array], { type: mimeType });
      console.log('Blob created:', blob);
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);

      const url = URL.createObjectURL(blob);

      // Test if the blob is valid by trying to create an Image object
      const testImg = new Image();
      testImg.onload = () => {
        console.log('Test image loaded successfully for:', imageUrl);
        setImageSrc(url);
      };
      testImg.onerror = () => {
        console.error('Test image failed to load for:', imageUrl);
        setError(true);
        URL.revokeObjectURL(url);
      };
      testImg.src = url;

      console.log('Image blob URL created:', url);
    } catch (error) {
      console.error('Failed to load image:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Load image when component mounts (tooltip opens)
  useEffect(() => {
    loadImage();

    // Cleanup blob URL when component unmounts
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);

  // Cleanup blob URL when imageSrc changes
  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  return (
    <div className="w-64 h-96">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-64 h-96 object-cover rounded"
          onLoad={() => console.log('Image onLoad fired for:', alt)}
          onError={(e) => {
            console.error('Image onError fired for:', alt, e);
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

        console.log('Movies data:', movies);
        console.log('TV data:', tvs);

        if (movies.length > 0) {
          console.log('Sample movie cover URL:', movies[0].cover);
        }
        if (tvs.length > 0) {
          console.log('Sample TV cover URL:', tvs[0].pic.normal);
        }

        setMovies(movies);
        setTvs(tvs);
      })
      .catch((err) => {
        console.error(err);
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
