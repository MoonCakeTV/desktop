import { Play, Star, Zap, Bookmark, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface MediaItem {
  mc_id: string;
  title: string;
  poster?: string;
  year?: string;
  rating?: number;
  region?: string;
  category?: string;
  m3u8_urls?: Record<string, string>; // Parsed m3u8 URLs, e.g., {"正片": "https://..."}
  isLoading?: boolean; // Indicates if the media data is being loaded
}

interface MediaCardProps {
  mediaItem: MediaItem;
  onClick: () => void;
  className?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (mcId: string) => void;
}

function getSpeedColor(speed: number): { text: string; icon: string } {
  if (speed >= 4) return { text: "text-green-500", icon: "fill-green-500 text-green-500" };
  if (speed >= 2) return { text: "text-yellow-500", icon: "fill-yellow-500 text-yellow-500" };
  return { text: "text-red-500", icon: "fill-red-500 text-red-500" };
}

function resolveUrl(baseUrl: string, maybeRelative: string): string {
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return maybeRelative;
  }
}

function pickFirstSegmentUrlFromMediaPlaylist(
  manifest: string,
  manifestUrl: string
): string | null {
  const lines = manifest.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    // First non-tag line in a media playlist should be a segment URI
    return resolveUrl(manifestUrl, line);
  }
  return null;
}

function pickFirstVariantPlaylistUrl(
  masterManifest: string,
  masterUrl: string
): string | null {
  const lines = masterManifest.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    return resolveUrl(masterUrl, line);
  }
  return null;
}

async function testMediaSpeed(
  m3u8_urls: Record<string, string>
): Promise<number> {
  const urls = Object.values(m3u8_urls);
  if (urls.length === 0) return Infinity;

  const BYTES_TO_FETCH = 512 * 1024; // 512KB
  const TIMEOUT_MS = 6000;

  // Test the first available URL to determine media item speed
  const url = urls[0];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Fetch the m3u8 playlist
    const manifestRes = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!manifestRes.ok) throw new Error("Failed to fetch manifest");
    const masterManifest = await manifestRes.text();

    let mediaPlaylistUrl = url;
    let segmentUrl: string | null = null;

    // Check if it's a master playlist
    if (/EXT-X-STREAM-INF/i.test(masterManifest)) {
      // It's a master playlist, get first variant
      const variantUrl = pickFirstVariantPlaylistUrl(masterManifest, url);
      if (!variantUrl) throw new Error("Variant playlist not found");
      mediaPlaylistUrl = variantUrl;

      const variantRes = await fetch(mediaPlaylistUrl, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!variantRes.ok) throw new Error("Failed to fetch variant");
      const variantManifest = await variantRes.text();

      segmentUrl = pickFirstSegmentUrlFromMediaPlaylist(
        variantManifest,
        mediaPlaylistUrl
      );
    } else {
      // It's a media playlist
      segmentUrl = pickFirstSegmentUrlFromMediaPlaylist(
        masterManifest,
        mediaPlaylistUrl
      );
    }

    if (!segmentUrl) throw new Error("Segment not found");

    // Now test speed by downloading part of the actual video segment
    const start = Date.now();
    const segmentRes = await fetch(segmentUrl, {
      method: "GET",
      headers: { Range: `bytes=0-${BYTES_TO_FETCH - 1}` },
      cache: "no-store",
      signal: controller.signal,
    });

    if (
      !segmentRes.ok &&
      segmentRes.status !== 206 &&
      segmentRes.status !== 200
    ) {
      throw new Error(`Segment fetch failed: ${segmentRes.status}`);
    }

    const arrayBuf = await segmentRes.arrayBuffer();
    const durationMs = Date.now() - start;
    const bytesRead = arrayBuf.byteLength;

    clearTimeout(timeoutId);

    if (durationMs === 0 || bytesRead === 0) {
      return Infinity;
    }

    const bytesPerSec = (bytesRead / durationMs) * 1000;
    const mbPerSec = bytesPerSec / (1024 * 1024);

    return mbPerSec;
  } catch (error) {
    console.error("Speed test error:", error);
    return Infinity;
  }
}

export function MediaCard({
  mediaItem,
  onClick,
  className,
  isBookmarked = false,
  onBookmarkToggle
}: MediaCardProps) {
  const [loadSpeed, setLoadSpeed] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Skip speed test if item is still loading
    if (mediaItem.isLoading) return;

    if (mediaItem.m3u8_urls && Object.keys(mediaItem.m3u8_urls).length > 0) {
      setIsTesting(true);
      testMediaSpeed(mediaItem.m3u8_urls)
        .then((speed) => {
          if (speed === Infinity) {
            setHasError(true);
          } else {
            setLoadSpeed(speed);
          }
        })
        .finally(() => {
          setIsTesting(false);
        });
    }
  }, [mediaItem.m3u8_urls, mediaItem.isLoading]);
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer group transition-all hover:scale-105 overflow-hidden",
        className,
        "pt-0 pb-2"
      )}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-slate-100">
          {mediaItem.isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
          ) : mediaItem.poster ? (
            <img
              src={mediaItem.poster}
              alt={mediaItem.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
              <Play className="w-12 h-12" />
            </div>
          )}
          {/* Overlay gradient on hover */}
          {!mediaItem.isLoading && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}

          {/* Bookmark icon on top right */}
          {onBookmarkToggle && !mediaItem.isLoading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(mediaItem.mc_id);
              }}
              className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded p-1.5 hover:bg-black/90 transition-colors z-10"
            >
              <Bookmark
                className={cn(
                  "h-4 w-4",
                  isBookmarked
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-white"
                )}
              />
            </button>
          )}

          {/* Rating badge below bookmark */}
          {mediaItem.rating && !mediaItem.isLoading && (
            <div className={cn(
              "absolute right-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-0.5",
              onBookmarkToggle ? "top-12" : "top-2"
            )}>
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs text-yellow-500 font-medium">
                {mediaItem.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Speed test badge on top left */}
          {loadSpeed !== null && !mediaItem.isLoading && (
            <div
              className={cn(
                "absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1",
                getSpeedColor(loadSpeed).text
              )}
            >
              <Zap
                className={cn(
                  "h-4 w-4",
                  getSpeedColor(loadSpeed).icon
                )}
              />
              <span className="text-sm font-semibold">
                {loadSpeed.toFixed(1)} MB/s
              </span>
            </div>
          )}

          {/* Error badge */}
          {hasError && !mediaItem.isLoading && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
              <Zap className="h-4 w-4 fill-red-500 text-red-500" />
              <span className="text-sm font-semibold text-red-500">错误</span>
            </div>
          )}

          {/* Testing indicator */}
          {isTesting && !mediaItem.isLoading && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-0.5">
              <Zap className="h-3 w-3 text-gray-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">测速中</span>
            </div>
          )}
        </div>
        <div className="p-2 space-y-1">
          <h3
            className="font-medium text-sm line-clamp-2"
            title={mediaItem.title}
          >
            {mediaItem.title}
          </h3>

          {/* Year and Region */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {mediaItem.year && <span>{mediaItem.year}</span>}
            {mediaItem.year && mediaItem.region && <span>·</span>}
            {mediaItem.region && <span>{mediaItem.region}</span>}
          </div>

          {/* Category */}
          {mediaItem.category && (
            <div className="flex flex-wrap gap-0.5">
              {mediaItem.category.split(/[,，]/).map((cat, index) => (
                <span
                  key={index}
                  className="inline-block px-1 py-0 text-xs bg-slate-100 text-slate-600 rounded"
                >
                  {cat.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
