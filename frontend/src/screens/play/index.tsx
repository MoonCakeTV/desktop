import { useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Route } from "../../routes/play";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { VideoPlayer } from "../../components/mc-video-player";
import { useMediaDetails } from "../../hooks/use-media-details";

export function Play() {
  const navigate = useNavigate();
  const { mc_id } = Route.useSearch();
  const location = useLocation();

  // Get media from navigation state if available
  const mediaFromState = location.state?.mediaItem;

  // Only fetch from API if we don't have media data from navigation
  const {
    media: mediaFromApi,
    isLoading,
    error,
  } = useMediaDetails(mediaFromState ? "" : mc_id);

  const mediaItem = mediaFromState || mediaFromApi;

  // Track selected episode
  const episodes = mediaItem?.m3u8_urls
    ? Object.entries(mediaItem.m3u8_urls)
    : [];
  const [selectedEpisode, setSelectedEpisode] = useState<string>(
    episodes.length > 0 ? episodes[0][0] : ""
  );

  if (isLoading) {
    return (
      <div className="px-4 sm:px-10 py-4 sm:py-8 w-full min-h-full">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/search" })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Play</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !mediaItem) {
    return (
      <div className="px-4 sm:px-10 py-4 sm:py-8 w-full min-h-full">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/search" })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Play</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Media not found"}</p>
        </div>
      </div>
    );
  }

  let selectedUrl = episodes.find(([ep]) => ep === selectedEpisode)?.[1] || "";

  // Normalize URL: append /index.m3u8 if not already present
  if (selectedUrl && !selectedUrl.endsWith(".m3u8")) {
    selectedUrl = selectedUrl + "/index.m3u8";
  }

  return (
    <div className="px-4 sm:px-10 py-4 sm:py-8 w-full min-h-full text-black">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/search", search: { keyword: mediaItem?.title || "" } })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{mediaItem?.title || "Play"}</h1>
      </div>

      <div className="space-y-6">
        {selectedUrl ? (
          <VideoPlayer
            key={selectedEpisode}
            src={selectedUrl.trim()}
            poster={mediaItem?.poster}
            className="aspect-video max-w-5xl"
          />
        ) : (
          <div className="aspect-video max-w-5xl bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No video available</p>
          </div>
        )}

        <div className="max-w-5xl space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mediaItem?.year && (
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{mediaItem?.year}</p>
              </div>
            )}
            {mediaItem?.region && (
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-medium">{mediaItem?.region}</p>
              </div>
            )}
            {mediaItem?.category && (
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{mediaItem?.category}</p>
              </div>
            )}
            {mediaItem?.rating && (
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-medium">{mediaItem?.rating}/10</p>
              </div>
            )}
          </div>

          {episodes.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {episodes.map(([episode]) => (
                <Button
                  key={episode}
                  variant={episode === selectedEpisode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEpisode(episode)}
                  className="h-9"
                >
                  {episode}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
