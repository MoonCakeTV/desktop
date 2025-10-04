import { useState, useEffect } from "react";
import type { MediaItem } from "../components/mc-media-card";

interface UseMediaDetailsResult {
  media: MediaItem | null;
  isLoading: boolean;
  error: string | null;
}

export function useMediaDetails(mcId: string): UseMediaDetailsResult {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if mcId is empty
    if (!mcId) {
      setIsLoading(false);
      return;
    }

    async function fetchMediaDetails() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://s1.m3u8.io/v1/${mcId}`);
        const json = await res.json();

        if (json.code !== 200) {
          setError(json.message || "Failed to load media");
          setMedia(null);
          return;
        }

        const item = json.data;
        let m3u8_urls = {};
        try {
          if (item.m3u8_urls && typeof item.m3u8_urls === "string") {
            m3u8_urls = JSON.parse(item.m3u8_urls);
          }
        } catch (e) {
          console.warn(`Failed to parse m3u8_urls for ${item.mc_id}:`, e);
        }

        setMedia({
          mc_id: item.mc_id,
          title: item.title || "Unknown",
          poster: item.cover_image,
          year: item.year?.toString(),
          rating: item.rating,
          region: item.region,
          category: item.category,
          m3u8_urls,
        });
      } catch (err) {
        console.error("Failed to fetch media details:", err);
        setError("An error occurred while loading media");
        setMedia(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMediaDetails();
  }, [mcId]);

  return { media, isLoading, error };
}
