import { Play, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

export interface MediaItem {
  mc_id: string;
  title: string;
  poster?: string;
  year?: string;
  rating?: number;
  region?: string;
  category?: string;
  m3u8_urls?: Record<string, string>; // Parsed m3u8 URLs, e.g., {"正片": "https://..."}
}

interface MediaCardProps {
  mediaItem: MediaItem;
  onClick: () => void;
  className?: string;
}

export function MediaCard({ mediaItem, onClick, className }: MediaCardProps) {
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
          {mediaItem.poster ? (
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Rating badge on top right */}
          {mediaItem.rating && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs text-yellow-500 font-medium">
                {mediaItem.rating.toFixed(1)}
              </span>
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
